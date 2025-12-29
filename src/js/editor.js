
import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
import { loadCourse, saveCourse, uploadAsset } from '../services/course_data.js';
import { renderMarkdown, configureMarkdown } from '../services/md.js';

configureMarkdown();

const App = {
    data() {
        return {
            course: { meta: {}, sections: [] },
            currentSecId: 'meta',
            unsaved: false,
            // Drag state
            dragItem: null,
            dragSec: null
        }
    },
    computed: {
        activeIsMeta() { return this.currentSecId === 'meta'; },
        activeSec() { return this.course.sections.find(s => s.id === this.currentSecId); }
    },
    watch: {
        course: {
            handler() { this.unsaved = true; },
            deep: true
        }
    },
    async mounted() {
        this.course = await loadCourse();
        this.setupSortable();
    },
    methods: {
        async save() {
            const serverSaved = await saveCourse(this.course);
            if(serverSaved) this.unsaved = false;
        },
        setupSortable() {
            // Re-init sortables if needed, or rely on native Drag/Drop API for cleaner module approach
            // For now, simple array moves are handled by buttons or simple sortable lib if loaded
        },
        
        // --- Nav ---
        selectSec(id) { this.currentSecId = id; },
        
        // --- CRUD Section ---
        addSection() {
            const id = 'sec_' + Date.now();
            this.course.sections.push({ id, title: 'New Section', items: [], isOpen: true });
            this.selectSec(id);
        },
        delSection() {
            if(!confirm("Delete this section?")) return;
            const idx = this.course.sections.findIndex(s => s.id === this.currentSecId);
            if(idx > -1) {
                this.course.sections.splice(idx, 1);
                this.currentSecId = 'meta';
            }
        },

        // --- CRUD Item ---
        addItem(type) {
            if(!this.activeSec) return;
            const item = {
                id: 'item_' + Date.now(),
                type,
                title: 'New ' + type,
                isOpen: true
            };
            // Defaults
            if(type === 'text') item.content = '';
            if(type === 'compiler') { item.language = 'python'; item.starterCode = 'print("Hello World")'; }
            if(type === 'quiz') item.questions = [];
            
            this.activeSec.items.push(item);
        },
        delItem(idx) {
            if(confirm("Delete item?")) this.activeSec.items.splice(idx, 1);
        },

        // --- Features ---
        addQuestion(item) {
            if(!item.questions) item.questions = [];
            item.questions.push({ type: 'mcq', text: 'New Question', options: ['A', 'B'] });
        },
        async handleUpload(e, item) {
            const file = e.target.files[0];
            if(!file) return;
            
            let folder = 'files/';
            if(file.type.startsWith('image')) folder = 'imgs/';
            if(file.type.startsWith('video')) folder = 'videos/';
            
            // Try to upload
            const res = await uploadAsset(file, folder);
            item.url = res.path;
            
            if(res.success) alert("Uploaded successfully!");
            else alert("Could not upload automatically (Server not running?).\n\nSelected path set to: " + res.path + "\nPlease move the file manually to the assets folder.");
        },
        
        // --- UI ---
        getIcon(t) {
            const m = { text: 'fa-paragraph', video: 'fa-video', quiz: 'fa-list-check', compiler: 'fa-code', resource: 'fa-file', pdf: 'fa-file-pdf' };
            return 'fa-solid ' + (m[t] || 'fa-box');
        },
        renderMd(t) { return renderMarkdown(t || ''); }
    }
};

createApp(App).mount('#app');
