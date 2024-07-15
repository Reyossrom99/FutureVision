# from celery import shared_task
from .models import Training
import subprocess 
import os 
import logging
import yaml

log = logging.getLogger("docker")
# @shared_task
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
            "--img-size", [str(input_params.get("imgSizeTrain")), str(input_params.get("imgTrain"))],
            "--epochs", str(input_params.get("epochs")),
            "--data", str(train_data), 
            "--cfg", "/app/yolov7/cfg/training/" + str(input_params.get("cfg")) + ".yaml", 
            "--workers", str(input_params.get("workers"))
        ]
       
        if input_params.get("weights"): 
            command.append("--weights "" ")
        else: 
            command.append("weights /app/yolov7/weights/" + str(input_params.get("cfg")) + ".pt")

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
