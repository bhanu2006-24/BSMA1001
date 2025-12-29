
export function initResizer(resizerId, leftPaneId, rightPaneId, containerId, direction = 'horizontal') {
    const resizer = document.getElementById(resizerId);
    const leftPane = document.getElementById(leftPaneId);
    const rightPane = document.getElementById(rightPaneId);
    const container = document.getElementById(containerId);

    if (!resizer || !leftPane || !rightPane || !container) {
        console.warn("Resizer elements not found");
        return;
    }

    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
        resizer.classList.add('active');
        e.preventDefault(); // Prevent text selection
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const containerRect = container.getBoundingClientRect();
        
        if (direction === 'horizontal') {
            let newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
            // Constraints
            if (newWidth < 15) newWidth = 15;
            if (newWidth > 85) newWidth = 85;
            
            leftPane.style.width = `${newWidth}%`;
            rightPane.style.width = `${100 - newWidth}%`;
        } else {
             // Logic for vertical if needed later
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = 'default';
            resizer.classList.remove('active');
        }
    });
}
