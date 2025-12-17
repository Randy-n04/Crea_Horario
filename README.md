Generador de Horarios Universitarios:

Versión 1.1

Descripción:
Este programa es una página web que permite al usuario crear su propio horario para la universidad o para otros motivos. Busca poder crear un horario con sus respectivas clases/materias y poder exportar el resultado a un Pdf o a una imagen. 
Esta desarrollado en Flask, y para el frontend se aprovecha de Alpine js para su desarrollo.

Requisitos:
-Python
-Pip

Encender el servidor:
- Crear entorno virtual de python:
    venv .venv
    .\.venv\Scripts\activate
- Instalar las dependencias:
    pip install -r requirements.txt
- Encender el servidor:
    python run.py

Funciones por implementar:
-Agregar un ícono de app propio
- Agregar los nombres de los profesores al final de cada archivo exportado.
- Modo Oscuro
- Implementar varios estilos y permitir al usuario escoger el que desee.
- Implementar AM-PM como alternativa al sistema militar
- Vista para dispositivos móviles.

Bugfixes:
- Los colores de todas las clases cambian si se elimina una clase.
- 3 mensajes de advertencia al eliminar una clase.
- Vista para dispositivos móviles.
