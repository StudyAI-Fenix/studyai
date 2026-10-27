const STORAGE_KEY = "studyai-demo-v1";
const starterTasks = [
  { id: 1, text: "Review class notes for 15 minutes", done: false },
  { id: 2, text: "Complete one practice question", done: false },
  { id: 3, text: "Write down one thing I learned", done: false }
];
let tasks = loadTasks();
let nextId = Math.max(0, ...tasks.map(task => task.id)) + 1;
let focusSeconds = 25 * 60;
let chosenMinutes = 25;
let timerInterval = null;
let sessionSeconds = 0;
let toastTimeout;

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : starterTasks.map(task => ({...task}));
  } catch (error) {
    return starterTasks.map(task => ({...task}));
  }
}
function saveTasks() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); } catch (error) {}
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), 2400);
}
function renderTasks() {
  const dashboard = document.getElementById("dashboard-tasks");
  const all = document.getElementById("all-tasks");
  const makeRow = task => `<div class="task-row ${task.done ? "done" : ""}">
    <input class="task-check" type="checkbox" data-task-id="${task.id}" aria-label="Mark ${escapeHtml(task.text)} complete" ${task.done ? "checked" : ""}>
    <span class="task-name">${escapeHtml(task.text)}</span>
    <span class="xp-tag">${task.done ? "✓ DONE" : "+10 XP"}</span>
    <button class="delete-task" data-delete-id="${task.id}" aria-label="Delete task">×</button>
  </div>`;
  const openTasks = tasks.filter(task => !task.done);
  dashboard.innerHTML = openTasks.length ? openTasks.slice(0, 3).map(makeRow).join("") : '<div class="empty-state">All missions complete! Add a new one to keep going ✦</div>';
  all.innerHTML = tasks.length ? tasks.map(makeRow).join("") : '<div class="empty-state">No missions yet. Add your first task above.</div>';
  document.getElementById("completed-stat").textContent = tasks.filter(task => task.done).length;
  document.getElementById("xp-stat").textContent = tasks.filter(task => task.done).length * 10;
}
function navigate(target) {
  document.querySelectorAll(".page-section").forEach(section => section.classList.toggle("hidden", section.id !== target));
  document.querySelectorAll(".nav-link").forEach(link => link.classList.toggle("active", link.dataset.target === target));
  const titles = { dashboard: "Your study dashboard", missions: "Your study missions", tutor: "Your AI study buddy", focus: "Focus mode", pdfs: "Your PDF library" };
  document.getElementById("page-title").innerHTML = `${titles[target] || titles.dashboard}<span class="title-dot">.</span>`;
  window.scrollTo({top: 0, behavior: "smooth"});
}
document.querySelectorAll(".nav-link").forEach(button => button.addEventListener("click", () => navigate(button.dataset.target)));
document.querySelectorAll("[data-jump]").forEach(button => button.addEventListener("click", () => navigate(button.dataset.jump)));

document.getElementById("task-form").addEventListener("submit", event => {
  event.preventDefault();
  const input = document.getElementById("task-input");
  const text = input.value.trim();
  if (!text) return;
  tasks.unshift({id: nextId++, text, done: false});
  saveTasks();
  renderTasks();
  input.value = "";
  showToast("Mission added to your quest log!");
});
document.addEventListener("change", event => {
  if (!event.target.matches(".task-check")) return;
  const id = Number(event.target.dataset.taskId);
  const task = tasks.find(item => item.id === id);
  if (!task) return;
  task.done = event.target.checked;
  saveTasks();
  renderTasks();
  if (task.done) showToast("Mission complete! +10 XP ✦");
});
document.addEventListener("click", event => {
  const button = event.target.closest("[data-delete-id]");
  if (!button) return;
  const id = Number(button.dataset.deleteId);
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  renderTasks();
  showToast("Mission removed.");
});

const explanations = [
  { terms: ["photosynthesis", "plant"], title: "Photosynthesis", body: "Photosynthesis is the process plants use to make their own food. They use light energy, water, and carbon dioxide to produce glucose (a sugar) and release oxygen.\n\nRemember it as: light + water + carbon dioxide → glucose + oxygen.\n\nQuick check: Which gas do plants take in during photosynthesis?" },
  { terms: ["fraction", "fractions"], title: "Fractions", body: "A fraction represents part of a whole. The top number is the numerator; the bottom number is the denominator. For example, 3/4 means three of four equal parts.\n\nTip: To add fractions with the same denominator, add the numerators and keep the denominator.\n\nQuick check: In 2/5, what is the denominator?" },
  { terms: ["solar system", "planet", "space"], title: "The solar system", body: "Our solar system contains the Sun and the objects that orbit it, including eight planets, dwarf planets, moons, asteroids, and comets.\n\nThe eight planets in order from the Sun are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, and Neptune.\n\nQuick check: Which planet is known for its prominent rings?" },
  { terms: ["javascript", "coding", "programming"], title: "Programming basics", body: "Programming means writing instructions a computer can follow. JavaScript is a programming language often used to make websites interactive.\n\nA variable stores a value. A function groups instructions that can be run when needed. An event listener lets your code respond to an action, such as a button click.\n\nQuick check: What is one reason to use a function?" },
  { terms: ["gravity", "force"], title: "Gravity", body: "Gravity is an attractive force between objects that have mass. Earth's gravity pulls objects toward its centre and keeps us on the ground. Gravity also helps keep planets in orbit around the Sun.\n\nQuick check: What force helps keep the Moon in orbit around Earth?" },
  { terms: ["water cycle", "evaporation"], title: "The water cycle", body: "The water cycle describes how water moves around Earth. Sunlight causes evaporation, water vapour cools and condenses into clouds, and precipitation returns water to the surface. Water can then collect in rivers, lakes, and oceans.\n\nQuick check: What is the process called when water vapour cools and forms droplets?" }
];
document.getElementById("tutor-form").addEventListener("submit", event => {
  event.preventDefault();
  const topic = document.getElementById("topic-input").value.trim();
  const output = document.getElementById("tutor-output");
  const normalized = topic.toLowerCase();
  const match = explanations.find(item => item.terms.some(term => normalized.includes(term)));
  let title, body;
  if (match) {
    title = match.title;
    body = match.body;
  } else {
    title = `Study plan: ${topic}`;
    body = `Let's break "${topic}" into manageable steps:\n\n1. Write down what you already know about the topic.\n2. Find three key words and explain each in your own words.\n3. Review your class notes or textbook for the main ideas.\n4. Make two practice questions and try answering them without looking.\n\nQuick check: Can you explain ${topic} in one sentence? If you share your class notes, you can use them to make this study plan more specific.`;
  }
  output.innerHTML = `<div class="output-icon">✧</div><strong>${escapeHtml(title)}</strong><p>${escapeHtml(body)}</p>`;
});

function updateTimerDisplay() {
  const minutes = Math.floor(focusSeconds / 60).toString().padStart(2, "0");
  const seconds = (focusSeconds % 60).toString().padStart(2, "0");
  document.getElementById("timer-display").textContent = `${minutes}:${seconds}`;
  const progress = 1 - focusSeconds / (chosenMinutes * 60);
  const angle = Math.max(0, Math.min(360, progress * 360));
  document.querySelector(".timer-ring").style.background = `conic-gradient(var(--cyan) ${angle}deg, #7d6dff ${angle}deg, #202940 ${angle}deg)`;
}
function stopTimer() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}
document.getElementById("start-timer").addEventListener("click", () => {
  if (timerInterval) return;
  if (focusSeconds <= 0) focusSeconds = chosenMinutes * 60;
  document.getElementById("timer-message").textContent = "Focus session in progress. You've got this!";
  timerInterval = setInterval(() => {
    if (focusSeconds > 0) {
      focusSeconds--;
      sessionSeconds++;
      document.getElementById("minutes-stat").innerHTML = `${Math.floor(sessionSeconds / 60)} <small>min</small>`;
      updateTimerDisplay();
    } else {
      stopTimer();
      document.getElementById("timer-message").textContent = "Session complete! Take a short break and celebrate your focus.";
      showToast("Focus session complete! Great work ✦");
    }
  }, 1000);
});
document.getElementById("pause-timer").addEventListener("click", () => {
  stopTimer();
  document.getElementById("timer-message").textContent = "Timer paused. Press Start when you're ready.";
});
document.getElementById("reset-timer").addEventListener("click", () => {
  stopTimer();
  focusSeconds = chosenMinutes * 60;
  updateTimerDisplay();
  document.getElementById("timer-message").textContent = "Timer reset. Ready for a fresh start.";
});
document.querySelectorAll(".duration-btn").forEach(button => button.addEventListener("click", () => {
  stopTimer();
  chosenMinutes = Number(button.dataset.minutes);
  focusSeconds = chosenMinutes * 60;
  document.querySelectorAll(".duration-btn").forEach(item => item.classList.toggle("selected", item === button));
  document.getElementById("timer-message").textContent = "Session length updated. Press Start when ready.";
  updateTimerDisplay();
}));

renderTasks();
updateTimerDisplay();


// PDF Study Lab: extract text locally, then create basic study materials from that text.
let currentPdfUrl = null;
let extractedPdfText = "";
let quizState = [];
const pdfInput = document.getElementById("pdf-input");
const pdfStatus = document.getElementById("pdf-status");
const pdfTools = document.getElementById("pdf-tools");
const pdfViewerWrap = document.getElementById("pdf-viewer-wrap");
const pdfViewer = document.getElementById("pdf-viewer");
const pdfFileName = document.getElementById("pdf-file-name");
const pdfResult = document.getElementById("pdf-result");
const extractedTextBox = document.getElementById("pdf-extracted-text");

function setPdfStatus(message, kind = "") {
  pdfStatus.textContent = message;
  pdfStatus.className = `pdf-status muted ${kind}`;
}
function clearSelectedPdf() {
  if (currentPdfUrl) URL.revokeObjectURL(currentPdfUrl);
  currentPdfUrl = null;
  extractedPdfText = "";
  pdfViewer.removeAttribute("src");
  pdfViewerWrap.classList.add("hidden");
  pdfTools.classList.add("hidden");
  pdfResult.innerHTML = '<p class="muted">Choose an action to create study material from your PDF.</p>';
  extractedTextBox.textContent = "";
  pdfInput.value = "";
  setPdfStatus("No PDF selected yet.");
}
function splitSentences(text) {
  return text.replace(/\s+/g, " ").split(/(?<=[.!?])\s+(?=[A-Z0-9])/).map(s => s.trim()).filter(s => s.length > 35 && s.length < 500);
}
function cleanSentence(s) { return s.replace(/\s+/g, " ").replace(/^[•\-*\d.)\s]+/, "").trim(); }
function getKeywords(text, limit = 12) {
  const stop = new Set(("about after again against also among another any are because been before being between both but can could did does each from have having here how into its itself just more most other our out over same should some such than that the their them then there these they this those through under until very was were what when where which while with would your you use using used into onto based shown figure table section chapter example including include" ).split(/\s+/));
  const counts = new Map();
  (text.toLowerCase().match(/[a-z][a-z-]{3,}/g) || []).forEach(word => {
    if (!stop.has(word)) counts.set(word, (counts.get(word) || 0) + 1);
  });
  return [...counts.entries()].sort((a,b) => b[1]-a[1]).slice(0,limit).map(([word]) => word);
}
function makeSummary() {
  const sentences = splitSentences(extractedPdfText).map(cleanSentence);
  const keywords = getKeywords(extractedPdfText, 8);
  if (!sentences.length) {
    pdfResult.innerHTML = '<h4>Summary</h4><p>Not enough readable text was found in this PDF. Try a text-based PDF rather than a scanned image.</p>';
    return;
  }
  const selected = sentences.slice(0, Math.min(8, Math.max(3, Math.ceil(sentences.length * 0.18))));
  pdfResult.innerHTML = `<h4>Study summary</h4><p>${selected.map(escapeHtml).join(" ")}</p><h4>Key terms</h4><p>${keywords.map(escapeHtml).join(" · ") || "No key terms found"}</p><p class="small muted">Auto-generated from the opening sections of your PDF. Review the full document for details.</p>`;
}
function makeFlashcards() {
  const sentences = splitSentences(extractedPdfText).map(cleanSentence);
  const keywords = getKeywords(extractedPdfText, 15);
  if (!sentences.length) {
    pdfResult.innerHTML = '<h4>Flashcards</h4><p>Not enough readable text was found to make flashcards.</p>';
    return;
  }
  const cards = [];
  keywords.forEach(word => {
    const sentence = sentences.find(s => new RegExp(`\\b${word.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&")}\\b`, "i").test(s));
    if (sentence && cards.length < 10) {
      const answer = sentence.length > 230 ? sentence.slice(0, 227) + "…" : sentence;
      cards.push({front: `What does “${word}” mean or relate to?`, back: answer});
    }
  });
  if (!cards.length) sentences.slice(0,8).forEach((sentence,i) => cards.push({front:`What is an important point from the notes? (${i+1})`,back:sentence}));
  pdfResult.innerHTML = `<h4>Flashcards · ${cards.length} cards</h4><p class="muted">Click each card to reveal or hide the answer.</p>` + cards.map((card,i) => `<div class="flashcard" tabindex="0" role="button" data-card-index="${i}"><span class="card-label">CARD ${i+1} · QUESTION</span><strong>${escapeHtml(card.front)}</strong><span class="card-hint">Click to reveal answer</span><p class="card-answer hidden">${escapeHtml(card.back)}</p></div>`).join("");
  pdfResult.querySelectorAll(".flashcard").forEach(card => {
    const flip = () => { const answer = card.querySelector(".card-answer"); answer.classList.toggle("hidden"); card.querySelector(".card-label").textContent = answer.classList.contains("hidden") ? `CARD ${Number(card.dataset.cardIndex)+1} · QUESTION` : "ANSWER"; card.querySelector(".card-hint").textContent = answer.classList.contains("hidden") ? "Click to reveal answer" : "Click to hide answer"; };
    card.addEventListener("click", flip);
    card.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); } });
  });
}
function makeQuiz() {
  const sentences = splitSentences(extractedPdfText).map(cleanSentence);
  const keywords = getKeywords(extractedPdfText, 25);
  const candidates = [];
  for (const sentence of sentences) {
    const word = keywords.find(w => new RegExp(`\\b${w}\\b`, "i").test(sentence) && sentence.length < 260);
    if (!word) continue;
    const question = sentence.replace(new RegExp(`\\b${word}\\b`, "i"), "________");
    const distractors = keywords.filter(w => w !== word && !sentence.toLowerCase().includes(w)).slice(0,3);
    if (distractors.length < 3) continue;
    const options = [word, ...distractors].sort(() => Math.random() - 0.5);
    candidates.push({question, answer:word, options});
    if (candidates.length >= 5) break;
  }
  if (!candidates.length) {
    pdfResult.innerHTML = '<h4>Quiz</h4><p>There is not enough readable text to generate a quiz. Try a longer text-based PDF.</p>';
    return;
  }
  quizState = candidates.map((q,i) => ({...q, answered:false}));
  renderQuiz();
}
function renderQuiz() {
  const score = quizState.filter(q => q.answered && q.selected === q.answer).length;
  const done = quizState.filter(q => q.answered).length;
  pdfResult.innerHTML = `<h4>PDF quiz</h4><p>Choose the missing key word. Score: <strong>${score}/${quizState.length}</strong> · Answered: ${done}/${quizState.length}</p>` + quizState.map((q,i) => `<div class="quiz-question"><p><strong>${i+1}. ${escapeHtml(q.question)}</strong></p>${q.options.map(option => `<button type="button" class="quiz-option ${q.answered && option===q.answer ? "correct" : q.answered && option===q.selected ? "incorrect" : ""}" data-q="${i}" data-option="${escapeHtml(option)}" ${q.answered ? "disabled" : ""}>${escapeHtml(option)}</button>`).join("")}${q.answered ? `<p class="small ${q.selected===q.answer ? "" : "muted"}">${q.selected===q.answer ? "Correct!" : `Correct answer: ${escapeHtml(q.answer)}`}</p>` : ""}</div>`).join("") + (done===quizState.length ? '<p><strong>Quiz complete!</strong> Review the missed terms in your PDF.</p><button class="secondary-btn" id="retry-quiz" type="button">Try again</button>' : "");
  pdfResult.querySelectorAll(".quiz-option").forEach(button => button.addEventListener("click", () => {
    const q = quizState[Number(button.dataset.q)]; if (!q || q.answered) return;
    q.selected = button.dataset.option; q.answered = true; renderQuiz();
  }));
  const retry = document.getElementById("retry-quiz");
  if (retry) retry.addEventListener("click", makeQuiz);
}

pdfInput.addEventListener("change", async () => {
  const file = pdfInput.files && pdfInput.files[0];
  if (!file) return;
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    clearSelectedPdf(); setPdfStatus("Please choose a PDF file.", "error"); showToast("That file is not a PDF."); return;
  }
  if (!window.pdfjsLib) {
    setPdfStatus("PDF text extraction needs an internet connection to load the PDF reader library. Connect to the internet and refresh the app.", "error");
    return;
  }
  if (currentPdfUrl) URL.revokeObjectURL(currentPdfUrl);
  currentPdfUrl = URL.createObjectURL(file);
  pdfViewer.src = currentPdfUrl;
  pdfFileName.textContent = file.name;
  pdfViewerWrap.classList.remove("hidden");
  pdfTools.classList.add("hidden");
  setPdfStatus(`Reading PDF text… ${(file.size / (1024 * 1024)).toFixed(2)} MB`);
  try {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const data = new Uint8Array(await file.arrayBuffer());
    const doc = await window.pdfjsLib.getDocument({data}).promise;
    const pageTexts = [];
    for (let pageNum = 1; pageNum <= doc.numPages; pageNum++) {
      const page = await doc.getPage(pageNum);
      const content = await page.getTextContent();
      pageTexts.push(content.items.map(item => item.str).join(" "));
    }
    extractedPdfText = pageTexts.join("\n\n").trim();
    if (!extractedPdfText) {
      setPdfStatus("PDF opened, but no selectable text was found. It may be a scanned PDF; this demo does not include OCR.", "error");
      pdfTools.classList.add("hidden"); return;
    }
    extractedTextBox.textContent = extractedPdfText;
    pdfTools.classList.remove("hidden");
    setPdfStatus(`Ready! Extracted text from ${doc.numPages} page(s). Make a summary, quiz, or flashcards below.`, "success");
    pdfResult.innerHTML = '<p class="muted">PDF text extracted. Choose an action to create study material from your document.</p>';
    showToast("PDF text extracted successfully!");
  } catch (error) {
    console.error(error);
    setPdfStatus("Could not read this PDF. Try another file and make sure you are connected to the internet.", "error");
  }
});
document.getElementById("make-summary").addEventListener("click", makeSummary);
document.getElementById("make-quiz").addEventListener("click", makeQuiz);
document.getElementById("make-cards").addEventListener("click", makeFlashcards);
document.getElementById("remove-pdf").addEventListener("click", clearSelectedPdf);
window.addEventListener("beforeunload", () => { if (currentPdfUrl) URL.revokeObjectURL(currentPdfUrl); });
