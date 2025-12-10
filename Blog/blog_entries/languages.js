async function loadLanguage(lang) {
    let translations = {};

    try {
        const res = await fetch(`${lang}.json`);
        if (res.ok) translations = await res.json();
    } catch (e) {

    }

    const resEn = await fetch(`en.json`);
    const enTranslations = await resEn.json();

    document.querySelectorAll("[trans]").forEach(el => {
        const key = el.getAttribute("trans");
        const value = translations[key] || enTranslations[key] || key;

        if (el.tagName === "IMG") {
            el.src = value;
        } else {
            el.innerHTML = value;
        }

        if (window.MathJax) {
            MathJax.typesetPromise([el]); // make sure it is renderized
        }
    });

    localStorage.setItem("lang", lang);

    document.querySelector(".entry-cover").style.opacity = 1;
    document.querySelector(".entry-text").style.opacity = 1;
}

const storedLang = localStorage.getItem("lang");
const browserLang = navigator.language.slice(0, 2);

loadLanguage(storedLang || browserLang);
