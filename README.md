# Future Vision - YOLOv7 Training App

Future Vision is a web-based application designed to facilitate the training of YOLOv7 (You Only Look Once) models for computer vision tasks through an easy-to-use graphical interface. Built using Python (Django) for backend services and React for the frontend, this app provides a comprehensive solution for managing datasets, projects, and training models in an organized and scalable manner.

---

## Features
- **Train YOLOv7 Models**: Start and manage the training of YOLOv7 models with customizable parameters.
- **Dataset Management**: Upload, visualize, and organize datasets in formats such as YOLO and COCO.
- **Project Management**: Link datasets with training projects, allowing reuse across multiple projects.
- **GPU Support**: Leverage NVIDIA GPUs for faster training performance.
- **Interactive Interface**: Visualize training progress and dataset details via the React-based frontend.
- **TensorBoard Integration**: Access real-time training metrics and performance insights using TensorBoard.

---

## Technologies Used
- **Backend**: Django (Python), Django REST Framework, PostgreSQL
- **Frontend**: React (JavaScript), React Router
- **Training Engine**: YOLOv7, NVIDIA CUDA support
- **Containerization**: Docker, Docker Compose
- **Other Tools**: Nginx (proxy server), TensorBoard (training visualization)

---

## Getting Started

### Prerequisites
1. **Docker & Docker Compose**: Ensure Docker and Docker Compose are installed on your system. For Debian systems, you can follow the instructions in the [Docker Docs](https://docs.docker.com/get-docker/).
2. **NVIDIA GPU**: If training on a GPU, make sure the NVIDIA drivers and `nvidia-docker` are installed.

### Installation
1. **Clone the Repository**:
    ```bash
    git clone https://github.com/reyossrom/FutureVision.git
    ```

2. **Set Up Environment Variables**:
    Create a `.env` file in the project root with the following content:
    ```bash
    DB_NAME=your_db_name
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    SECRET_KEY=your_django_secret_key
    ```

3. **Build and Run the Application**:
    Use Docker Compose to build and run the application:
    ```bash
    docker-compose up --build
    ```

4. **Access the Application**:
    Open your browser and go to `http://localhost:3000` to access the Future Vision interface.

---

## Usage

1. **Login/Register**: Register a new user or log in with existing credentials.
2. **Upload Datasets**: Navigate to the "Datasets" section to upload and manage your datasets (YOLO/COCO formats supported).
3. **Create Projects**: In the "Projects" section, create a new project by selecting a dataset and configuring training parameters.
4. **Monitor Training**: Start training and monitor progress through TensorBoard, accessible via the interface.
