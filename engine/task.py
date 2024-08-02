import subprocess
import requests
import os
import logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(levelname)s - %(message)s',
                    handlers=[
                        logging.FileHandler("server.log"),
                        logging.StreamHandler()
                    ])
def execute_command(training):
      data_yaml = os.path.join(training.data_folder, "data_train.yaml")
      command = [
            "python3.8", "/app/yolov7/train.py",
            "--batch-size", str(training.input.get("batchSize")),
            "--img-size", str(training.input.get("imgSizeTrain")),
            "--epochs", str(training.input.get("epochs")),
            "--data", str(data_yaml),
            "--cfg", "/app/yolov7/cfg/training/" + str(training.input.get("cfg")) + ".yaml",
            "--workers", str(training.input.get("workers")),
            "--project",  str(training.data_folder)
        ]

      if not training.input.get("weights"):
            command.extend(["--weights", ""])
      else:
            command.extend(["--weights", "/app/yolov7/weights/" + str(training.input.get("cfg")) + ".pt"])

      if training.input.get("no_test"):
            command.append("--no_test")
      print("command", command)


      log_file = os.path.join(training.data_folder, "data_train.log")
      with open(log_file, 'w') as f:
        process = subprocess.Popen(command, stdout=f, stderr=f)
        process.communicate()

      f.close()
      notify_url = "http://django-server:8000/projects/notify"  # URL de la vista de Django
      notify_data = {
        'training_id': training.training_id,
        'status': 'completed'
      }
      try:
        response = requests.post(notify_url, json=notify_data)
        if response.status_code == 200:
            logging.info(f"Notification sent successfully for project {training.project_id}")
        else:
           logging.info(f"Failed to send notification for project {training.project_id}: {response.status_code}")
      except requests.exceptions.RequestException as e:
        logging.info(f"Error sending notification for project {training.project_id}: {e}")

def run_tensorboard(port=6006, log_dir="/app/media/train"): 
    try:
        # Construir el comando para iniciar TensorBoard
        tensorboard_command = ["tensorboard", "--logdir", log_dir, "--port", str(port)]
        
        # Iniciar TensorBoard como un proceso independiente
        process = subprocess.Popen(tensorboard_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        returncode = process.returncode

        if returncode == 0:
            logging.info((f"Comando ejecutado correctamente: {stdout.decode()}"))
            return {'status': 'success', 'output': stdout.decode()}
        else:
            logging.error(f"Error al ejecutar comando: {stderr.decode()}")
            return {'status': 'error', 'error': stderr.decode()}


    except Exception as e:
        logging.error(f"Error al iniciar TensorBoard: {e}")
        return False
