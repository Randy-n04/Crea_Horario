from datetime import datetime, time

class Clase:
    """
    Represents a Class instance found in the schedule

    Structure
        nombre: string
        profesor: string
        dias: Array of days ["Lunes", "Jueves"]
        hora_inicio: Time Object
        hora_fin: Time Object
        color: string, color in hexadecimal format
    """

    def __init__(self,
                 nombre,
                 profesor,
                 dias,
                 hora_inicio,
                 hora_fin,
                 color="#60A5FA"):
        self.nombre = nombre
        self.profesor = profesor
        self.dias = dias
        self.hora_inicio = hora_inicio
        self.hora_fin = hora_fin
        self.color = color


    def to_dict(self):
        """
        Turns this class into a dictionary so it can be sent as a JSON
         Useful for Flask and Alpine.js
        """
        return {
            "nombre": self.nombre,
            "profesor": self.profesor,
            "dias": self.dias,
            'hora_inicio': self.hora_inicio.strftime('%H:%M') if isinstance(self.hora_inicio, time) else self.hora_inicio,
            'hora_fin': self.hora_fin.strftime('%H:%M') if isinstance(self.hora_fin, time) else self.hora_fin,
            "color": self.color,
        }

    def dura_minutos(self):
        #Class duration in min
        inicio_min = self.hora_inicio.hour * 60 + self.hora_inicio.minute
        fin_min = self.hora_fin.hour * 60 + self.hora_fin.minute
        #This part needs to be checked, in case fin_min is less than inicio_min
        #Or maybe that validation is in the html file.
        return fin_min-inicio_min

    def choca_con(self, other):
        #Checks two Clase to see if they share a common day/hour
        common_days = set(self.dias) & set(other.dias)
        if not common_days:
            return False

        return (self.hora_inicio < other.hora_fin
                and other.hora_inicio < self.hora_fin)


class Horario:
    """
        Manages the full schedule with a list of classes

        Structure:
        clases: Array of Clase
        colores_disponibles: List of available colors. Fixed.
    """
    def __init__(self):
        self.clases = [] #List of Clase Object
        self.colores_disponibles = [
        "#60A5FA",  # Azul
        "#34D399",  # Verde
        "#F87171",  # Rojo
        "#FBBF24",  # Amarillo
        "#A78BFA",  # Púrpura
        "#FB923C",  # Naranja            "#EC4899",  # Rosa
        "#14B8A6",  # Turquesa
        "#6EE7B7",  # Verde menta
        "#92400E",  # Cafe oscuro
        ]

    def agregar_clase(self, clase):
        """"
        Adds a Clase to the Schedule
        Checks if the time is available (Que si choca, no supe como traducir)
        Returns a dictionary made of a bool success and a string message
        """
        if len(self.clases) >= 10:
            return {
                "success": False,
                "message": 'Haz Alcanzado el limite de clases'
            }

        for _clase in self.clases:
            if clase.choca_con(_clase):
                return {
                    "success": False,
                    "message": f'Esta clase choca con "{_clase.nombre}"'
                }

        clase.color = self.colores_disponibles[len(self.clases)]

        self.clases.append(clase)

        return {
            "success": True,
            "message": 'Clase agregada exitosamente'
        }


    def eliminar_clase(self, index):
        if 0 <= index < len(self.clases):
            self.clases.pop(index)
            for i, clase in enumerate(self.clases):
                clase.color = self.colores_disponibles[i]

    def obtener_clase_por_dia(self, dia):
        return [clase for clase in self.clases if dia in clase.dias]

    def to_dict(self):
        return {
            "clases": [clase.to_dict() for clase in self.clases],
            "total": len(self.clases),
        }