// ==========================================================================
// CẤU HÌNH ẢNH NỀN & ÂM THANH (Tự thêm / bớt tên file tại đây)
// Lưu ý: Tên file PHÂN BIỆT CHỮ HOA / CHỮ THƯỜNG khi chạy trên GitHub Pages!
// ==========================================================================
const BACKGROUNDS = [
  'assets/bg1.png',
  'assets/bg2.png',
  'assets/bg3.png',
  'assets/bg4.png',
  'assets/bg5.png'
];

const CORRECT_SOUNDS = [
  'assets/sounds/correct.mp3'
];

const WRONG_SOUNDS = [
  'assets/sounds/wrong.mp3'
];

// ==========================================================================
// LOGIC TRÒ CHƠI TRẮC NGHIỆM: TƯ TƯỞNG HỒ CHÍ MINH VỀ XÂY DỰNG CON NGƯỜI
// Thuần JavaScript (ES6+), không thư viện ngoài
// ==========================================================================

(function () {
  'use strict';

  const LETTERS = ['A', 'B', 'C', 'D'];
  const SOUND_STORAGE_KEY = 'hcm_quiz_sound_enabled';
  const CONFETTI_DURATION_MS = 2000;
  const BG_CROSSFADE_MS = 640;

  // Danh sách câu hỏi lấy từ questions.js
  const QUESTIONS = Array.isArray(window.QUIZ_QUESTIONS) ? window.QUIZ_QUESTIONS : [];

  // Tham chiếu phần tử DOM
  const bgLayerA = document.getElementById('bgPhotoA');
  const bgLayerB = document.getElementById('bgPhotoB');
  const bacPortraitWrap = document.getElementById('bacPortraitWrap');
  const bacPortraitImg = document.getElementById('bacPortraitImg');

  const coverScreen = document.getElementById('coverScreen');
  const quizScreen = document.getElementById('quizScreen');
  const resultScreen = document.getElementById('resultScreen');

  const startBtn = document.getElementById('startBtn');
  const nextBtn = document.getElementById('nextBtn');
  const restartBtn = document.getElementById('restartBtn');
  const soundToggleBtn = document.getElementById('soundToggleBtn');

  const questionCounterEl = document.getElementById('questionCounter');
  const liveScoreEl = document.getElementById('liveScore');
  const progressBarEl = document.getElementById('progressBar');
  const progressFillEl = document.getElementById('progressFill');
  const quizStageEl = document.getElementById('quizStage');
  const questionTextEl = document.getElementById('questionText');
  const feedbackLiveEl = document.getElementById('feedbackLive');
  const answerButtons = Array.from(document.querySelectorAll('.answer-card'));

  const resultScoreTextEl = document.getElementById('resultScoreText');
  const resultTierBadgeEl = document.getElementById('resultTierBadge');
  const resultCommentEl = document.getElementById('resultComment');
  const resultDotsEl = document.getElementById('resultDots');

  const confettiCanvas = document.getElementById('confettiCanvas');
  const confettiCtx = confettiCanvas ? confettiCanvas.getContext('2d') : null;

  // Trạng thái trò chơi
  let activeScreen = 'cover'; // 'cover' | 'quiz' | 'result'
  let currentIndex = 0;
  let score = 0;
  let hasMadeMistake = false;
  let isQuestionSolved = false;
  let currentShuffledOptions = [];
  let firstTryResults = [];

  // Trạng thái ảnh nền ngẫu nhiên (túi xáo trộn + crossfade 2 lớp)
  const validBackgrounds = [];
  let backgroundBag = [];
  let bagInitialized = false;
  let currentBackgroundSrc = null;
  let activeBgLayerIndex = 0;
  let bgCrossfadeTimer = null;

  // Trạng thái âm thanh: file MP3 tùy chọn + Web Audio API dự phòng
  let audioCtx = null;
  let soundEnabled = loadSoundPreference();
  let correctSoundPool = [];
  let wrongSoundPool = [];

  // Trạng thái hiệu ứng pháo giấy
  let confettiRafId = null;
  let confettiTimeoutId = null;

  // Hàm xáo trộn Fisher-Yates dùng chung
  function shuffleArray(list) {
    const arr = list.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i];
      arr[i] = arr[j];
      arr[j] = temp;
    }
    return arr;
  }

  // ========================================================================
  // 1. ẢNH NỀN NGẪU NHIÊN (TÚI XÁO TRỘN, PRELOAD, CROSSFADE 0.6s) & ẢNH BÁC
  // ========================================================================
  function refillBackgroundBag() {
    if (validBackgrounds.length === 0) {
      backgroundBag = [];
      return;
    }

    bagInitialized = true;
    const fresh = shuffleArray(validBackgrounds);

    // Đảm bảo ảnh đầu tiên của túi mới không trùng với ảnh đang hiển thị
    if (fresh.length > 1 && fresh[0] === currentBackgroundSrc) {
      const swapIndex = 1 + Math.floor(Math.random() * (fresh.length - 1));
      const temp = fresh[0];
      fresh[0] = fresh[swapIndex];
      fresh[swapIndex] = temp;
    }

    backgroundBag = fresh;
  }

  function pickNextBackground() {
    if (validBackgrounds.length === 0) return null;
    if (validBackgrounds.length === 1) return validBackgrounds[0];

    if (backgroundBag.length === 0) {
      refillBackgroundBag();
    }

    let picked = backgroundBag.shift();

    // Phòng hờ trường hợp có ảnh tải chậm mới được bổ sung vào túi
    if (picked === currentBackgroundSrc) {
      if (backgroundBag.length > 0) {
        backgroundBag.push(picked);
        picked = backgroundBag.shift();
      } else {
        refillBackgroundBag();
        picked = backgroundBag.shift();
      }
    }

    return picked || null;
  }

  function crossfadeToBackground(src) {
    if (!src || !bgLayerA || !bgLayerB) return;

    document.body.classList.add('has-bg-image');

    if (src === currentBackgroundSrc) return;

    const prevLayer = activeBgLayerIndex === 0 ? bgLayerA : bgLayerB;
    const nextLayer = activeBgLayerIndex === 0 ? bgLayerB : bgLayerA;

    if (bgCrossfadeTimer !== null) {
      window.clearTimeout(bgCrossfadeTimer);
      bgCrossfadeTimer = null;
    }

    const safeUrl = encodeURI(src).replace(/"/g, '%22');

    // Chuẩn bị lớp ảnh mới nằm phía trên ở trạng thái trong suốt rồi hiện dần 0.6s
    nextLayer.style.transition = 'none';
    nextLayer.classList.remove('is-visible');
    nextLayer.style.zIndex = '3';
    nextLayer.style.backgroundImage = 'url("' + safeUrl + '")';

    if (currentBackgroundSrc !== null) {
      prevLayer.style.zIndex = '2';
      prevLayer.classList.add('is-visible');
    } else {
      prevLayer.style.zIndex = '1';
      prevLayer.classList.remove('is-visible');
    }

    // Bắt buộc trình duyệt áp dụng trạng thái ban đầu trước khi chạy transition
    void nextLayer.offsetWidth;

    nextLayer.style.transition = '';
    nextLayer.classList.add('is-visible');

    activeBgLayerIndex = activeBgLayerIndex === 0 ? 1 : 0;
    currentBackgroundSrc = src;

    bgCrossfadeTimer = window.setTimeout(function () {
      prevLayer.classList.remove('is-visible');
      prevLayer.style.zIndex = '1';
      nextLayer.style.zIndex = '2';
      bgCrossfadeTimer = null;
    }, BG_CROSSFADE_MS);
  }

  function changeBackgroundRandom() {
    const nextSrc = pickNextBackground();
    if (nextSrc) {
      crossfadeToBackground(nextSrc);
    }
  }

  function preloadBackgrounds() {
    if (!Array.isArray(BACKGROUNDS) || BACKGROUNDS.length === 0) return;

    // Lọc bỏ phần tử rỗng và trùng lặp
    const uniqueList = [];
    BACKGROUNDS.forEach(function (src) {
      if (typeof src === 'string') {
        const trimmed = src.trim();
        if (trimmed && uniqueList.indexOf(trimmed) === -1) {
          uniqueList.push(trimmed);
        }
      }
    });

    if (uniqueList.length === 0) return;

    let settledCount = 0;

    function tryApplyInitialBackground() {
      if (currentBackgroundSrc !== null || validBackgrounds.length === 0) return;
      refillBackgroundBag();
      changeBackgroundRandom();
    }

    // Nếu mạng chậm nhưng đã có ít nhất 1 ảnh tải xong, hiển thị sớm sau 450ms
    const earlyTimer = window.setTimeout(tryApplyInitialBackground, 450);

    function handleSettled() {
      settledCount += 1;
      if (settledCount >= uniqueList.length) {
        window.clearTimeout(earlyTimer);
        tryApplyInitialBackground();
      }
    }

    uniqueList.forEach(function (src) {
      const img = new Image();
      img.onload = function () {
        if (img.naturalWidth > 0) {
          validBackgrounds.push(src);
          // Nếu túi đã khởi tạo trước đó (do ảnh này tải chậm), chèn ngẫu nhiên vào túi
          if (bagInitialized) {
            const insertAt = Math.floor(Math.random() * (backgroundBag.length + 1));
            backgroundBag.splice(insertAt, 0, src);
          }
        }
        handleSettled();
      };
      img.onerror = function () {
        // Ảnh thiếu hoặc lỗi -> bỏ qua khỏi túi, không gây lỗi trang
        handleSettled();
      };
      img.src = src;
    });
  }

  function loadBacPortrait() {
    // Ảnh minh họa Bác Hồ đầu trang: assets/hinh-bac.jpg (ẩn gọn nếu thiếu)
    const portraitLoader = new Image();
    portraitLoader.onload = function () {
      if (portraitLoader.naturalWidth > 0 && bacPortraitImg && bacPortraitWrap) {
        bacPortraitImg.src = './assets/hinh-bac.jpg';
        bacPortraitWrap.hidden = false;
      }
    };
    portraitLoader.onerror = function () {
      if (bacPortraitWrap) {
        bacPortraitWrap.hidden = true;
      }
    };
    portraitLoader.src = './assets/hinh-bac.jpg';
  }

  // ========================================================================
  // 2. ÂM THANH RIÊNG (FILE MP3 PRELOAD) + WEB AUDIO API DỰ PHÒNG
  // ========================================================================
  function loadSoundPreference() {
    try {
      const saved = window.localStorage.getItem(SOUND_STORAGE_KEY);
      if (saved === 'false') return false;
      if (saved === 'true') return true;
    } catch (_) {
      // Bỏ qua nếu trình duyệt chặn localStorage
    }
    return true;
  }

  function saveSoundPreference(enabled) {
    try {
      window.localStorage.setItem(SOUND_STORAGE_KEY, String(enabled));
    } catch (_) {
      // Bỏ qua nếu trình duyệt chặn localStorage
    }
  }

  function updateSoundButtonUI() {
    if (!soundToggleBtn) return;
    soundToggleBtn.classList.toggle('is-muted', !soundEnabled);
    soundToggleBtn.setAttribute('aria-pressed', String(!soundEnabled));
    soundToggleBtn.setAttribute(
      'aria-label',
      soundEnabled ? 'Đang bật âm thanh — bấm để tắt' : 'Đang tắt âm thanh — bấm để bật'
    );
    soundToggleBtn.setAttribute(
      'title',
      soundEnabled ? 'Tắt âm thanh' : 'Bật âm thanh'
    );
  }

  function preloadSoundPool(urls) {
    if (!Array.isArray(urls)) return [];

    const pool = [];
    urls.forEach(function (src) {
      if (typeof src !== 'string' || !src.trim()) return;
      const cleanSrc = src.trim();

      try {
        const audio = new Audio();
        audio.preload = 'auto';

        const entry = {
          src: cleanSrc,
          audio: audio,
          status: 'loading' // 'loading' | 'ready' | 'error'
        };

        audio.addEventListener('loadeddata', function () {
          if (entry.status !== 'error') entry.status = 'ready';
        });
        audio.addEventListener('canplaythrough', function () {
          if (entry.status !== 'error') entry.status = 'ready';
        });
        audio.addEventListener('error', function () {
          entry.status = 'error';
        });

        audio.src = cleanSrc;
        audio.load();
        pool.push(entry);
      } catch (_) {
        // Bỏ qua nếu trình duyệt không hỗ trợ Audio element
      }
    });

    return pool;
  }

  function stopAllCustomSounds() {
    const allEntries = correctSoundPool.concat(wrongSoundPool);
    allEntries.forEach(function (entry) {
      try {
        entry.audio.pause();
        entry.audio.currentTime = 0;
      } catch (_) {
        // Bỏ qua lỗi khi audio chưa tải
      }
    });
  }

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        try {
          audioCtx = new AudioContextClass();
        } catch (_) {
          audioCtx = null;
        }
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume().catch(function () {});
    }
  }

  // Âm thanh Web Audio dự phòng khi ĐÚNG: 3 nốt đi lên vui tai (C5 -> E5 -> G5)
  function playCorrectWebAudio() {
    if (!soundEnabled) return;
    initAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const notes = [523.25, 659.25, 783.99];

    notes.forEach(function (freq, idx) {
      const startTime = now + idx * 0.11;
      const duration = idx === notes.length - 1 ? 0.34 : 0.18;

      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(0.22, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    });
  }

  // Âm thanh Web Audio dự phòng khi SAI: tiếng "bụp" trầm ngắn
  function playWrongWebAudio() {
    if (!soundEnabled) return;
    initAudioContext();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(185, now);
    osc.frequency.exponentialRampToValueAtTime(62, now + 0.17);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.32, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.19);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 0.21);
  }

  // Phát ngẫu nhiên 1 file từ mảng âm thanh; nếu thiếu/lỗi thì tự dùng Web Audio dự phòng
  function playSoundFromPool(pool, fallbackFn) {
    if (!soundEnabled) return;

    let candidates = pool.filter(function (entry) {
      return entry.status === 'ready' && !entry.audio.error;
    });

    if (candidates.length === 0) {
      candidates = pool.filter(function (entry) {
        return entry.status === 'loading' && !entry.audio.error;
      });
    }

    if (candidates.length === 0) {
      fallbackFn();
      return;
    }

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];

    try {
      stopAllCustomSounds();
      chosen.audio.currentTime = 0;
      const playPromise = chosen.audio.play();

      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function (err) {
          if (!err || err.name !== 'NotAllowedError') {
            chosen.status = 'error';
          }
          fallbackFn();
        });
      }
    } catch (_) {
      chosen.status = 'error';
      fallbackFn();
    }
  }

  function playCorrectSound() {
    playSoundFromPool(correctSoundPool, playCorrectWebAudio);
  }

  function playWrongSound() {
    playSoundFromPool(wrongSoundPool, playWrongWebAudio);
  }

  function toggleSound() {
    soundEnabled = !soundEnabled;
    saveSoundPreference(soundEnabled);
    updateSoundButtonUI();
    if (!soundEnabled) {
      stopAllCustomSounds();
    } else {
      initAudioContext();
    }
  }

  // ========================================================================
  // 3. HIỆU ỨNG PHÁO GIẤY VÀNG – ĐỎ NHẸ (TỰ DỌN SAU 2 GIÂY)
  // ========================================================================
  function prefersReducedMotion() {
    return (
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  function stopConfetti() {
    if (confettiRafId !== null) {
      window.cancelAnimationFrame(confettiRafId);
      confettiRafId = null;
    }
    if (confettiTimeoutId !== null) {
      window.clearTimeout(confettiTimeoutId);
      confettiTimeoutId = null;
    }
    if (confettiCanvas && confettiCtx) {
      confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  function launchConfetti() {
    if (!confettiCanvas || !confettiCtx || prefersReducedMotion()) return;

    stopConfetti();

    const width = window.innerWidth;
    const height = window.innerHeight;
    confettiCanvas.width = width;
    confettiCanvas.height = height;

    const colors = ['#FFD43B', '#FFE680', '#D91C24', '#FF4D4F', '#FFF3B0'];
    const particleCount = width < 820 ? 36 : 56;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const fromLeft = i % 2 === 0;
      particles.push({
        x: fromLeft ? width * (0.15 + Math.random() * 0.25) : width * (0.6 + Math.random() * 0.25),
        y: height * (0.12 + Math.random() * 0.18),
        vx: (Math.random() - 0.5) * 6.5,
        vy: -(2.5 + Math.random() * 4.5),
        gravity: 0.16 + Math.random() * 0.08,
        sizeW: 7 + Math.random() * 7,
        sizeH: 4 + Math.random() * 5,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2,
        color: colors[i % colors.length],
        opacity: 1
      });
    }

    const startTimestamp = performance.now();

    function frame(now) {
      const elapsed = now - startTimestamp;
      const progress = Math.min(elapsed / CONFETTI_DURATION_MS, 1);

      confettiCtx.clearRect(0, 0, width, height);

      particles.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.vx *= 0.99;
        p.rotation += p.rotationSpeed;
        p.opacity = progress > 0.65 ? Math.max(0, 1 - (progress - 0.65) / 0.35) : 1;

        confettiCtx.save();
        confettiCtx.globalAlpha = p.opacity;
        confettiCtx.translate(p.x, p.y);
        confettiCtx.rotate(p.rotation);
        confettiCtx.fillStyle = p.color;
        confettiCtx.fillRect(-p.sizeW / 2, -p.sizeH / 2, p.sizeW, p.sizeH);
        confettiCtx.restore();
      });

      if (elapsed < CONFETTI_DURATION_MS) {
        confettiRafId = window.requestAnimationFrame(frame);
      } else {
        stopConfetti();
      }
    }

    confettiRafId = window.requestAnimationFrame(frame);
    confettiTimeoutId = window.setTimeout(stopConfetti, CONFETTI_DURATION_MS + 80);
  }

  // ========================================================================
  // 4. LUỒNG TRÒ CHƠI: XÁO ĐÁP ÁN, HIỂN THỊ CÂU HỎI, CHẤM ĐIỂM, KẾT QUẢ
  // ========================================================================
  function shuffleOptions(options, correctIndex) {
    const tagged = options.map(function (text, idx) {
      return {
        text: text,
        isCorrect: idx === correctIndex
      };
    });
    return shuffleArray(tagged);
  }

  function showScreen(screenName) {
    activeScreen = screenName;
    coverScreen.hidden = screenName !== 'cover';
    quizScreen.hidden = screenName !== 'quiz';
    resultScreen.hidden = screenName !== 'result';
  }

  function startGame() {
    // Khởi tạo AudioContext sau lần bấm đầu tiên của người chơi
    initAudioContext();
    stopConfetti();

    currentIndex = 0;
    score = 0;
    firstTryResults = new Array(QUESTIONS.length).fill(false);

    showScreen('quiz');
    renderQuestion();
  }

  function renderQuestion() {
    if (!QUESTIONS.length) return;

    stopConfetti();
    changeBackgroundRandom();

    const item = QUESTIONS[currentIndex];
    const total = QUESTIONS.length;

    hasMadeMistake = false;
    isQuestionSolved = false;
    currentShuffledOptions = shuffleOptions(item.options, item.correctIndex);

    // Cập nhật tiêu đề tiến độ & điểm
    questionCounterEl.textContent = 'Câu ' + (currentIndex + 1) + '/' + total;
    liveScoreEl.textContent = 'Điểm: ' + score;

    const percent = Math.round(((currentIndex + 1) / total) * 100);
    progressBarEl.setAttribute('aria-valuemax', String(total));
    progressBarEl.setAttribute('aria-valuenow', String(currentIndex + 1));
    progressFillEl.style.width = percent + '%';

    // Cập nhật nội dung câu hỏi
    questionTextEl.textContent = item.question;

    // Cập nhật 4 thẻ đáp án theo vị trí mới (A–D)
    answerButtons.forEach(function (btn, slotIndex) {
      const option = currentShuffledOptions[slotIndex];
      const letter = LETTERS[slotIndex];
      const badgeEl = btn.querySelector('.answer-badge');
      const textEl = btn.querySelector('.answer-text');
      const markEl = btn.querySelector('.answer-mark');

      btn.disabled = false;
      btn.removeAttribute('aria-disabled');
      btn.classList.remove('is-wrong', 'is-correct', 'is-locked-other');

      if (badgeEl) badgeEl.textContent = letter;
      if (textEl) textEl.textContent = option.text;
      if (markEl) markEl.textContent = '';

      btn.setAttribute('aria-label', 'Đáp án ' + letter + ': ' + option.text);
    });

    // Đặt lại thanh thông báo & nút sang câu tiếp
    feedbackLiveEl.textContent = '';
    feedbackLiveEl.className = 'feedback-banner';
    nextBtn.hidden = true;

    // Hiệu ứng chuyển câu mượt
    if (!prefersReducedMotion() && quizStageEl) {
      quizStageEl.classList.remove('is-transitioning');
      void quizStageEl.offsetWidth;
      quizStageEl.classList.add('is-transitioning');
    }
  }

  function handleAnswerSelection(slotIndex) {
    if (activeScreen !== 'quiz' || isQuestionSolved) return;

    const btn = answerButtons[slotIndex];
    const option = currentShuffledOptions[slotIndex];
    if (!btn || !option || btn.disabled) return;

    initAudioContext();

    const letter = LETTERS[slotIndex];
    const markEl = btn.querySelector('.answer-mark');

    if (option.isCorrect) {
      // Đáp án ĐÚNG
      isQuestionSolved = true;

      if (!hasMadeMistake) {
        score += 1;
        firstTryResults[currentIndex] = true;
        liveScoreEl.textContent = 'Điểm: ' + score;
      } else {
        firstTryResults[currentIndex] = false;
      }

      btn.classList.add('is-correct');
      if (markEl) markEl.textContent = '✓';

      // Khóa toàn bộ 4 đáp án
      answerButtons.forEach(function (otherBtn) {
        otherBtn.disabled = true;
        otherBtn.setAttribute('aria-disabled', 'true');
        if (otherBtn !== btn && !otherBtn.classList.contains('is-wrong')) {
          otherBtn.classList.add('is-locked-other');
        }
      });

      feedbackLiveEl.className = 'feedback-banner is-correct-text';
      feedbackLiveEl.textContent = !hasMadeMistake
        ? 'Chính xác! Đáp án ' + letter + ' đúng ngay lần chọn đầu tiên (+1 điểm).'
        : 'Chính xác! Đáp án đúng là ' + letter + '.';

      playCorrectSound();
      launchConfetti();

      // Hiện nút câu tiếp theo hoặc xem kết quả
      const isLastQuestion = currentIndex === QUESTIONS.length - 1;
      nextBtn.textContent = isLastQuestion ? 'XEM KẾT QUẢ' : 'CÂU TIẾP THEO →';
      nextBtn.hidden = false;
    } else {
      // Đáp án SAI: rung nhẹ, hiện ✗ đỏ, làm mờ & khóa thẻ này, cho chọn tiếp
      hasMadeMistake = true;

      btn.disabled = true;
      btn.setAttribute('aria-disabled', 'true');
      btn.classList.add('is-wrong');
      if (markEl) markEl.textContent = '✗';

      feedbackLiveEl.className = 'feedback-banner is-wrong-text';
      feedbackLiveEl.textContent = 'Đáp án ' + letter + ' chưa chính xác. Hãy chọn đáp án khác!';

      playWrongSound();
    }
  }

  function goToNextQuestion() {
    if (activeScreen !== 'quiz' || !isQuestionSolved) return;

    if (currentIndex < QUESTIONS.length - 1) {
      currentIndex += 1;
      renderQuestion();
    } else {
      showResultScreen();
    }
  }

  function getResultFeedback(points) {
    if (points === QUESTIONS.length) {
      return {
        tier: 'Xuất sắc',
        comment:
          'Xuất sắc! Bạn nắm rất sâu sắc và trọn vẹn Tư tưởng Hồ Chí Minh về xây dựng con người.'
      };
    }
    if (points >= 7) {
      return {
        tier: 'Giỏi',
        comment:
          'Giỏi lắm! Bạn hiểu rất vững những nội dung cốt lõi trong Tư tưởng Hồ Chí Minh về con người.'
      };
    }
    if (points >= 4) {
      return {
        tier: 'Khá',
        comment:
          'Khá tốt! Bạn đã nắm được nhiều ý quan trọng, hãy ôn thêm một chút để đạt điểm tuyệt đối nhé.'
      };
    }
    return {
      tier: 'Cần ôn lại',
      comment:
        'Cần ôn lại nhé! Hãy xem lại các luận điểm của Chủ tịch Hồ Chí Minh về xây dựng con người và thử chơi lại.'
    };
  }

  function showResultScreen() {
    stopConfetti();
    changeBackgroundRandom();
    showScreen('result');

    const total = QUESTIONS.length;
    const feedback = getResultFeedback(score);

    resultScoreTextEl.textContent = 'Bạn đúng ' + score + '/' + total + ' câu';
    resultTierBadgeEl.textContent = feedback.tier;
    resultCommentEl.textContent = feedback.comment;

    // Hiển thị các chấm trực quan cho 10 câu
    resultDotsEl.innerHTML = '';
    for (let i = 0; i < total; i++) {
      const dot = document.createElement('span');
      dot.className = 'result-dot' + (firstTryResults[i] ? ' is-hit' : '');
      resultDotsEl.appendChild(dot);
    }

    if (score >= 7) {
      launchConfetti();
    }
  }

  // ========================================================================
  // 5. GẮN SỰ KIỆN CLICK & PHÍM TẮT (1–4, A–D, ENTER, SPACE)
  // ========================================================================
  function bindEvents() {
    startBtn.addEventListener('click', startGame);
    nextBtn.addEventListener('click', goToNextQuestion);
    restartBtn.addEventListener('click', startGame);
    soundToggleBtn.addEventListener('click', toggleSound);

    answerButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const slotIndex = Number(btn.getAttribute('data-slot'));
        handleAnswerSelection(slotIndex);
      });
    });

    // Hỗ trợ phím tắt toàn trang
    document.addEventListener('keydown', function (e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const key = e.key.toLowerCase();

      if (activeScreen === 'quiz') {
        const keyToSlot = {
          '1': 0,
          '2': 1,
          '3': 2,
          '4': 3,
          a: 0,
          b: 1,
          c: 2,
          d: 3
        };

        if (Object.prototype.hasOwnProperty.call(keyToSlot, key)) {
          e.preventDefault();
          handleAnswerSelection(keyToSlot[key]);
          return;
        }

        if ((key === 'enter' || e.code === 'Space' || key === ' ') && isQuestionSolved) {
          if (e.target === soundToggleBtn) return;
          e.preventDefault();
          goToNextQuestion();
        }
        return;
      }

      if (activeScreen === 'cover') {
        if (key === 'enter' || e.code === 'Space' || key === ' ') {
          if (e.target === soundToggleBtn) return;
          e.preventDefault();
          startGame();
        }
        return;
      }

      if (activeScreen === 'result') {
        if (key === 'enter' || e.code === 'Space' || key === ' ') {
          if (e.target === soundToggleBtn) return;
          e.preventDefault();
          startGame();
        }
      }
    });
  }

  // Khởi tạo ứng dụng
  updateSoundButtonUI();
  correctSoundPool = preloadSoundPool(CORRECT_SOUNDS);
  wrongSoundPool = preloadSoundPool(WRONG_SOUNDS);
  preloadBackgrounds();
  loadBacPortrait();
  bindEvents();
})();
