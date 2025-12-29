
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';

export function configureMarkdown() {
    // Configure marked options if needed
    marked.setOptions({
        gfm: true,
        breaks: true,
        highlight: function (code, lang) {
            // Optional: integration with highlight.js if added later
            return code;
        }
    });
}

export function renderMarkdown(text) {
    if (!text) return '';
    return marked.parse(text);
}
