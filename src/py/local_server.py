import http.server
import socketserver
import os
import webbrowser
import threading
import time

PORT = 8000
DIRECTORY = "."

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_PUT(self):
        """Save a file to the local filesystem."""
        path = self.translate_path(self.path)
        try:
            length = int(self.headers['Content-Length'])
            data = self.rfile.read(length)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(path), exist_ok=True)
            
            with open(path, 'wb') as f:
                f.write(data)
                
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "saved"}')
            print(f"Saved: {self.path}")
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode())
            print(f"Error saving: {e}")

def open_browser():
    """Open the editor in the default browser after a short delay."""
    time.sleep(1)
    url = f"http://localhost:{PORT}/editor.html"
    print(f"Opening {url} ...")
    webbrowser.open(url)

print(f"Starting Local Course Server at http://localhost:{PORT}")
print("Minimizing this window will keep the server running.")
print("Close this window to stop the server.")

# Start browser in a separate thread so it doesn't block server start
threading.Thread(target=open_browser).start()

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping server.")
        httpd.server_close()
