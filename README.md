Generador de Horarios Universitarios:

Versión 1.3

Descripción:
Este programa es una página web que permite al usuario crear su propio horario para la universidad o para otros motivos. Busca poder crear un horario con sus respectivas clases/materias y poder exportar el resultado a un Pdf o a una imagen. 
Esta desarrollado en Flask, y para el frontend se aprovecha de Alpine js para su desarrollo.

El propósito de este programa es practicar el despliegue de una aplicación web, por lo tanto no posee elementos comunes como usuarios o base de datos. También se buscaba reforzar las habilidades en python y descubrir y manejar el uso de herramientas como html2canvas o alpinejs.

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
- Agregar los nombres de los profesores al final de cada archivo exportado.
- Implementar varios estilos y permitir al usuario escoger el que desee.
- Implementar AM-PM como alternativa al sistema militar

Bugfixes:
- Vista para dispositivos móviles: La cuadricula no aparece completa en movil y en vertical
