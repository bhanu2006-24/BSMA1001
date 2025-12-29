
/**
 * Universal Code Compiler
 * Supports: Python (Pyodide), JavaScript (Unsafe Eval), HTML/CSS (IFrame)
 */

export class CodeCompiler {
    constructor() {
        this.pyodide = null;
        this.isLoadingPyodide = false;
    }

    async initPython() {
        if (this.pyodide || this.isLoadingPyodide) return;
        this.isLoadingPyodide = true;
        try {
            if (window.loadPyodide) {
                this.pyodide = await window.loadPyodide();
                console.log("Pyodide Ready");
            }
        } catch (e) {
            console.error("Pyodide Load Error", e);
        } finally {
            this.isLoadingPyodide = false;
        }
    }

    async run(code, language) {
        if (language === 'python') return this.runPython(code);
        if (language === 'javascript') return this.runJS(code);
        return { output: 'Language not supported for console execution.', error: null };
    }

    runJS(code) {
        const logs = [];
        const originalLog = console.log;
        console.log = (...args) => logs.push(args.join(' '));
        
        try {
            // Basic isolation
            new Function(code)();
            return { output: logs.join('\n'), error: null };
        } catch (e) {
            return { output: logs.join('\n'), error: e.toString() };
        } finally {
            console.log = originalLog;
        }
    }

    async runPython(code) {
        if (!this.pyodide) {
            await this.initPython();
            if (!this.pyodide) return { output: '', error: 'Python engine failed to load.' };
        }
        try {
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
