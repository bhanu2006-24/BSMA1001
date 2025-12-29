
/**
 * Course Data Service
 * Handles loading and saving of course content.
 * Supports: Local Python Server (PUT), Browser Download (Fallback)
 */

const DATA_URL = './assets/course.json';

const DEFAULT_COURSE = {
    meta: {
        title: "New Universal Course",
        subtitle: "Course Structure",
        accentColor: "#3b82f6",
        version: "3.5"
    },
    sections: []
};

// --- Load ---

export async function loadCourse() {
    try {
        const res = await fetch(`${DATA_URL}?t=${Date.now()}`);
        if (!res.ok) throw new Error("File not found");
        const data = await res.json();
        return normalize(data);
    } catch (e) {
        console.warn("Loading default template.", e);
        return JSON.parse(JSON.stringify(DEFAULT_COURSE));
    }
}

// --- Save ---

export async function saveCourse(courseData) {
    console.log("Saving course...");
    // 1. Try Local Server (PUT)
    try {
        const res = await fetch(DATA_URL, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(courseData, null, 2)
        });
        if (res.ok) {
            alert("Saved successfully to assets/course.json!");
            return true;
        }
    } catch (e) {
        console.log("Local server save failed, falling back to download.", e);
    }

    // 2. Fallback: Download Blob
    downloadJson(courseData);
    return false; // Indicates server save failed
}

// --- Upload Asset ---

export async function uploadAsset(file, subfolder = '') {
    // This only works if local_server.py is running
    const path = `assets/${subfolder}${file.name}`;
    try {
        const res = await fetch(path, {
            method: 'PUT',
            body: file
        });
        if (res.ok) return { success: true, path };
    } catch (e) {
        console.error("Upload failed", e);
    }
    return { success: false, path }; // Return intended path even if save failed (manual move req)
}

// --- Helpers ---

function normalize(data) {
    if (!data.meta) data.meta = { ...DEFAULT_COURSE.meta };
    if (!data.sections) data.sections = [];
    // Ensure all sections have items array
    data.sections.forEach(sec => {
        if (!sec.items) sec.items = [];
        // Migration logic for older versions could go here
    });
    return data;
}

function downloadJson(data) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "course.json";
    a.click();
    URL.revokeObjectURL(url);
    alert("Downloaded course.json. Please move it to the 'assets' folder.");
}
