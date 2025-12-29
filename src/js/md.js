
import { marked } from 'https://cdn.jsdelivr.net/npm/marked/lib/marked.esm.js';

export function configureMarkdown() {
    // Optional: Configure marked options here
    marked.setOptions({
        breaks: true, // Enable line breaks
        gfm: true     // GitHub Flavored Markdown
    });
}

export function renderMarkdown(text) {
    if (!text) return '';
    try {
        return marked.parse(text);
    } catch (e) {
        console.error("Markdown parsing error", e);
        return text;
    }
}
