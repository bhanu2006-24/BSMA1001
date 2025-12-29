# Universal Course Builder (v4)

A modular, file-based course creation engine designed for static hosting (GitHub Pages) with a powerful local editor.

## 📂 Project Structure

This project follows a strict modular architecture to keep logic, data, and presentation separate.

```
/
├── index.html              # The public Course Viewer (Deploy this!)
├── editor.html             # The local Course Editor (For authors)
├── START_EDITOR.command    # Double-click this to launch the Editor
├── local_server.py         # (Legacy Stub) See src/py/
│
├── assets/                 # All course content goes here
│   ├── course.json         # The master data file
│   ├── imgs/               # Images
│   ├── videos/             # Local videos
│   └── pdf/                # Documents
│
└── src/
    ├── js/                 # Application Logic
    │   ├── editor.js       # Vue.js logic for Editor
    │   └── viewer.js       # Vue.js logic for Viewer
    │
    ├── services/           # Reusable Core Services
    │   ├── course_data.js  # Data Loading/Saving/Uploading
    │   ├── compiler.js     # Python/JS Code Execution Engine
    │   └── md.js           # Markdown Rendering Service
    │
    └── py/                 # Backend Utilities
        └── local_server.py # Python-based Save/Upload Server
```

## 🚀 How to Use

### 1. Editing the Course

You cannot edit files directly on GitHub Pages. You must edit locally:

1.  **Launch**: Double-click `START_EDITOR.command` (macOS) or run `python3 src/py/local_server.py` in terminal.
2.  **Edit**: The editor opens in your browser.
    - **Drag & Drop** sections to reorder.
    - **Add Media**: Uploading items automatically saves them to `assets/`.
    - **Save**: Clicks "Save" to write changes to `assets/course.json`.

### 2. Publishing

Since `index.html` is static:

1.  Commit and Push your changes (including `assets/`).
2.  Enable **GitHub Pages** for your repository.
3.  Your course is live!

## 🛠 Tech Stack

- **Frontend**: HTML5, TailwindCSS, Vue.js (via CDN), FontAwesome.
- **Core**: Pyodide (Python in Browser), MathJax (LaTeX), Marked.js (Markdown).
- **Backend (Local Only)**: Python `http.server` for file system access during editing.

## ⚠️ Notes

- **Do not move** files inside `src/`. The imports rely on this structure.
- Your course data lives entirely in `assets/`. Back this folder up!
