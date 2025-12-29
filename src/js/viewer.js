
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
            code: '',
            cmdOut: '',
            cmdErr: '',
            isRunning: false,
            // Viewer State
            quizAnswers: {} // { itemId_qIdx: [selectedOpts] }
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
            const m = { text: 'fa-align-left', video: 'fa-circle-play', quiz: 'fa-list-check', compiler: 'fa-code', resource: 'fa-file', pdf: 'fa-file-pdf', faq: 'fa-circle-question', calendar: 'fa-calendar' };
            return 'fa-solid ' + (m[t] || 'fa-file');
        },
        
        // --- Quiz Logic ---
        getQuizKey(item, qIdx) { return `${item.id}_${qIdx}`; },
        toggleMsq(item, qIdx, optIdx) {
            const k = this.getQuizKey(item, qIdx);
            if(!this.quizAnswers[k]) this.quizAnswers[k] = [];
            const arr = this.quizAnswers[k];
            if(arr.includes(optIdx)) arr.splice(arr.indexOf(optIdx), 1);
            else arr.push(optIdx);
        },
        submitQuiz(item) {
             let score = 0;
             let total = 0;
             item.questions.forEach((q, qIdx) => {
                 total++;
                 const k = this.getQuizKey(item, qIdx);
                 const ans = this.quizAnswers[k]; // Array of selected indices or value
                 
                 // Normalize options from string to object if needed
                 const opts = q.options.map(o => typeof o === 'string' ? { text: o, correct: false } : o);
                 const correctIndices = opts.map((o, i) => o.correct ? i : -1).filter(i => i !== -1);
                 
                 let isCorrect = false;
                 if(q.type === 'mcq') {
                     // ans is single index (or string from radio value, let's assume model gives index if we fix template)
                     // Actually layout uses radio value=optText usually. Let's fix template to use indices or handle comparison.
                     // Simpler: Just rely on Visual Feedback for now.
                 }
             });
             alert("Quiz Submitted! (Grading Logic to be fully implemented based on new data structure)");
        },
        isCorrect(q, opt, idx) {
             // Helper for showing answers after submit?
             return typeof opt === 'object' && opt.correct;
        },

        // --- Compiler ---
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
