
import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { loadCourse } from '../services/course_data.js';
import { renderMarkdown, configureMarkdown } from '../services/md.js';
import { CodeCompiler } from '../services/compiler.js';

configureMarkdown();
const compiler = new CodeCompiler();

const App = {
    data() {
        return {
            course: { meta: {}, sections: [] },
            activeSec: null,
            activeItem: null,
            // Compiler
            code: '',
            cmdOut: '',
            cmdErr: '',
            isRunning: false
        }
    },
    watch: {
        activeItem: {
             handler(val) {
                 this.refreshMath();
                 if(val && val.type === 'compiler') {
                     this.code = val.starterCode || '';
                     if(val.language === 'python') compiler.initPython();
                 }
                 // Reset output
                 this.cmdOut = ''; this.cmdErr = '';
             }
        }
    },
    async mounted() {
        this.course = await loadCourse();
        if(this.course.sections.length > 0) {
            const first = this.course.sections[0];
            this.toggleSec(first);
            if(first.items && first.items.length) this.selectItem(first, first.items[0]);
        }
    },
    methods: {
        renderMd(t) { return renderMarkdown(t || ''); },
        refreshMath() {
            this.$nextTick(() => { if(window.MathJax) window.MathJax.typesetPromise(); });
        },
        toggleSec(s) { s.isOpen = !s.isOpen; },
        selectItem(s, i) {
            this.activeSec = s;
            this.activeItem = i;
        },
        // Utilities
        isLocal(url) {
            return url && (url.startsWith('./') || url.startsWith('assets/') || !url.includes('http'));
        },
        getEmbed(url) {
            if(!url) return '';
            if(url.includes('youtu')) {
                 const v = url.split('v=')[1] || url.split('/').pop();
                 return `https://www.youtube.com/embed/${v.split('&')[0]}`;
            }
            return url;
        },
        getIcon(t) {
            const m = { text: 'fa-align-left', video: 'fa-circle-play', quiz: 'fa-list-check', compiler: 'fa-code', resource: 'fa-file', pdf: 'fa-file-pdf' };
            return 'fa-regular ' + (m[t] || 'fa-file');
        },
        // Compiler
        async runCode() {
            this.isRunning = true;
            this.cmdOut = 'Running...';
            this.cmdErr = '';
            const res = await compiler.run(this.code, this.activeItem.language);
            this.cmdOut = res.output;
            this.cmdErr = res.error;
            this.isRunning = false;
        }
    }
};

createApp(App).mount('#app');
