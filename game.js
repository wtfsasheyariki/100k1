document.addEventListener("DOMContentLoaded", () => {

  // ---------------- ДАННЫЕ ----------------

  const categories = [
    "Назад в будущее",
    "Угадай мелодию",
    "Нет слов, одни эмодзи",
    "В прямом эфире",
    "Чёрный квадрат",
    "Эй, подруга, что с лицом?"
  ];

  const questions = {
    "Назад в будущее": {
      100: {
        question: {
          text: "В репертуаре Саши и Ярика есть много одинаковых ролей...\nЧто это за роль?"
        },
        answer: {
          text: "Ромео",
          image: "pics/answer1_100.png"
        }
      },
      200: {
        question: {
          text: "Расставьте исполнения мюзикла «Тетрадь смерти» в хронологическом порядке",
          image: "pics/question1_200.PNG"
        },
        answer: {
          image: "pics/answer1_200.PNG"
        }
      },
      300: {
        question: {
          text: "Недавно среди персонажей Ярика появился тот...\nЧто это за персонажи?"
        },
        answer: {
          image: "pics/answer1_300.PNG"
        }
      },
      400: {
        question: {
          text: "По признанию Саши, он поёт эту арию именно в ТАКОЙ версии.\nЧто за версия?"
        },
        answer: {
          video: "video/answer1_400.mp4"
        }
      },
      500: {
        question: {
          text: "Их роднит ремесло, которым они зарабатывают на жизнь.\nЧто это?"
        },
        answer: {
          image: "pics/answer1_500.PNG"
        }
      }
    },

    "Угадай мелодию": {
      100: {
        question: { audio: "music/question2_100.mp3" },
        answer: { audio: "music/answer2_100.mp3" }
      },
      200: {
        question: { audio: "music/question2_200.mp3" },
        answer: { audio: "music/answer2_200.mp3" }
      },
      300: {
        question: { audio: "music/question2_300.mp3" },
        answer: { audio: "music/answer2_300.mp3" }
      },
      400: {
        question: { audio: "music/question2_400.mp3" },
        answer: { audio: "music/answer2_400.mp3" }
      },
      500: {
        question: { audio: "music/question2_500.mp3" },
        answer: { video: "video/answer2_500.mp4" }
      }
    },

    "Нет слов, одни эмодзи": {
      100: {
        question: {
          hints: ["pics/question3_100_0.png", "pics/question3_100_1.png", "pics/question3_100_2.png"]
        },

        answer: {
          text: "Сашеярики"
        }
      }
    }
  };

  // ---------------- DOM ----------------

  const boardBody = document.getElementById("board-body");
  const boardScreen = document.getElementById("game-board");
  const questionScreen = document.getElementById("question-screen");
  const answerScreen = document.getElementById("answer-screen");

  const audioPlayer = document.getElementById("audio-player");

  const questionVideoWrapper = document.getElementById("question-video-wrapper");
  const answerVideoWrapper = document.getElementById("answer-video-wrapper");
  const questionVideo = document.getElementById("question-video");
  const answerVideo = document.getElementById("answer-video");

  let currentQuestion = null;
  let currentCell = null;
  let currentHintIndex = 0;


  // ---------------- АУДИО ----------------

  function playAudio(src) {
    if (!src) return;
    audioPlayer.pause();
    audioPlayer.src = src;
    audioPlayer.currentTime = 0;
    audioPlayer.play().catch(() => { });
  }

  function stopAudio() {
    audioPlayer.pause();
    audioPlayer.currentTime = 0;
  }

  // ---------------- ВИДЕО ----------------

  function stopVideo(video, wrapper) {
    if (!video || !wrapper) return;
    video.pause();
    video.currentTime = 0;
    video.src = "";
    wrapper.style.display = "none";
  }

  function setupVideo(data, video, wrapper) {
    stopVideo(video, wrapper);
    if (!data.video) return;

    wrapper.style.display = "flex";
    video.src = data.video;
    video.load();

    const container = wrapper.querySelector(".video-container");
    const playIcon = wrapper.querySelector(".video-play-icon");

    playIcon.style.display = "block";

    video.onplay = () => playIcon.style.display = "none";
    video.onpause = () => playIcon.style.display = "block";

    container.onclick = () => {
      video.paused ? video.play() : video.pause();
    };
  }

  // ---------------- ЭКРАНЫ ----------------

  function showScreen(screen) {
    [boardScreen, questionScreen, answerScreen].forEach(s =>
      s.classList.remove("active")
    );
    screen.classList.add("active");
  }
  // ---------------- ПОДСКАЗКИ ----------------
  function renderHint(container, hints) {
    container.innerHTML = "";

    const img = document.createElement("img");
    img.src = hints[currentHintIndex];
    container.appendChild(img);

    if (currentHintIndex < hints.length - 1) {
      const btn = document.createElement("button");
      btn.textContent = "Показать следующую подсказку";
      btn.onclick = () => {
        currentHintIndex++;
        renderHint(container, hints);
      };
      container.appendChild(btn);
    }
  }


  // ---------------- РЕНДЕР ----------------

  function renderContent(data, containerId, playBtnId, stopBtnId) {
    const container = document.getElementById(containerId);
    container.innerHTML = "";

    if (data.hints) {
      currentHintIndex = 0;
      renderHint(container, data.hints);
      return;
    }


    if (data.text) {
      const div = document.createElement("div");
      div.textContent = data.text;
      container.appendChild(div);
    }

    if (data.image) {
      const img = document.createElement("img");
      img.src = data.image;
      container.appendChild(img);
    }

    const playBtn = document.getElementById(playBtnId);
    const stopBtn = document.getElementById(stopBtnId);

    if (data.audio) {
      playBtn.style.display = stopBtn.style.display = "inline-block";
    } else {
      playBtn.style.display = stopBtn.style.display = "none";
    }
  }

  // ---------------- ВОПРОС ----------------

  function openQuestion(category, value, cell) {
    currentQuestion = questions[category][value];
    currentCell = cell;

    document.getElementById("question-category").textContent = category;
    document.getElementById("question-value").textContent = value;

    renderContent(currentQuestion.question, "question-text", "play-music-question", "stop-music-question");

    stopAudio();
    stopVideo(answerVideo, answerVideoWrapper);
    setupVideo(currentQuestion.question, questionVideo, questionVideoWrapper);

    showScreen(questionScreen);
  }

  // ---------------- ОТВЕТ ----------------

  function showAnswer() {
    renderContent(currentQuestion.answer, "answer-text", "play-music-answer", "stop-music-answer");

    stopAudio();
    stopVideo(questionVideo, questionVideoWrapper);
    setupVideo(currentQuestion.answer, answerVideo, answerVideoWrapper);

    showScreen(answerScreen);
  }

  document.getElementById("show-answer").onclick = showAnswer;

  // ---------------- ДОСКА ----------------

  categories.forEach(category => {
    const row = document.createElement("tr");
    const catCell = document.createElement("td");
    catCell.textContent = category;
    row.appendChild(catCell);

    [100, 200, 300, 400, 500].forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = value;

      if (questions[category]?.[value]) {
        cell.onclick = () => openQuestion(category, value, cell);
      } else {
        cell.classList.add("used");
      }

      row.appendChild(cell);
    });

    boardBody.appendChild(row);
  });

  // ---------------- НАЗАД ----------------

  document.getElementById("back-to-board").onclick = () => {
    currentCell?.classList.add("used");
    currentCell.onclick = null;

    stopAudio();
    stopVideo(questionVideo, questionVideoWrapper);
    stopVideo(answerVideo, answerVideoWrapper);

    showScreen(boardScreen);
  };

  // ---------------- КНОПКИ МУЗЫКИ ----------------

  document.getElementById("play-music-question").onclick = () => {
    playAudio(currentQuestion?.question?.audio);
  };

  document.getElementById("play-music-answer").onclick = () => {
    playAudio(currentQuestion?.answer?.audio);
  };

  document.getElementById("stop-music-question").onclick = stopAudio;
  document.getElementById("stop-music-answer").onclick = stopAudio;

});
