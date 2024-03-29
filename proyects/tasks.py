from celery import shared_task
from .models import Training
import subprocess  # Si planeas ejecutar un script de entrenamiento

@shared_task
def train_model(training_id):
    try:
        
        training = Training.objects.get(training_id=training_id)
        

        # Aquí debes extraer los parámetros necesarios para el entrenamiento
        # Por ejemplo, si tienes los parámetros en el campo 'input' como JSON
        input_params = training.input

        # Suponiendo que tienes un script de entrenamiento externo
        # Puedes modificar este comando según tus necesidades
        command = [
            "python", "path/to/your/training_script.py",
            "--batch_size", str(input_params.get("batch_size")),
            "--image_size", str(input_params.get("image_size")),
            "--epoch", str(input_params.get("epoch")),
            "--data", str(training.data_folder), 
            "--cfg", "cfg/yolov7.cfg", 
            "weights", "weights/yolov7.weights"
            # Agrega más argumentos según sea necesario
        ]

        if input_params.get("no_test"):
            command.append("--no_test")

        # Ejecutar el comando de entrenamiento
        subprocess.run(command)

        # Actualizar el estado en la base de datos
        training.is_training = True
        training.save()

        return True

    except Training.DoesNotExist as e:
        return e
    except Exception as e:
        return e
