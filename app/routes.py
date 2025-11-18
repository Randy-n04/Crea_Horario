from flask import Blueprint, render_template, request, jsonify, session
from datetime import time
from app.models import Clase, Horario

bp = Blueprint('main', __name__)

horarios_session = {}

def obtener_horario():
    """
    Gets or creates a shcedule for the current session
    This method will be using Session.sid as identification key
    """
    session_id = session.get('user_id')
    if not session_id:
        import uuid
        session_id = str(uuid.uuid4())
        session['user_id'] = session_id

    if session_id not in horarios_session:
        horarios_session[session_id] = Horario()

    return horarios_session[session_id]

@bp.route('/')
def index():
    """
    Main route
    Here we define the index file we want to start the program with
    """
    return render_template('index.html')

@bp.route('/api/clases', methods=['GET'])
def obtener_clases():
    """
    API: Returns the Clase Object of the current Schedule
    Sends a json
    """
    horario = obtener_horario()
    return jsonify(horario.to_dict())

@bp.route('/api/clases', methods=['POST'])
def agregar_clase():
    """
    API: Adds a new Clase to the Schedule
    Waits for a Json made up of a Clase class

    and responds with:
        success
        message
        horario
    """
    try:
        data = request.get_json()

        required_spots =  ['nombre', 'profesor', 'dias', 'hora_inicio', 'hora_fin']
        for spot in required_spots:
            if spot not in data or not data[spot]:
                return jsonify({
                    'success': False,
                    'message': f' El campo "{spot}" es obligatorio'
                }), 400

        try:
            hora_inicio_str = data['hora_inicio'].split(':')
            hora_fin_str = data['hora_fin'].split(':')

            hora_inicio = time(int(hora_inicio_str[0]), int(hora_inicio_str[1]))
            hora_fin = time(int(hora_fin_str[0]), int(hora_fin_str[1]))
        except (ValueError, IndexError):
            return jsonify({
                'success': False,
                'message': 'Formato de hora inválido. Use HH:MM'
            }), 400

        if hora_fin <= hora_inicio:
            return jsonify({
                'success': False,
                'message': 'La hora de fin debe ser posterior a la hora de inicio'
            }), 400

        nueva_clase = Clase(
            nombre=data['nombre'].strip(),
            profesor=data['profesor'].strip(),
            dias=data['dias'],
            hora_inicio=hora_inicio,
            hora_fin=hora_fin
        )

        horario = obtener_horario()
        resultado = horario.agregar_clase(nueva_clase)

        return jsonify({
            **resultado,
            'horario': horario.to_dict()
        })

    except Exception as e:
        return jsonify({
            'success': False,
            'message': f' Error al procesar la solicitud: {str(e)}'
        }), 500

@bp.route('/api/clases/<int:indice>', methods=['DELETE'])
def eliminar_clase(indice):
    """
    API: Deletes a Clase by the index

    Responds with the updated Schedule
    """
    horario = obtener_horario()
    horario.eliminar_clase(indice)

    return jsonify({
        'success': True,
        'message': 'Clase eliminada',
        'horario': horario.to_dict()
    })

@bp.route('/api/reset', methods=['POST'])
def resetear_horario():
    """
    API: Deletes the schedule and creates a new one
    """
    session_id = session.get('user_id')
    if session_id and session_id in horarios_session:
        horarios_session[session_id] = Horario()

    return jsonify({
        'success': True,
        'message': 'Horario reseteado',
        'horario': {'clases': [], 'total': 0}
    })