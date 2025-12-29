
/**
 * Data handling for the Course.
 * Reads/Writes from course.json (or local fallbacks).
 */

const DEFAULT_COURSE = {
    info: {
        title: "Mathematics for Data Science I",
        code: "BSMA1001",
        credits: 4,
        type: "Foundational",
        prerequisites: "None",
        description: "This course introduces functions (straight lines, polynomials, exponentials and logarithms) and discrete mathematics (basics, graphs) with many examples.",
        instructors: [
            { name: "Neelesh Upadhye", profileLink: "https://math.iitm.ac.in/neelesh" },
            { name: "Madhavan Mukund", profileLink: "https://www.cmi.ac.in/~madhavan/" }
        ]
    },
    grading: "12 weeks of coursework, weekly online assignments, 2 in-person invigilated quizzes, 1 in-person invigilated end term exam.",
    books: [
        { title: "Introductory Algebra: a real-world approach (4th Edition)", author: "Ignacio Bello", link: "" }
    ],
    weeks: [] // { title, content: [] }
};

export async function loadCourse() {
    try {
        // Cache buster to ensure fresh data
        const res = await fetch(`./course.json?t=${Date.now()}`);
        if (!res.ok) throw new Error(res.statusText);
        const data = await res.json();
        
        // Merge with default structure to ensure migration compatibility
        // If data is array (old format), ignore and use default
        if (Array.isArray(data)) return DEFAULT_COURSE;
        
        return { ...DEFAULT_COURSE, ...data, info: { ...DEFAULT_COURSE.info, ...(data.info || {}) } };
    } catch (e) {
        console.warn("Loading default course data due to error or missing file:", e);
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
