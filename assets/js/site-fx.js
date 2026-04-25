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

  let rafId = null;

  function startStatic() {
    // Render at 1/3 viewport resolution then scale up via image-rendering:
    // pixelated. Gives chunky CRT-style noise and stays cheap on mobile.
    const w = (canvas.width = Math.max(1, Math.floor(window.innerWidth / 3)));
    const h = (canvas.height = Math.max(1, Math.floor(window.innerHeight / 3)));
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(w, h);
    const data = imgData.data;
    function frame() {
      const len = data.length;
      for (let i = 0; i < len; i += 4) {
        const v = Math.random() < 0.5 ? 0 : 255;
        data[i] = data[i + 1] = data[i + 2] = v;
        data[i + 3] = 255;
      }
      ctx.putImageData(imgData, 0, 0);
      rafId = requestAnimationFrame(frame);
    }
    frame();
  }

  function stopStatic() {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // Arriving from a transition: cover the page with static FIRST, then
  // reveal body content. The inline head script has set
  // html.pp-tv-arriving so body content is hidden until we say otherwise.
  // Also bypass the home-page preloader which would otherwise produce a
  // ~500ms freeze of bouncing dots after the static fades.
  if (sessionStorage.getItem('__pp_tv__')) {
    sessionStorage.removeItem('__pp_tv__');
    const preloader = document.getElementById('preloader');
    if (preloader) preloader.style.display = 'none';
    startStatic();
    canvas.classList.add('active');
    scanlines.classList.add('active');
    requestAnimationFrame(() => {
      // Static is now drawn on top. Safe to reveal body content underneath.
      document.documentElement.classList.remove('pp-tv-arriving');
      canvas.classList.add('fading-out');
      scanlines.classList.add('fading-out');
    });
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
