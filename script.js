let questions = [];
let current = 0;
let score = 0;
let gameMode = '';
let timerInterval;
let timerPaused = false;
let remainingTime = 0;
let wrongQuestions = []; // <-- Array para preguntas incorrectas

// Cargar preguntas desde JSON
async function loadQuestions() {
  try {
    const response = await fetch('question.json'); 
    if (!response.ok) throw new Error("No se pudo cargar el archivo JSON");
    const allQuestions = await response.json();

    const uniqueQuestions = [];
    const titles = [...new Set(allQuestions.map(q => q.title))];

    titles.forEach(title => {
      const options = allQuestions.filter(q => q.title === title);
      const selected = options[Math.floor(Math.random() * options.length)];
      uniqueQuestions.push(selected);
    });

    uniqueQuestions.sort(() => Math.random() - 0.5);
    questions = uniqueQuestions.slice(0, 10);

  } catch (error) {
    console.error(error);
    alert("Error cargando preguntas");
  }
}

async function startGame(mode) {
  await loadQuestions(); 
  current = 0;
  score = 0;
  gameMode = mode;
  wrongQuestions = []; // reiniciar fallos

  document.getElementById("start-screen").classList.remove("active");
  document.getElementById("result-screen").classList.remove("active");
  document.getElementById("game-screen").classList.add("active");

  showQuestion();
}

function showQuestion() {
  if (current < questions.length) {
    const questionEl = document.getElementById("question");
    questionEl.innerHTML = `
      <div class="question-title">${questions[current].title}</div>
      <div class="question-text">${questions[current].text}</div>
    `;

    document.getElementById("score-display").textContent = `Puntos: ${score}`;
    document.getElementById("question-counter").textContent = `Pregunta: ${current + 1}/${questions.length}`;

    if (gameMode === 'contratiempo') {
      startTimer(5);
      document.getElementById("timer-container").style.display = "flex";
    } else {
      document.getElementById("timer-container").style.display = "none";
    }
  } else {
    showResult();
  }
}

function answer(userAnswer) {
  if (timerInterval) clearInterval(timerInterval);

  const isCorrect = userAnswer === questions[current].answer;
  if (isCorrect) {
    score++;
    showAnimation("success");
  } else {
    wrongQuestions.push(`${current + 1}. ${questions[current].title}`); // guardar pregunta fallida
    showAnimation("error");
  }

  current++;
  setTimeout(showQuestion, 1200);
}

function startTimer(seconds) {
  clearInterval(timerInterval);
  let timeLeft = seconds;
  remainingTime = seconds;
  const timerDisplay = document.getElementById("timer-display");

  timerDisplay.textContent = `0:${timeLeft < 10 ? '0' : ''}${timeLeft}`;

  timerInterval = setInterval(() => {
    if (!timerPaused) {
      timeLeft--;
      remainingTime = timeLeft;
      timerDisplay.textContent = `0:${timeLeft < 10 ? '0' : ''}${timeLeft}`;

      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        showAnimation("time");
        wrongQuestions.push(`${current + 1}. ${questions[current].title}`); // tiempo agotado cuenta como fallo
        current++;
        setTimeout(showQuestion, 1200);
      }
    }
  }, 1000);
}

function toggleTimer() {
  const icon = document.querySelector("#timer-start i");
  if (!timerInterval) return;
  timerPaused = !timerPaused;

  if (timerPaused) {
    clearInterval(timerInterval);
    icon.className = "bi bi-play-fill";
  } else {
    startTimer(remainingTime);
    icon.className = "bi bi-pause-fill";
  }
}


function showResult() {
  document.getElementById("game-screen").classList.remove("active");
  document.getElementById("result-screen").classList.add("active");

  const total = questions.length;
  const incorrect = wrongQuestions.length;
  const correct = total - incorrect;
  const percentage = Math.round((correct / total) * 100);

  // Contadores
  document.getElementById("correct-count").textContent = `Correctas: ${correct}`;
  document.getElementById("correct-percentage").textContent = `${percentage}%`;
  document.getElementById("incorrect-count").textContent = `Incorrectas: ${incorrect}`;

  // Listas
  const correctContainer = document.getElementById('correct-answers');
  const wrongContainer = document.getElementById('wrong-answers');
  correctContainer.innerHTML = '';
  wrongContainer.innerHTML = '';

  questions.forEach((q, index) => {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'fw-semibold');
    li.textContent = `${index + 1}. ${q.title}`;
    if (!wrongQuestions.includes(`${index + 1}. ${q.title}`)) {
      li.classList.add('text-success');
      correctContainer.appendChild(li);
    } else {
      li.classList.add('text-danger');
      wrongContainer.appendChild(li);
    }
  });
}


function goHome() {
  document.getElementById("result-screen").classList.remove("active");
  document.getElementById("start-screen").classList.add("active");
}

function showAnimation(type) {
  let element;
  if (type === "error") element = document.getElementById("error-animation");
  else if (type === "success") element = document.getElementById("success-animation");
  else if (type === "time") element = document.getElementById("time-animation");

  element.classList.add("active");
  setTimeout(() => element.classList.remove("active"), 1800);
}

document.getElementById("exit-button").onclick = function() {
  location.reload();
};

