// Elemen
const menu = document.getElementById("menu");
const game = document.getElementById("game");
const popup = document.getElementById("popup");
const questionEl = document.getElementById("question");
const feedback = document.getElementById("feedback");
const ball = document.getElementById("ball");
const roundEl = document.getElementById("round");
const score1El = document.getElementById("score1");
const score2El = document.getElementById("score2");

// State game
let soal = [];
let totalSoal = 5;
let current = 0;
let score1 = 0;
let score2 = 0;
let jawabanBenar = 0;
let leftSubmitted = false;
let rightSubmitted = false;
let leftValue = null;
let rightValue = null;
let firstSubmitTimer = null;
const WAIT_MS = 1500;

// Generate soal
function generateSoal(level, jumlah) {
  const arr = [];
  for (let i = 0; i < jumlah; i++) {
    let a, b, op;
    if (level === "sd") {
      a = Math.floor(Math.random() * 10) + 1;
      b = Math.floor(Math.random() * 10) + 1;
      op = ["+", "-"][Math.floor(Math.random() * 2)];
    } else if (level === "smp") {
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      op = ["+", "-", "*"][Math.floor(Math.random() * 3)];
    } else {
      a = Math.floor(Math.random() * 50) + 1;
      b = Math.floor(Math.random() * 50) + 1;
      op = ["+", "-", "*", "/"][Math.floor(Math.random() * 4)];
      if (op === "/") a = a * b;
    }

    let ans;
    switch (op) {
      case "+":
        ans = a + b;
        break;
      case "-":
        ans = a - b;
        break;
      case "*":
        ans = a * b;
        break;
      case "/":
        ans = Math.round(a / b);
        break;
    }
    arr.push({ q: `${a} ${op} ${b}`, a: ans });
  }
  return arr;
}

// Mulai game
function mulaiKuis() {
  const level = document.getElementById("level").value;
  totalSoal = parseInt(document.getElementById("jumlah").value, 10);
  soal = generateSoal(level, totalSoal);
  current = 0;
  score1 = 0;
  score2 = 0;
  updateScoreUI();
  menu.classList.add("hidden");
  game.classList.remove("hidden");
  tampilSoal();
}

// Tampilkan soal
function tampilSoal() {
  if (current >= totalSoal) return selesai();
  const s = soal[current];
  questionEl.textContent = s.q + " = ?";
  jawabanBenar = s.a;
  roundEl.textContent = `Soal: ${current + 1}/${totalSoal}`;
  feedback.textContent = "";
  document
    .querySelectorAll(".calc .display")
    .forEach((d) => (d.textContent = "0"));
  resetSubmissionState();
}

function resetSubmissionState() {
  leftSubmitted = rightSubmitted = false;
  leftValue = rightValue = null;
  if (firstSubmitTimer) {
    clearTimeout(firstSubmitTimer);
    firstSubmitTimer = null;
  }
}

function updateScoreUI() {
  score1El.textContent = score1;
  score2El.textContent = score2;
  const pos = ((score2 - score1) / (totalSoal || 1)) * 140; // kanan positif
  ball.style.transform = `translateX(${pos}px)`;
}

function evaluateRound() {
  const leftOk = Number(leftValue) === jawabanBenar;
  const rightOk = Number(rightValue) === jawabanBenar;

  if (leftOk && !rightOk) {
    score1++;
    feedback.textContent = "✅ Pemain 1 benar — bola ke kiri!";
  } else if (rightOk && !leftOk) {
    score2++;
    feedback.textContent = "✅ Pemain 2 benar — bola ke kanan!";
  } else if (leftOk && rightOk) {
    feedback.textContent = "🤝 Keduanya benar — bola diam.";
  } else {
    feedback.textContent = "❌ Keduanya salah — bola diam.";
  }

  updateScoreUI();
  current++;
  setTimeout(() => {
    if (current >= totalSoal) selesai();
    else tampilSoal();
  }, 1000);
}

function playerSubmit(side, value) {
  if (side === 1) {
    if (leftSubmitted) return;
    leftSubmitted = true;
    leftValue = value;
  } else {
    if (rightSubmitted) return;
    rightSubmitted = true;
    rightValue = value;
  }

  if (leftSubmitted && rightSubmitted) {
    if (firstSubmitTimer) clearTimeout(firstSubmitTimer);
    evaluateRound();
  } else if (!firstSubmitTimer) {
    firstSubmitTimer = setTimeout(() => evaluateRound(), WAIT_MS);
  }
}

// Wiring kalkulator
document.querySelectorAll(".calc").forEach((calcEl, idx) => {
  const display = calcEl.querySelector(".display");
  calcEl.querySelectorAll(".key").forEach((keyEl) => {
    keyEl.addEventListener("click", () => {
      const txt = keyEl.textContent.trim();
      if (txt.toLowerCase() === "del") {
        display.textContent = "0";
      } else if (txt === "-") {
        if (!display.textContent.includes("-") && display.textContent === "0")
          display.textContent = "-";
      } else if (txt.toLowerCase() === "ok") {
        const val = Number(display.textContent.trim());
        playerSubmit(idx + 1, val);
      } else {
        if (display.textContent === "0") display.textContent = txt;
        else display.textContent += txt;
      }
    });
  });
});

function selesai() {
  game.classList.add("hidden");
  popup.classList.remove("hidden");
  let hasilText = "";
  if (score1 > score2) hasilText = "🏆 Pemain 1 Menang!";
  else if (score2 > score1) hasilText = "🏆 Pemain 2 Menang!";
  else hasilText = "🤝 Seri!";
  document.getElementById("hasil-title").textContent = hasilText;
  document.getElementById(
    "hasil-text"
  ).textContent = `Skor: ${score1} - ${score2}`;
}

document.getElementById("kembali").addEventListener("click", () => {
  popup.classList.add("hidden");
  menu.classList.remove("hidden");
});

document.getElementById("mulai").addEventListener("click", mulaiKuis);
