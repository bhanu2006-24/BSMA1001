
/**
 * Universal Course Data Handler (v3)
 * Structure: Course -> Sections -> Items (Universal Blocks)
 */

const DEFAULT_COURSE = {
    meta: {
        title: "New Universal Course",
        subtitle: "Course Structure",
        accentColor: "#3b82f6",
        version: "3.0"
    },
    sections: [
        {
            id: "sec_welcome",
            title: "Introduction",
            items: [
                {
                    id: "item_welcome_text",
                    type: "text",
                    title: "Welcome Note",
                    content: "# Welcome to the Course\nThis is a universal text block."
                }
            ]
        }
    ]
};

export async function loadCourse() {
    try {
        const res = await fetch(`./assets/course.json?t=${Date.now()}`);
        if (!res.ok) throw new Error("No file");
        const data = await res.json();
        
        // Migration/Normalization
        if (!data.meta) data.meta = { ...DEFAULT_COURSE.meta };
        if (!data.sections) data.sections = [];
        
        // Normalize sections to have items
        data.sections.forEach(sec => {
            if (!sec.items) sec.items = [];
            // If old format (type=text with content), convert to item
            if (sec.type === 'text' && sec.content && sec.items.length === 0) {
                sec.items.push({ type: 'text', title: 'Overview', content: sec.content });
            }
            // If old format (type=compiler), convert to item
            if (sec.type === 'compiler' && sec.items.length === 0) {
                sec.items.push({ 
                    type: 'compiler', 
                    title: 'Coding Exercise', 
                    language: sec.language || 'python', 
                    starterCode: sec.starterCode 
                });
            }
        });
        
        return data;
    } catch (e) {
        console.warn("Loading default data.", e);
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
