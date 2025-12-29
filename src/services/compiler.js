
/**
 * Simple Code Compiler/Runner Interface
 * Currently supports JavaScript (native) and Python (via Pyodide if available).
 */

export class CodeCompiler {
    constructor() {
        this.pyodide = null;
        this.isLoadingPyodide = false;
    }

    async initPython() {
        if (this.pyodide) return;
        this.isLoadingPyodide = true;
        try {
            // Check if Pyodide script is loaded in HTML
            if (window.loadPyodide) {
                this.pyodide = await window.loadPyodide();
                console.log("Python Environment Loaded");
            } else {
                console.warn("Pyodide script not found in HTML.");
            }
        } catch (e) {
            console.error("Failed to load Pyodide", e);
        } finally {
            this.isLoadingPyodide = false;
        }
    }

    async run(code, language = 'javascript') {
        if (language === 'javascript') {
            return this.runJS(code);
        } else if (language === 'python') {
            return this.runPython(code);
        }
        return { output: '', error: 'Unsupported language' };
    }

    runJS(code) {
        const logs = [];
        const originalConsoleLog = console.log;
        
        // Capture console.log
        console.log = (...args) => {
            logs.push(args.map(a => String(a)).join(' '));
        };

        try {
            // Using Function constructor for a slight isolation, though still in main thread
            // For production, use Web Workers
            const func = new Function(code);
            func();
            return { output: logs.join('\n'), error: null };
        } catch (e) {
            return { output: logs.join('\n'), error: e.toString() };
        } finally {
            console.log = originalConsoleLog;
        }
    }

    async runPython(code) {
        if (!this.pyodide) {
            if (!this.isLoadingPyodide) await this.initPython();
            if (!this.pyodide) return { output: '', error: 'Python environment not ready. Please wait or reload.' };
        }

        try {
            // Redirect stdout
            this.pyodide.setStdout({ batched: (msg) => console.log("[Python Output]", msg) });
            
            // Pyodide stdout capture requires a bit more setup usually, 
            // but runPython returns the last expression value.
            // We can simple use runPythonAsync
            await this.pyodide.loadPackagesFromImports(code);
            
            // Capture stdout simple way
            this.pyodide.runPython(`
import sys
import io
sys.stdout = io.StringIO()
            `);
            
            await this.pyodide.runPythonAsync(code);
            
            const stdout = this.pyodide.runPython("sys.stdout.getvalue()");
            return { output: stdout, error: null };

        } catch (e) {
            return { output: '', error: e.toString() };
        }
    }
}
