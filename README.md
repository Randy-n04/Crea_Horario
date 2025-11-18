Generador de Horarios Universitarios:

Versión 1.0

Descripción:
Este programa es una página web que permite al usuario crear su propio horario para la universidad o para otros motivos. Busca poder crear un horario con sus respectivas clases/materias y poder exportar el resultado a un Pdf o a una imagen. 
Esta desarrollado en Flask, y para el frontend se aprovecha de Alpine js para su desarrollo.

Requisitos:
-Python
-Pip

Encender el servidor:
- Si no se posee el entorno virtual (env) o si el actual da error por la versión de python:
    venv .venv
    .\.venv\Scripts\activate
- Instalar las dependencias:
    pip install -r requirements.txt
- Encender el servidor:
    python run.py

Funciones por implementar:
- Cambiar de color al color que desee el usuario
- Agregar los nombres de los profesores al final de cada archivo exportado.
- Modo Oscuro
- Implementar varios estilos y permitir al usuario escoger el que desee.
- Vista para dispositivos móviles.
