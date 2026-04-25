/* Pixel Puppets site effects.
   Living title detail. Every 6-11s, pick a random letter from the page
   title and flick it to a brand colour for ~300ms. Pauses while the
   cursor is over the title to defer to the existing hover effect. */
(function () {
  const palette = ['#FF6E00', '#1DB41E', '#D001FF', '#00D2FF', '#E5E522', '#3737C8', '#FF0000'];
  const titleRoot = document.querySelector('.main-title');
  if (!titleRoot) return;

  const letters = Array.from(titleRoot.querySelectorAll('span')).filter(
    (s) => s.children.length === 0 && s.textContent.trim().length > 0
  );
  if (!letters.length) return;

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
})();
