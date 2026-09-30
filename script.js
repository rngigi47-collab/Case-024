
(() => {
  const stages = [...document.querySelectorAll(".stage")];
  const continueBtn = document.getElementById("continueBtn");
  const keysForm = document.getElementById("keysForm");
  const keysFeedback = document.getElementById("keysFeedback");
  const deductionForm = document.getElementById("deductionForm");
  const deductionFeedback = document.getElementById("deductionFeedback");
  const openBookBtn = document.getElementById("openBookBtn");
  const soundToggle = document.getElementById("soundToggle");

  let audioCtx = null, masterGain = null, nodes = [], soundOn = false;

  function showStage(id) {
    stages.forEach(stage => stage.classList.toggle("active", stage.id === id));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function normalize(value) {
    return value.trim().toUpperCase().replace(/\s+/g, " ");
  }

  function startSound() {
    if (soundOn) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) {
      soundToggle.textContent = "♪ SOUND UNAVAILABLE";
      soundToggle.disabled = true;
      return;
    }
    audioCtx = audioCtx || new AC();
    if (audioCtx.state === "suspended") audioCtx.resume();

    masterGain = audioCtx.createGain();
    masterGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    masterGain.gain.exponentialRampToValueAtTime(0.045, audioCtx.currentTime + 1.4);
    masterGain.connect(audioCtx.destination);

    const filter = audioCtx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 420;
    filter.connect(masterGain);

    [[43.65,"sine",0.65],[65.41,"triangle",0.15],[87.31,"sine",0.05]].forEach(([f,t,g])=>{
      const o=audioCtx.createOscillator(), ga=audioCtx.createGain();
      o.type=t; o.frequency.value=f; ga.gain.value=g;
      o.connect(ga).connect(filter); o.start(); nodes.push(o);
    });

    soundOn = true;
    soundToggle.setAttribute("aria-pressed","true");
    soundToggle.textContent = "♪ SOUND: ON";
  }

  function stopSound() {
    if (!soundOn || !audioCtx || !masterGain) return;
    const now = audioCtx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(Math.max(masterGain.gain.value,0.0001), now);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + .5);
    setTimeout(()=>nodes.forEach(n=>{try{n.stop()}catch(e){}}),600);
    nodes=[]; soundOn=false;
    soundToggle.setAttribute("aria-pressed","false");
    soundToggle.textContent = "♪ SOUND: OFF";
  }

  soundToggle.addEventListener("click",()=>soundOn?stopSound():startSound());

  continueBtn.addEventListener("click", () => {
    if (!soundOn) startSound();
    showStage("keysStage");
  });

  keysForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const k1 = normalize(document.getElementById("key1").value);
    const k2 = normalize(document.getElementById("key2").value);
    const k3 = normalize(document.getElementById("key3").value);

    const correct = k1 === "MOTIVE" && k2 === "FEAR" && k3 === "BECOMING";

    if (correct) {
      keysFeedback.textContent = "ALL THREE KEYS VERIFIED.";
      keysFeedback.className = "feedback good";
      setTimeout(()=>showStage("deductionStage"),700);
    } else {
      keysFeedback.textContent = "KEY VERIFICATION FAILED. Check the words recovered from Files 01–03.";
      keysFeedback.className = "feedback bad";
    }
  });

  deductionForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const selected = deductionForm.querySelector('input[name="deduction"]:checked');

    if (!selected) {
      deductionFeedback.textContent = "Select an answer before submitting.";
      deductionFeedback.className = "feedback bad";
      return;
    }

    if (selected.value === "HUMAN NATURE") {
      deductionFeedback.textContent = "FINAL ACCESS VERIFIED.";
      deductionFeedback.className = "feedback good";
      deductionForm.querySelectorAll("input,button").forEach(el => el.disabled = true);
      setTimeout(()=>showStage("activationStage"),700);
    } else {
      deductionFeedback.textContent = "NOT QUITE. Reconsider how motive, fear and becoming connect.";
      deductionFeedback.className = "feedback bad";
    }
  });

  openBookBtn.addEventListener("click", () => showStage("bookStage"));
})();
