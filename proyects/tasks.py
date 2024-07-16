from celery import shared_task
from .models import Training
import subprocess 
import os 
import logging
import yaml

log = logging.getLogger("docker")
is_tensorboard = False 
@shared_task
def train_model(training_id):
    try:
        
        training = Training.objects.get(training_id=training_id)
        
        # Aquí debes extraer los parámetros necesarios para el entrenamiento
        # Por ejemplo, si tienes los parámetros en el campo 'input' como JSON
        input_params = training.input
        log.info(training.input)

        #save yaml training file in data folder 
        train_data = os.path.join(training.data_folder,"data_train.yaml")

        with open(train_data, 'w') as file : 
            file.write(training.data)


        command = [
                "python3.8", "/app/yolov7/train.py",
                "--batch-size", str(input_params.get("batchSize")),
                "--img-size", str(input_params.get("imgSizeTrain")),
                "--epochs", str(input_params.get("epochs")),
                "--data", str(train_data),
                "--cfg", "/app/yolov7/cfg/training/" + str(input_params.get("cfg")) + ".yaml",
                "--workers", str(input_params.get("workers"))
    ]
        if input_params.get("weights")== False: 
            command.append("--weights")
            command.append("")
        else: 
            command.append("--weights")
            command.append("/app/yolov7/weights/" + str(input_params.get("cfg")) + ".pt")

        if input_params.get("no_test"):
            command.append("--no_test")

        print("command: ",  command)

        # Ejecutar el comando de entrenamiento
        subprocess.run(command)
        
        log.info("running command")

        # Actualizar el estado en la base de datos
        training.is_training = True
        training.save()

        return True

    except Training.DoesNotExist as e:
        log.info("training error: ", e)
        return e
    except Exception as e:
        log.info("exception: ", e)
        return e

@shared_task
def start_tensorboard(log_dir="runs/train", port=6006):
    try:
        # Construir el comando para iniciar TensorBoard
        tensorboard_command = ["tensorboard", "--logdir", log_dir, "--port", str(port), "--host", "0.0.0.0"]
        
        # Iniciar TensorBoard como un proceso independiente
        process = subprocess.Popen(tensorboard_command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()
        returncode = process.returncode

        if returncode == 0:
            print((f"Comando ejecutado correctamente: {stdout.decode()}"))
            return {'status': 'success', 'output': stdout.decode()}
        else:
            print(f"Error al ejecutar comando: {stderr.decode()}")
            return {'status': 'error', 'error': stderr.decode()}

        #log.info(f"TensorBoard iniciado. Ver en http://localhost:{port}/")
       
        #return True

    except Exception as e:
        log.error(f"Error al iniciar TensorBoard: {e}")
        return False

