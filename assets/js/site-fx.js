/* Pixel Puppets site effects.
   Two layered prototypes:
   1. TV channel-change page transitions on internal nav clicks.
      Canvas draws real binary B&W noise per animation frame for
      authentic CRT static. Hard cut on, quick fade-out on landing.
   2. Living title detail. Every 6-11s, pick a random letter from the
      page title and flick it to a brand colour for ~300ms. Pauses while
      the cursor is over the title to defer to the existing hover effect.
*/
(function () {
  /* ---------- TV channel-change page transition ---------- */

  let canvas = document.querySelector('.tv-static-canvas');
  let scanlines = document.querySelector('.tv-static-overlay');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.className = 'tv-static-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.appendChild(canvas);
  }
  if (!scanlines) {
    scanlines = document.createElement('div');
    scanlines.className = 'tv-static-overlay';
    scanlines.setAttribute('aria-hidden', 'true');
    document.body.appendChild(scanlines);
  }

  // Pre-generated static frames cycled at low rate. Cheaper than
  // generating noise per frame, especially on mobile.
  const STATIC_FRAMES = 6;
  let staticTimerId = null;

  function buildStaticFrames(w, h) {
    const frames = [];
    for (let n = 0; n < STATIC_FRAMES; n++) {
      const buf = new Uint8ClampedArray(w * h * 4);
      for (let i = 0; i < buf.length; i += 4) {
        const v = Math.random() < 0.5 ? 0 : 255;
        buf[i] = buf[i + 1] = buf[i + 2] = v;
        buf[i + 3] = 255;
      }
      frames.push(new ImageData(buf, w, h));
    }
    return frames;
  }

  function startStatic() {
    // Render at 1/4 viewport resolution then scale up via image-rendering:
    // pixelated. Chunky CRT noise that stays cheap on mobile.
    const w = (canvas.width = Math.max(1, Math.floor(window.innerWidth / 4)));
    const h = (canvas.height = Math.max(1, Math.floor(window.innerHeight / 4)));
    const ctx = canvas.getContext('2d');
    const frames = buildStaticFrames(w, h);
    let idx = 0;
    function tick() {
      ctx.putImageData(frames[idx % STATIC_FRAMES], 0, 0);
      idx++;
      // ~33fps — fast enough to read as scrambling, slow enough to stay
      // smooth on mobile.
      staticTimerId = setTimeout(tick, 30);
    }
    tick();
  }

  function stopStatic() {
    if (staticTimerId) {
      clearTimeout(staticTimerId);
      staticTimerId = null;
    }
  }

  // Arriving from a transition: bypass the home-page preloader (which
  // would otherwise produce a ~500ms freeze of bouncing dots) and play
  // a brief static accent. We don't try to hide body content during the
  // JS-startup gap any more — on mobile that gap can be 200-400ms which
  // makes the page feel like it's freezing on a black screen. Letting
  // the page render normally and treating the static as a quick accent
  // is much smoother.
  if (sessionStorage.getItem('__pp_tv__')) {
    sessionStorage.removeItem('__pp_tv__');
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.style.display = 'none';
    startStatic();
    canvas.classList.add('active', 'fading-out');
    scanlines.classList.add('active', 'fading-out');
    setTimeout(() => {
      canvas.classList.remove('active', 'fading-out');
      scanlines.classList.remove('active', 'fading-out');
      stopStatic();
    }, 100);
  }

  // Intercept internal nav-link clicks. Hard cut to static, brief beat,
  // then navigate. Use capture phase + stopImmediatePropagation so the
  // existing logo fade-out handlers on About/Contact don't also fire.
  document.querySelectorAll('.nav-links a, .nav-brand a').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('mailto:') || href.startsWith('#') || href.startsWith('http')) return;
    a.addEventListener(
      'click',
      (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        sessionStorage.setItem('__pp_tv__', '1');
        startStatic();
        canvas.classList.add('active');
        scanlines.classList.add('active');
        setTimeout(() => {
          window.location.href = href;
        }, 50);
      },
      true
    );
  });

  /* ---------- Living title detail ---------- */

  const palette = ['#FF6E00', '#1DB41E', '#D001FF', '#00D2FF', '#E5E522', '#3737C8', '#FF0000'];
  const titleRoot = document.querySelector('.main-title');
  if (titleRoot) {
    const letters = Array.from(titleRoot.querySelectorAll('span')).filter(
      (s) => s.children.length === 0 && s.textContent.trim().length > 0
    );
    if (letters.length) {
      let hoverPaused = false;
      titleRoot.addEventListener('mouseenter', () => {
        hoverPaused = true;
      });
      titleRoot.addEventListener('mouseleave', () => {
        hoverPaused = false;
      });

      function tick() {
        if (!hoverPaused) {
          const letter = letters[Math.floor(Math.random() * letters.length)];
          const colour = palette[Math.floor(Math.random() * palette.length)];
          const previous = letter.style.color;
          letter.style.transition = 'color 0.18s ease';
          letter.style.color = colour;
          setTimeout(() => {
            letter.style.color = previous;
          }, 280 + Math.random() * 140);
        }
        setTimeout(tick, 6000 + Math.random() * 5000);
      }
      // Wait for entrance animation to settle, then a beat
      setTimeout(tick, 2400);
    }
  }
})();
