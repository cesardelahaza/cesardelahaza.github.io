let dark;

// Wait for DOM to load
window.addEventListener('DOMContentLoaded', () => {
    const nightIcon = document.getElementById('nightIcon');

    // If there is a saved value, use it
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
        dark = saved === 'true';
    } else {
        // Otherwise detect by icon
        dark = window.getComputedStyle(nightIcon).display !== 'none';
    }

    // Apply current mode at load
    applyMode();
});

function applyMode() {
    const root = document.documentElement;

    if (dark) {
        // Dark mode
        // Icons
        document.getElementById('dayIcon').style.display = 'inline';
        document.getElementById('nightIcon').style.display = 'none';

        // Background and text colors
        root.style.setProperty('--bg-color', 'var(--bg-color-dark)');
        root.style.setProperty('--text-color', 'var(--text-color-light)');
        root.style.setProperty('--icon-color', 'var(--text-color-light)');
        root.style.setProperty('--inner-shadow', 'var(--light-shadow-color)');
        root.style.setProperty('--outer-shadow', 'var(--dark-shadow-color)');
    } else {
        // Light mode
        // Icons
        document.getElementById('dayIcon').style.display = 'none';
        document.getElementById('nightIcon').style.display = 'inline';

        // Background and text colors
        root.style.setProperty('--bg-color', 'var(--bg-color-light)');
        root.style.setProperty('--text-color', 'var(--text-color-dark)');
        root.style.setProperty('--icon-color', 'var(--text-color-dark)');
        root.style.setProperty('--inner-shadow', 'var(--dark-shadow-color)');
        root.style.setProperty('--outer-shadow', 'var(--light-shadow-color)');
    }
}

window.togglemode = function () {
    dark = !dark;
    localStorage.setItem('darkMode', dark);
    applyMode();
};


window.transitionToPage = function (href) {
    document.querySelector('body').style.opacity = 0
    setTimeout(function () {
        window.location.href = href
    }, 500)
};

/* For slow scrolling in Resume section */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

/*====================================================*/
/*===========This is for stars animation==============*/
(function () {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  document.body.appendChild(canvas);

  canvas.style.position = "fixed";
  canvas.style.top = 0;
  canvas.style.left = 0;
  canvas.style.zIndex = "-3";
  canvas.style.pointerEvents = "none";

  function resize() {
    // Real size in pixels
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener("resize", resize);
  window.addEventListener("orientationchange", resize); // responsive

  const numStars = 200;
  const speed = 0.5;
  let stars = [];

  function createStar() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * canvas.width,
    };
  }

  for (let i = 0; i < numStars; i++) stars.push(createStar());

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let star of stars) {
      star.z -= speed;
      if (star.z <= 0) Object.assign(star, createStar());

      const k = 200 / star.z;
      const sx = star.x * k + canvas.width / 2 - (canvas.width / 2) * k;
      const sy = star.y * k + canvas.height / 2 - (canvas.height / 2) * k;

      const size = Math.max(0.5, 2 - star.z / 200);

      
      if (dark) {
        ctx.fillStyle = "white";
      } else {
        ctx.fillStyle = "black";
      }
      ctx.fillRect(sx, sy, size, size);
    }

    requestAnimationFrame(animate);
  }

  animate();
})();
