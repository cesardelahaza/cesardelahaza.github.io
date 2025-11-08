let dark = true;

window.togglemode = function () {
    const root = document.documentElement; // :root

    const bgLight = getComputedStyle(root).getPropertyValue('--bg-color-light').trim();
    const textLight = getComputedStyle(root).getPropertyValue('--text-color-light').trim();
    const bgDark = getComputedStyle(root).getPropertyValue('--bg-color-dark').trim();
    const textDark = getComputedStyle(root).getPropertyValue('--text-color-dark').trim();
    
    if (dark) {
        // Cambia a modo oscuro
        document.getElementById('dayIcon').style.display = 'inline';
        document.getElementById('nightIcon').style.display = 'none';

        root.style.setProperty('--bg-color', 'var(--bg-color-dark)');
        root.style.setProperty('--text-color', 'var(--text-color-light)');
        root.style.setProperty('--icon-color', 'var(--text-color-light)');
    } else {
        // Cambia a modo claro
        document.getElementById('dayIcon').style.display = 'none';
        document.getElementById('nightIcon').style.display = 'inline';

        root.style.setProperty('--bg-color', 'var(--bg-color-light)');
        root.style.setProperty('--text-color', 'var(--text-color-dark)');
        root.style.setProperty('--icon-color', 'var(--text-color-dark)');
    }
    dark = !dark;
};

window.transitionToPage = function (href) {
    document.querySelector('body').style.opacity = 0
    setTimeout(function () {
        window.location.href = href
    }, 500)
};