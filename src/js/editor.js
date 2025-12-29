
import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { loadCourse, saveCourse, uploadAsset } from '../services/course_data.js';
import { renderMarkdown, configureMarkdown } from '../services/md.js';

configureMarkdown();

const App = {
    data() {
        return {
            course: { meta: { title: '', subtitle: '', accentColor: '' }, sections: [] },
            currentSecId: 'meta',
            unsaved: false,
        }
    },
    computed: {
        activeIsMeta() { return this.currentSecId === 'meta'; },
        activeSec() { return this.course.sections.find(s => s.id === this.currentSecId); }
    },
    watch: {
        course: { handler() { this.unsaved = true; }, deep: true },
        'activeSec.items': {
            handler() { this.initItemSortable(); }, 
            deep: false 
        }
    },
    async mounted() {
        this.course = await loadCourse();
        this.initSectionSortable();
    },
    updated() {
        // Re-init sortables when DOM updates
        this.initItemSortable();
        this.initQuestionSortables();
    },
    methods: {
        async save() {
            const serverSaved = await saveCourse(this.course);
            if(serverSaved) this.unsaved = false;
        },
        
        // --- Drag & Drop (SortableJS) ---
        initSectionSortable() {
            const el = this.$refs.sectionList;
            if (el && !el._sortable) {
                el._sortable = new Sortable(el, {
                    handle: '.drag-handle',
                    animation: 150,
                    onEnd: (evt) => {
                        const item = this.course.sections.splice(evt.oldIndex, 1)[0];
                        this.course.sections.splice(evt.newIndex, 0, item);
                    }
                });
            }
        },
        initItemSortable() {
            const el = this.$refs.itemList;
            if (el && !el._sortable && this.activeSec) {
                el._sortable = new Sortable(el, {
                    handle: '.drag-handle',
                    animation: 150,
                    group: 'items',
                    onEnd: (evt) => {
                        const item = this.activeSec.items.splice(evt.oldIndex, 1)[0];
                        this.activeSec.items.splice(evt.newIndex, 0, item);
                    }
                });
            }
        },
        initQuestionSortables() {
            // Find all question lists and init sortable
            document.querySelectorAll('.question-list').forEach((el, idx) => {
                 if(!el._sortable) {
                     // Find the parent item to access data
                     const itemIdx = el.getAttribute('data-item-idx');
                     if(itemIdx != null) {
                        el._sortable = new Sortable(el, {
                            handle: '.q-drag',
                            animation: 150,
                            onEnd: (evt) => {
                                const qList = this.activeSec.items[itemIdx].questions;
                                const q = qList.splice(evt.oldIndex, 1)[0];
                                qList.splice(evt.newIndex, 0, q);
                            }
                        });
                     }
                 }
            });
        },
        
        // --- Navigation ---
        selectSec(id) { this.currentSecId = id; },
        
        // --- Section Management ---
        addSection() {
            const id = 'sec_' + Date.now();
            this.course.sections.push({ id, title: 'New Section', items: [], isOpen: true });
            this.selectSec(id);
        },
        delSection() {
            if(!confirm("Delete this entire section?")) return;
            const idx = this.course.sections.findIndex(s => s.id === this.currentSecId);
            if(idx > -1) {
                this.course.sections.splice(idx, 1);
                this.currentSecId = 'meta';
            }
        },
        duplicateSection(sec) {
            const newSec = JSON.parse(JSON.stringify(sec));
            newSec.id = 'sec_' + Date.now();
            newSec.title += ' (Copy)';
            newSec.items.forEach(i => i.id = 'item_' + Math.random().toString(36).substr(2, 9));
            this.course.sections.push(newSec);
            this.selectSec(newSec.id);
        },

        // --- Item Management ---
        addItem(type) {
            if(!this.activeSec) return;
            const item = {
                id: 'item_' + Date.now(),
                type,
                title: 'New ' + this.capitalize(type),
                isOpen: true
            };
            // Defaults
            if(type === 'text') { item.content = ''; item.preview = false; }
            if(type === 'compiler') { item.language = 'python'; item.starterCode = 'print("Hello World")'; }
            if(type === 'quiz') item.questions = [];
            if(type === 'faq') item.faqs = [{ q: 'Question?', a: 'Answer.' }];
            if(type === 'calendar') item.events = [{ date: '2025-01-01', title: 'Event', type: 'lecture' }];
            
            this.activeSec.items.push(item);
        },
        delItem(idx) {
            if(confirm("Delete this item?")) this.activeSec.items.splice(idx, 1);
        },
        duplicateItem(item) {
            const newItem = JSON.parse(JSON.stringify(item));
            newItem.id = 'item_' + Date.now();
            newItem.title += ' (Copy)';
            this.activeSec.items.push(newItem);
        },

        // --- Feature Helpers ---
        addQuestion(item) {
            if(!item.questions) item.questions = [];
            item.questions.push({ 
                type: 'mcq', 
                text: 'New Question', 
                options: [{ text: 'Option A', correct: false }, { text: 'Option B', correct: true }] 
            });
        },
        async handleUpload(e, item) {
            const file = e.target.files[0];
            if(!file) return;
            
            let folder = 'files/';
            if(file.type.startsWith('image')) folder = 'imgs/';
            if(file.type.startsWith('video')) folder = 'videos/';
            if(file.type.includes('pdf')) folder = 'pdf/';
            
            const res = await uploadAsset(file, folder);
            item.url = res.path;
            
            if(res.success) {
                // Good
            } else {
                alert("Upload failed. Is local_server.py running?\nPath set to: " + res.path);
            }
        },
        capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); },
        
        // --- UI ---
        getIcon(t) {
            const m = { text: 'fa-paragraph', video: 'fa-video', quiz: 'fa-list-check', compiler: 'fa-code', resource: 'fa-file', pdf: 'fa-file-pdf', faq: 'fa-clipboard-question', calendar: 'fa-calendar-days' };
            return 'fa-solid ' + (m[t] || 'fa-box');
        },
        renderMd(t) { return renderMarkdown(t || ''); },

        // --- MathJax ---
        previewMath() {
            this.$nextTick(() => { if(window.MathJax) window.MathJax.typesetPromise(); });
        }
    }
};

createApp(App).mount('#app');
