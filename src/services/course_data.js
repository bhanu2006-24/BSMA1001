
/**
 * Universal Course Data Handler
 * Fetches data from assets/course.json
 */

const DEFAULT_COURSE = {
    meta: {
        title: "New Universal Course",
        subtitle: "Course Template",
        accentColor: "#6366f1",
        version: "2.0"
    },
    sections: []
};

export async function loadCourse() {
    try {
        // Updated path to assets folder
        const res = await fetch(`./assets/course.json?t=${Date.now()}`);
        if (!res.ok) throw new Error("No file");
        const data = await res.json();
        
        if (!data.meta) data.meta = { ...DEFAULT_COURSE.meta };
        if (!data.sections) data.sections = [];
        
        return data;
    } catch (e) {
        console.warn("Loading default data (assets/course.json not found or invalid).", e);
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
