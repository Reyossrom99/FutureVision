import logging
from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import threading
from task import execute_command
from definitions import Training

# Configurar el módulo logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s',
                    handlers=[
                        logging.FileHandler("server.log"),
                        logging.StreamHandler()
                    ])

class RequestHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/engine/':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                data = json.loads(post_data)
                training = Training(
                    proyect_id=data['proyect_id'],
                    input=data['input'],
                    is_training=data['is_training'],
                    is_trained=data['is_trained'],
                    data=data['data'],
                    data_folder=data['data_folder']
                )
                threading.Thread(target=execute_command, args=(training,)).start()
                
                response = {'status': 'success', 'message': 'Command execution started'}
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(response).encode('utf-8'))
                logging.info(f"Command execution started for project {data['proyect_id']}")
            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response = {'status': 'fail', 'message': 'Invalid JSON'}
                self.wfile.write(json.dumps(response).encode('utf-8'))
                logging.error("Invalid JSON received")
        else:
            self.send_response(404)
            self.end_headers()
            logging.warning(f"404 Not Found: {self.path}")

def run(server_class=HTTPServer, handler_class=RequestHandler, port=4000):
    server_address = ('0.0.0.0', port)
    httpd = server_class(server_address, handler_class)
    logging.info(f'Starting httpd server on port {port}')
    httpd.serve_forever()

if __name__ == "__main__":
    run()

