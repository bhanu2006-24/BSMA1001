
// Basic PDF Viewer using Object/Embed fallback or simple link
// For a full PDF.js implementation we would need to fetch the library. 
// We will use a native approach for simplicity and performance unless requested otherwise.

export function renderPDF(containerId, url) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear
    container.innerHTML = '';

    if (!url) {
        container.innerHTML = '<div class="flex items-center justify-center h-48 text-gray-500">No PDF URL provided</div>';
        return;
    }

    const object = document.createElement('object');
    object.data = url;
    object.type = 'application/pdf';
    object.className = 'w-full h-full min-h-[500px] rounded-lg border border-[#333]';

    const fallback = document.createElement('p');
    fallback.innerHTML = `Your browser does not support PDFs. <a href="${url}" target="_blank" class="text-indigo-400 underline">Download the PDF</a>.`;
    
    object.appendChild(fallback);
    container.appendChild(object);
}
