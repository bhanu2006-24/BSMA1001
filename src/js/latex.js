
export function loadMathJax() {
    window.MathJax = {
        tex: {
            inlineMath: [['$', '$'], ['\\(', '\\)']],
            displayMath: [['$$', '$$'], ['\\[', '\\]']],
            packages: ['base', 'ams', 'noerrors', 'noundefined']
        },
        options: {
            ignoreHtmlClass: 'tex2jax_ignore',
            processHtmlClass: 'tex2jax_process'
        },
        startup: {
            ready: () => {
                MathJax.startup.defaultReady();
                console.log('MathJax is loaded, but not yet processing.');
            }
        }
    };

    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js';
    script.async = true;
    document.head.appendChild(script);
}

export function renderMath(elementId) {
    if (window.MathJax && window.MathJax.typesetPromise) {
        const el = document.getElementById(elementId) || document.body;
        window.MathJax.typesetPromise([el]).catch((err) => console.log('MathJax Error:', err));
    }
}
