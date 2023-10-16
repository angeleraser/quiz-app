const questionForm = document.getElementById("question-form");
const questionValue = document.getElementById("question-value");
const answersList = document.getElementById("answers-list");
const nextQuestionBtn = document.getElementById("next-question-btn");
const resultMessage = document.getElementById("result-message");

class Answer {
  constructor({ label, isCorrect }) {
    this.label = label;
    this.id = crypto.randomUUID();
    this.isCorrect = isCorrect;
  }
}

class Question {
  constructor({ label = "", answers = [] }) {
    this.id = crypto.randomUUID();
    this.label = label;
    this.answers = answers;
    this.selectedAnswer = null;
    this.correctAnswer = this.answers.find((item) => item.isCorrect);
  }

  setSelectedAnswer(answer) {
    this.selectedAnswer = answer;
  }

  evalSelectedAnswer() {
    if (!this.selectedAnswer) return false;
    return this.selectedAnswer.id === this.correctAnswer.id;
  }
}

function shuffleArray(arr = []) {
  function getRandomIndexes(length = 1) {
    let result = [];

    while (result.length < length) {
      const num = Math.floor(Math.random() * length);
      if (!result.includes(num)) result.push(num);
    }

    return result;
  }

  return getRandomIndexes(arr.length).map((index) => arr[index]);
}

async function getOpenTriviaDBQuestions(count = 10) {
  const resp = await fetch(
    `https://opentdb.com/api.php?amount=${count}&category=9&difficulty=medium&type=multiple&encode=url3986`
  );
  const { results } = await resp.json();

  return results.map((item) => {
    const labels = [item.correct_answer, ...item.incorrect_answers].map(
      decodeURIComponent
    );

    return new Question({
      label: decodeURIComponent(item.question),
      answers: shuffleArray(labels).map((val) => {
        return new Answer({
          label: val,
          isCorrect: val === decodeURIComponent(item.correct_answer),
        });
      }),
    });
  });
}

function getLetterByIndex(index) {
  return "ABCDE"[index];
}

function renderQuestion(question = new Question({})) {
  selectedAnswerId = null;

  questionValue.textContent = question.label;
  questionValue.setAttribute("data-question-index", questionIndex + 1);

  const answersHtml = question.answers
    .map((item, index) => {
      return `
    <li class="answers-list-item">
      <label for="${item.id}" class="answer notranslate">
        <input type="radio" name="answer" id="${item.id}" value="${item.id}"/>
        <div
          data-answer-id="${getLetterByIndex(index)}"
          class="answer-content btn"
          >
          ${item.label}
        </div>
      </label>
    </li>
    `;
    })
    .join("");

  answersList.innerHTML = answersHtml;

  nextQuestionBtn.setAttribute("disabled", "");
}

function getCurrentQuestion() {
  return questionsList[questionIndex];
}

function showNextQuestion() {
  if (!selectedAnswerId) return;

  if (getCurrentQuestion().evalSelectedAnswer()) {
    correctAnswers.push(selectedAnswerId);
  }

  questionIndex += 1;

  if (questionIndex === questionsList.length) {
    questionForm.setAttribute("data-completed", "true");
    resultMessage.textContent = `You answered ${correctAnswers.length}/${questionsList.length} questions correctly`;
    return;
  }

  renderQuestion(questionsList[questionIndex]);
}

let questionsList = [];
let questionIndex = 0;
let selectedAnswerId = null;
const correctAnswers = [];

questionForm.addEventListener("submit", () => this.preventDefault());

questionForm.addEventListener("change", function ({ target }) {
  selectedAnswerId = target.value;
  const currentQuestion = getCurrentQuestion();

  currentQuestion.setSelectedAnswer(
    currentQuestion.answers.find(({ id }) => id === selectedAnswerId)
  );

  nextQuestionBtn.removeAttribute("disabled");
});

nextQuestionBtn.addEventListener("click", showNextQuestion);

getOpenTriviaDBQuestions(10).then((data) => {
  questionsList = data;
  renderQuestion(questionsList[questionIndex]);
});