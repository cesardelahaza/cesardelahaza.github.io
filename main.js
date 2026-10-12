// Theme toggle ---------------------------------------------------------
const root = document.documentElement;

function isDark() {
  if (root.dataset.theme) return root.dataset.theme === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

document.getElementById('theme-toggle').addEventListener('click', () => {
  const next = isDark() ? 'light' : 'dark';
  root.dataset.theme = next;
  try { localStorage.setItem('theme', next); } catch (e) { }
});

// Star field in the background -----------------------------------------
(function () {
  const canvas = document.createElement('canvas');
  canvas.id = 'stars';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.prepend(canvas);
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h;
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const numStars = 200;
  const speed = 0.5;
  const newStar = () => ({ x: Math.random() * w, y: Math.random() * h, z: Math.random() * w });
  const stars = Array.from({ length: numStars }, newStar);

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const styles = getComputedStyle(root);
    ctx.fillStyle = styles.getPropertyValue('--star').trim();
    const minSize = parseFloat(styles.getPropertyValue('--star-min')) || 0.5;
    for (const s of stars) {
      // Perspective projection towards the centre of the screen
      const k = 200 / s.z;
      const sx = s.x * k + w / 2 - (w / 2) * k;
      const sy = s.y * k + h / 2 - (h / 2) * k;
      const size = Math.max(minSize, minSize + 1.5 - s.z / 200);
      ctx.fillRect(sx, sy, size, size);
    }
  }

  if (reduceMotion) {
    draw();
    new MutationObserver(draw).observe(root, { attributes: true });
    return;
  }

  (function loop() {
    for (const s of stars) {
      s.z -= speed;
      if (s.z <= 0) Object.assign(s, newStar());
    }
    draw();
    requestAnimationFrame(loop);
  })();
})();

// Small Bloch sphere: a qubit state precessing around the z axis -------
(function () {
  const canvas = document.getElementById('bloch');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const size = canvas.clientWidth;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  const tilt = 0.32; // how much the equator is seen from above

  // Project a point on the unit sphere to canvas coordinates
  function project(x, y, z, cx, cy, r) {
    return [cx + r * x, cy - r * (z * Math.cos(tilt) - y * Math.sin(tilt))];
  }

  function draw(t) {
    const size = canvas.clientWidth;
    const cx = size / 2, cy = size / 2, r = size * 0.36;
    const styles = getComputedStyle(root);
    const ink = styles.getPropertyValue('--sphere').trim();
    const accent = styles.getPropertyValue('--accent').trim();

    ctx.clearRect(0, 0, size, size);
    ctx.lineWidth = 1;
    ctx.strokeStyle = ink;

    // Outline
    ctx.globalAlpha = 0.55;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    // Equator: back half dashed, front half solid
    ctx.globalAlpha = 0.35;
    for (const front of [false, true]) {
      ctx.setLineDash(front ? [] : [2, 3]);
      ctx.beginPath();
      for (let i = 0; i <= 64; i++) {
        const a = (front ? 0 : Math.PI) + (i / 64) * Math.PI;
        const [px, py] = project(Math.cos(a), -Math.sin(a), 0, cx, cy, r);
        i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // z axis
    const [zx, zy] = project(0, 0, 1.15, cx, cy, r);
    const [nx, ny] = project(0, 0, -1.15, cx, cy, r);
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.moveTo(nx, ny);
    ctx.lineTo(zx, zy);
    ctx.stroke();

    // State vector |psi>
    const theta = 0.9 + 0.35 * Math.sin(t * 0.4);
    const phi = t * 0.9;
    const sx = Math.sin(theta) * Math.cos(phi);
    const sy = Math.sin(theta) * Math.sin(phi);
    const sz = Math.cos(theta);
    const [px, py] = project(sx, sy, sz, cx, cy, r);

    ctx.globalAlpha = 1;
    ctx.strokeStyle = accent;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(px, py);
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(px, py, 2.6, 0, Math.PI * 2);
    ctx.fill();
  }

  if (reduceMotion) {
    draw(1.2);
    new MutationObserver(() => draw(1.2)).observe(root, { attributes: true });
    return;
  }

  (function loop(now) {
    draw(now / 1000);
    requestAnimationFrame(loop);
  })(0);
})();

// Resume: highlight the section currently on screen in the index -------
(function () {
  const links = document.querySelectorAll('.toc a');
  if (!links.length || !('IntersectionObserver' in window)) return;
  const byId = new Map([...links].map(a => [a.getAttribute('href').slice(1), a]));
  const observer = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      links.forEach(a => a.classList.remove('active'));
      byId.get(e.target.id)?.classList.add('active');
    }
  }, { rootMargin: '-30% 0px -60% 0px' });
  byId.forEach((_, id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });
})();

// Photo ribbon: duplicate the photos so the CSS animation can loop without a gap
document.querySelectorAll('.ribbon-track').forEach(track => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (const img of [...track.children]) {
    const copy = img.cloneNode();
    copy.alt = '';
    copy.setAttribute('aria-hidden', 'true');
    track.append(copy);
  }
});

// Looping clips: play only while on screen; with reduced motion, show controls instead
document.querySelectorAll('video[loop][muted]').forEach(video => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) {
    video.controls = true;
    return;
  }
  new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) video.play().catch(() => { video.controls = true; });
    else video.pause();
  }, { threshold: 0.4 }).observe(video);
});
