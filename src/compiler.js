
/**
 * Handles data fetching and processing for the course.
 * Effectively the "Data Layer".
 */

export async function loadCourses(url = './course.json') {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            // If 404, return empty array for editor to start fresh
            if (response.status === 404) return [];
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return normalizeData(data);
    } catch (e) {
        console.warn('Could not load courses, starting empty.', e);
        return [];
    }
}

// Ensure every course object has the necessary fields
function normalizeData(courses) {
    if (!Array.isArray(courses)) return [];
    
    return courses.map(c => ({
        id: c.id || Date.now().toString() + Math.random().toString(36).substr(2, 9),
        code: c.code || 'NEW',
        name: c.name || 'New Course',
        desc: c.desc || '',
        credits: c.credits || 0,
        tags: c.tags || [],
        weeks: c.weeks || [], // Structure: { title, content, isOpen }
        resources: c.resources || [] // Structure: { type, title, url }
    }));
}

export function saveCoursesToFile(courses) {
    // This function returns a Blob/Object URL for downloading because 
    // we can't write to distinct server files without a backend API.
    // The File System Access API is handled in the UI layer usually, 
    // but we can prepare the blob here.
    return new Blob([JSON.stringify(courses, null, 2)], { type: 'application/json' });
}
