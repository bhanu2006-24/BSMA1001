import http.server
import socketserver
import os

PORT = 8000
DIRECTORY = "."

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_PUT(self):
        """Save a file to the local filesystem."""
        path = self.translate_path(self.path)
        length = int(self.headers['Content-Length'])
        data = self.rfile.read(length)
        
        try:
            # Ensure directory exists
            os.makedirs(os.path.dirname(path), exist_ok=True)
            
            with open(path, 'wb') as f:
                f.write(data)
                
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "saved"}')
            print(f"Saved file: {path}")
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode())
            print(f"Error saving file: {e}")

    def do_POST(self):
        """Handle uploads same as PUT for simplicity here."""
        self.do_PUT()

print(f"Starting Local Course Server at http://localhost:{PORT}")
print("You can now save changes directly from the Editor.")
print("Press Ctrl+C to stop.")

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    httpd.serve_forever()
