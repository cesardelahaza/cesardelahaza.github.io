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
    } else {
        // Light mode
        // Icons
        document.getElementById('dayIcon').style.display = 'none';
        document.getElementById('nightIcon').style.display = 'inline';

        // Background and text colors
        root.style.setProperty('--bg-color', 'var(--bg-color-light)');
        root.style.setProperty('--text-color', 'var(--text-color-dark)');
        root.style.setProperty('--icon-color', 'var(--text-color-dark)');
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

