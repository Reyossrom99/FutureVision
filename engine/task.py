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
            "--workers", str(training.input.get("workers"))
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
