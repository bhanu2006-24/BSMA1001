
/**
 * Universal Course Data Handler
 * Supports a dynamic 'Section-based' architecture.
 */

const DEFAULT_COURSE = {
    meta: {
        title: "Universal Course Template",
        subtitle: "A Masterclass in Flexibility",
        author: "Instructor Name",
        accentColor: "#6366f1",
        version: "1.0"
    },
    sections: [
        {
            id: 'sec_about',
            type: 'text',
            title: 'About This Course',
            content: "## Welcome!\nThis is a fully customizable course template. You can add videos, code compilers, resources, and more."
        },
        {
            id: 'sec_module_1',
            type: 'module',
            title: 'Module 1: Getting Started',
            items: []
        },
        {
            id: 'sec_playground',
            type: 'compiler',
            title: 'Code Playground',
            language: 'python' // default
        }
    ]
};

export async function loadCourse() {
    try {
        const res = await fetch(`./course.json?t=${Date.now()}`);
        if (!res.ok) throw new Error("No file");
        const data = await res.json();
        // Merge with default meta if missing for migration
        if (!data.meta) data.meta = { ...DEFAULT_COURSE.meta };
        if (!data.sections) data.sections = [...DEFAULT_COURSE.sections];
        return data;
    } catch (e) {
        console.warn("Initializing new course structure.");
        return JSON.parse(JSON.stringify(DEFAULT_COURSE));
    }
}

export function exportCourse(courseData) {
    const json = JSON.stringify(courseData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = "course.json";
    a.click();
    URL.revokeObjectURL(url);
}
