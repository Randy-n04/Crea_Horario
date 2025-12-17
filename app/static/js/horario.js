// app/static/js/horario.js

function horarioApp() {
    return {
        // ==================== DATOS ====================
        clases: [],
        nuevaClase: {
            nombre: '',
            profesor: '',
            dias: [],
            hora_inicio: '08:00',
            hora_fin: '10:00'
        },
        mensaje: {
            texto: '',
            tipo: ''
        },
        cargando: false,
        diasSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        
        modalAbierto: false,
        claseSeleccionada: null,
        indiceClaseSeleccionada: -1,
        coloresDisponibles: [
            { nombre: 'Azul', hex: '#60A5FA' },
            { nombre: 'Verde', hex: '#34D399' },
            { nombre: 'Rojo', hex: '#F87171' },
            { nombre: 'Amarillo', hex: '#FBBF24' },
            { nombre: 'Púrpura', hex: '#A78BFA' },
            { nombre: 'Naranja', hex: '#FB923C' },
            { nombre: 'Rosa', hex: '#EC4899' },
            { nombre: 'Turquesa', hex: '#14B8A6' },
            { nombre: 'AzulVioleta', hex: '#4f4dc2ff'},
            { nombre: 'Cafe', hex: '#AA653B'},
            { nombre: 'Gris', hex: '#a5a5a5ff'},
            { nombre: 'Vino', hex: '#8a3636ff'},
        ],

        // ==================== MÉTODOS DE CARGA ====================

        async cargarClases() {
            try {
                const response = await fetch('/api/clases');
                const data = await response.json();
                this.clases = data.clases;
            } catch (error) {
                console.error('Error al cargar clases:', error);
                this.mostrarMensaje('❌ Error al cargar clases', 'error');
            }
        },

        // ==================== MÉTODOS CRUD ====================

        async agregarClase() {
            if (this.nuevaClase.dias.length === 0) {
                this.mostrarMensaje('⚠️ Debes seleccionar al menos un día', 'warning');
                return;
            }

            this.cargando = true;

            try {
                const response = await fetch('/api/clases', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(this.nuevaClase)
                });

                const data = await response.json();

                if (data.success) {
                    this.clases = data.horario.clases;
                    this.resetearFormulario();
                    this.mostrarMensaje(data.message, 'success');
                } else {
                    this.mostrarMensaje(data.message, 'error');
                }
            } catch (error) {
                console.error('Error al agregar clase:', error);
                this.mostrarMensaje('❌ Error al agregar clase', 'error');
            } finally {
                this.cargando = false;
            }
        },

        async eliminarClase(indice) {
            if (!confirm('¿Estás seguro de eliminar esta clase?')) {
                return;
            }

            try {
                const response = await fetch(`/api/clases/${indice}`, {
                    method: 'DELETE'
                });

                const data = await response.json();
                this.clases = data.horario.clases;
                this.mostrarMensaje(data.message, 'success');
            } catch (error) {
                console.error('Error al eliminar clase:', error);
                this.mostrarMensaje('❌ Error al eliminar clase', 'error');
            }
        },

        async resetearHorario() {
            if (!confirm('¿Estás seguro de eliminar TODAS las clases?')) {
                return;
            }

            try {
                const response = await fetch('/api/reset', {
                    method: 'POST'
                });

                const data = await response.json();
                this.clases = [];
                this.mostrarMensaje(data.message, 'success');
            } catch (error) {
                console.error('Error al resetear:', error);
                this.mostrarMensaje('❌ Error al resetear', 'error');
            }
        },

        // ==================== MÉTODOS DE UI ====================

        resetearFormulario() {
            this.nuevaClase = {
                nombre: '',
                profesor: '',
                dias: [],
                hora_inicio: '08:00',
                hora_fin: '10:00'
            };
        },

        obtenerClasesUnicas() {
            const clasesUnicas = [];
            const yaVistos = new Set();

            this.clases.forEach(clase => {
                // Crear identificador único combinando nombre y profesor
                const identificador = `${clase.nombre}-${clase.profesor}`;

                // Solo agregar si no lo hemos visto antes
                if (!yaVistos.has(identificador)) {
                    yaVistos.add(identificador);
                    clasesUnicas.push(clase);
                }
            });

            return clasesUnicas;
        },

        mostrarMensaje(texto, tipo) {
            this.mensaje = { texto, tipo };
            setTimeout(() => {
                this.mensaje = { texto: '', tipo: '' };
            }, 5000);
        },

        formatearDias(dias) {
            return dias.map(d => d.substring(0, 3)).join(', ');
        },

        mostrarDetalles(clase) {
            // Encontrar el índice de esta clase en el array
            this.indiceClaseSeleccionada = this.clases.findIndex(c => 
                c.nombre === clase.nombre && 
                c.profesor === clase.profesor && 
                c.hora_inicio === clase.hora_inicio
            );
            
            this.claseSeleccionada = { ...clase }; // Clonar el objeto
            this.modalAbierto = true;
        },

        mostrarDetallesConIndice(clase, dia, hora) {
            // Comparamos TODOS los atributos para encontrar la clase correcta
            this.indiceClaseSeleccionada = this.clases.findIndex(c => 
                c.nombre === clase.nombre && 
                c.profesor === clase.profesor && 
                c.hora_inicio === clase.hora_inicio &&
                c.hora_fin === clase.hora_fin &&
                c.dias.join(',') === clase.dias.join(',') && // Comparar días exactos
                c.color === clase.color
            );
            
            if (this.indiceClaseSeleccionada === -1) {
                console.error('No se encontró la clase en el array principal');
                this.mostrarMensaje(' Error al abrir clase', 'error');
                return;
            }
            
            // Clonar el objeto para el modal
            this.claseSeleccionada = { ...clase };
            this.modalAbierto = true;
            
            console.log(`Modal abierto para clase índice: ${this.indiceClaseSeleccionada}`, clase);
        },

        cerrarModal() {
            this.modalAbierto = false;
            this.claseSeleccionada = null;
            this.indiceClaseSeleccionada = -1;
        },

        // ==================== MÉTODOS DE HORARIO VISUAL ====================

        async cambiarColorClase(nuevoColor) {
            if (this.indiceClaseSeleccionada === -1) {
                this.mostrarMensaje(' No hay clase seleccionada', 'error');
                return;
            }
            
            try {
                // Actualizar en el backend
                const response = await fetch(`/api/clases/${this.indiceClaseSeleccionada}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        color: nuevoColor
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Actualizar localmente
                    this.clases = data.horario.clases;
                    this.claseSeleccionada.color = nuevoColor;
                    
                    this.mostrarMensaje(' Color actualizado', 'success');
                } else {
                    this.mostrarMensaje(data.message, 'error');
                }
                
            } catch (error) {
                console.error('Error al cambiar color:', error);
                this.mostrarMensaje(' Error al cambiar color', 'error');
            }
        },

        async eliminarClaseDesdeModal() {
            if (this.indiceClaseSeleccionada === -1) return;
            
            if (!confirm('¿Estás seguro de eliminar esta clase?')) {
                return;
            }
            
            await this.eliminarClase(this.indiceClaseSeleccionada);
            this.cerrarModal();
        },


        /**
         * Calcula las horas visibles según las clases agregadas
         * Solo muestra desde la clase más temprana hasta la más tardía
         */
        horasVisibles() {
            if (this.clases.length === 0) {
                // Si no hay clases, mostrar horario por defecto 7:00 - 21:00
                return ['7:00', '8:00', '9:00', '10:00', '11:00', '12:00', '13:00',
                        '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
            }

            // Encontrar la hora más temprana y más tardía
            let horaMin = 21;
            let horaMax = 7;

            this.clases.forEach(clase => {
                const horaInicio = parseInt(clase.hora_inicio.split(':')[0]);
                const horaFin = parseInt(clase.hora_fin.split(':')[0]);

                if (horaInicio < horaMin) horaMin = horaInicio;
                if (horaFin > horaMax) horaMax = horaFin;
            });

            // Generar array de horas
            const horas = [];
            for (let h = horaMin; h <= horaMax; h++) {
                horas.push(`${h}:00`);
            }

            return horas;
        },

        /**
         * Obtiene la clase que debe renderizarse en una celda específica
         * Solo retorna la clase si EMPIEZA en esa hora
         */
        obtenerClaseEnCelda(dia, horaStr) {
            const horaCelda = parseInt(horaStr.split(':')[0]);

            return this.clases.filter(clase => {
                // Verificar que la clase sea en este día
                if (!clase.dias.includes(dia)) return false;

                // Solo mostrar si la clase INICIA en esta hora
                const horaInicio = parseInt(clase.hora_inicio.split(':')[0]);
                return horaInicio === horaCelda;
            });
        },

        /**
         * Calcula la posición top de la clase dentro de su celda
         * Necesario si la clase empieza con minutos (ej: 8:30)
         */
        calcularPosicionTopClase(clase, horaStr) {
            const horaCelda = parseInt(horaStr.split(':')[0]);
            const [horaInicio, minInicio] = clase.hora_inicio.split(':').map(Number);

            if (horaInicio === horaCelda && minInicio > 0) {
                // Calcular offset por minutos
                // Cada celda tiene 80px de altura = 1 hora
                return (minInicio / 60) * 80;
            }

            return 0;
        },

        /**
         * Calcula la altura de una clase en píxeles
         * Cada hora = 80px (altura de celda)
         */
        calcularAlturaClase(clase) {
            const [horaInicio, minInicio] = clase.hora_inicio.split(':').map(Number);
            const [horaFin, minFin] = clase.hora_fin.split(':').map(Number);

            const minutosTotal = (horaFin * 60 + minFin) - (horaInicio * 60 + minInicio);
            const horas = minutosTotal / 60;

            // 80px por hora (altura de cada celda)
            return horas * 80;
        },



        // ==================== MÉTODOS DE EXPORTACIÓN ====================

        /**
         * Función auxiliar para capturar el horario como canvas
         **/
        async capturarHorarioCanvas() {
            const elemento = document.getElementById('horario-container');
            if (!elemento) {
                throw new Error('No se encontró el elemento del horario');
                }

            // Esperar renderizado completo
            await new Promise(resolve => setTimeout(resolve, 300));

            // Capturar con html2canvas
            const canvas = await html2canvas(elemento, {
                scale: 3,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true,
                foreignObjectRendering: false,
                imageTimeout: 0,
                removeContainer: true,
                windowWidth: elemento.scrollWidth,
                windowHeight: elemento.scrollHeight,
                onclone: function(clonedDoc) {
                    const clonedElement = clonedDoc.getElementById('horario-container');
                    if (clonedElement) {
                        clonedElement.style.opacity = '1';
                        const bloques = clonedElement.querySelectorAll('.clase-bloque');
                        bloques.forEach(bloque => {
                            bloque.style.opacity = '1';
                            bloque.style.animation = 'none';
                            bloque.style.transform = 'none';
                            const bgColor = window.getComputedStyle(bloque).backgroundColor;
                            bloque.style.backgroundColor = bgColor;
                        });
                    }
                }
            });
            return canvas;
        },

        /**
         * Función auxiliar para capturar el horario optimizado para formato horizontal
         */
        async capturarHorarioHorizontalOptimizado() {
            const grid = document.querySelector('.horario-grid');

            if (!grid) {
                throw new Error('No se encontró el grid del horario');
            }

            // ===== CALCULAR DIMENSIONES NECESARIAS =====
            const horasVisibles = this.horasVisibles();
            const numFilas = horasVisibles.length + 1;

            const alturaHeader = 60;
            const alturaPorHora = 100; // px por hora en formato horizontal
            const alturaTotal = alturaHeader + (horasVisibles.length * alturaPorHora);
            const anchoGrid = 1400;

            console.log(`Capturando horario: ${horasVisibles.length} horas, altura: ${alturaTotal}px`);

            await new Promise(resolve => setTimeout(resolve, 500));

            const canvas = await html2canvas(grid, {
                scale: 3,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true,
                foreignObjectRendering: false,
                imageTimeout: 0,
                removeContainer: true,
                width: anchoGrid,
                height: alturaTotal,
                windowWidth: anchoGrid,
                windowHeight: alturaTotal,
                onclone: function(clonedDoc) {
                    const clonedGrid = clonedDoc.querySelector('.horario-grid');
                    if (clonedGrid) {
                        // Forzar dimensiones exactas
                        clonedGrid.style.minWidth = `${anchoGrid}px`;
                        clonedGrid.style.width = `${anchoGrid}px`;
                        clonedGrid.style.minHeight = `${alturaTotal}px`;
                        clonedGrid.style.height = `${alturaTotal}px`;
                        clonedGrid.style.fontSize = '1rem';
                        clonedGrid.style.opacity = '1';
                        clonedGrid.style.display = 'grid';
                        clonedGrid.style.gridTemplateRows = `${alturaHeader}px repeat(${horasVisibles.length}, ${alturaPorHora}px)`;

                        // Headers
                        const headers = clonedGrid.querySelectorAll('.horario-header');
                        headers.forEach(header => {
                            header.style.fontSize = '1.1rem';
                            header.style.padding = '16px 10px';
                            header.style.minHeight = `${alturaHeader}px`;
                            header.style.height = `${alturaHeader}px`;
                        });

                        // Celdas de hora y contenido
                        const celdas = clonedGrid.querySelectorAll('.horario-celda, .horario-hora');
                        celdas.forEach(celda => {
                            celda.style.minHeight = `${alturaPorHora}px`;
                            celda.style.height = `${alturaPorHora}px`;
                            celda.style.padding = '12px';
                            celda.style.fontSize = '1rem';
                        });

                        // ===== BLOQUES DE CLASE CON ALTURA CORREGIDA =====
                        const bloques = clonedGrid.querySelectorAll('.clase-bloque');
                        bloques.forEach(bloque => {
                            bloque.style.opacity = '1';
                            bloque.style.animation = 'none';
                            bloque.style.transform = 'none';
                            bloque.style.padding = '12px';
                            bloque.style.fontSize = '1rem';

                            const bgColor = window.getComputedStyle(bloque).backgroundColor;
                            bloque.style.backgroundColor = bgColor;

                            // ===== RECALCULAR ALTURA PARA 100PX POR HORA =====
                            const horaTexto = bloque.querySelector('.clase-hora');
                            if (horaTexto) {
                                const textoHora = horaTexto.textContent.trim();
                                // Extraer horas del formato "HH:MM - HH:MM"
                                const match = textoHora.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);

                                if (match) {
                                    const [_, horaIni, minIni, horaFin, minFin] = match;
                                    const minutosInicio = parseInt(horaIni) * 60 + parseInt(minIni);
                                    const minutosFin = parseInt(horaFin) * 60 + parseInt(minFin);
                                    const duracionMinutos = minutosFin - minutosInicio;

                                    // Calcular altura para 100px por hora (no 80px como en la web)
                                    const alturaCorrecta = (duracionMinutos / 60) * alturaPorHora;
                                    bloque.style.height = `${alturaCorrecta}px`;

                                    // Recalcular posición top si no empieza en hora exacta
                                    const minutosDentroHora = parseInt(minIni) % 60;
                                    if (minutosDentroHora > 0) {
                                        const topCorrecto = (minutosDentroHora / 60) * alturaPorHora;
                                        bloque.style.top = `${topCorrecto}px`;
                                    } else {
                                        bloque.style.top = '0px';
                                    }
                                }
                            }

                            const nombre = bloque.querySelector('.clase-nombre');
                            if (nombre) {
                                nombre.style.fontSize = '1.1rem';
                                nombre.style.marginBottom = '6px';
                                nombre.style.whiteSpace = 'normal';
                                nombre.style.overflow = 'visible';
                            }

                            const hora = bloque.querySelector('.clase-hora');
                            if (hora) {
                                hora.style.fontSize = '0.95rem';
                            }
                        });

                        // Columna de horas
                        const horas = clonedGrid.querySelectorAll('.horario-hora');
                        horas.forEach(hora => {
                            hora.style.fontSize = '1rem';
                            hora.style.fontWeight = '600';
                        });
                    }
                }
            });

            return canvas;
        },

        /**
         * Descarga el horario como imagen PNG
         * Usa html2canvas para convertir el DOM a canvas y luego a imagen
         */
        /**
         * Descarga como imagen PNG - Horizontal
         */
        async descargarImagenHorizontal() {
            try {
                this.mostrarMensaje('⏳ Generando imagen horizontal...', 'warning');
                const canvas = await this.capturarHorarioHorizontalOptimizado();

                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = `horario_horizontal_${this.obtenerFechaActual()}.png`;
                    link.href = url;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);

                    this.mostrarMensaje('✅ Imagen horizontal descargada', 'success');
                }, 'image/png', 1.0);

            } catch (error) {
                console.error('Error al generar imagen:', error);
                this.mostrarMensaje('❌ Error al generar la imagen', 'error');
            }
        },

        /**
         * Descarga como imagen PNG - Vertical
         */
        async descargarImagenVertical() {
            try {
                this.mostrarMensaje('⏳ Generando imagen vertical...', 'warning');
                const canvas = await this.capturarHorarioCanvas();

                // NO rotar, mantener tal cual (el horario ya es más ancho que alto)
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.download = `horario_vertical_${this.obtenerFechaActual()}.png`;
                    link.href = url;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);

                    this.mostrarMensaje('✅ Imagen vertical descargada', 'success');
                }, 'image/png', 1.0);

            } catch (error) {
                console.error('Error al generar imagen vertical:', error);
                this.mostrarMensaje('❌ Error al generar la imagen', 'error');
            }
        },

        /**
         * Descarga el horario como PDF
         * Usa html2canvas para capturar y jsPDF para generar el PDF
         */


        /**
         * Descarga como PDF - Horizontal (Landscape)
         */
        async descargarPDFHorizontal() {
            try {
                this.mostrarMensaje('⏳ Generando PDF horizontal...', 'warning');
                const canvas = await this.capturarHorarioHorizontalOptimizado();;

                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const imgData = canvas.toDataURL('image/png', 1.0);

                const { jsPDF } = window.jspdf;

                // Crear PDF en orientación horizontal
                const pdf = new jsPDF('landscape', 'mm', 'a4');

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                // Ajustar con márgenes
                const margin = 8;
                const availableWidth = pdfWidth - (margin * 2);
                const availableHeight = pdfHeight - (margin * 2.5);

                const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
                const imgX = (pdfWidth - imgWidth * ratio) / 2;
                const imgY = margin;

                pdf.addImage(
                    imgData,
                    'PNG',
                    imgX,
                    imgY,
                    imgWidth * ratio,
                    imgHeight * ratio,
                    undefined,
                    'FAST'
                );

                // Footer
                const fechaActual = new Date().toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                pdf.setFontSize(7);
                pdf.setTextColor(150);
                pdf.text(
                    `Horario generado el ${fechaActual}`,
                    pdfWidth / 2,
                    pdfHeight - 4,
                    { align: 'center' }
                );

                pdf.save(`horario_horizontal_${this.obtenerFechaActual()}.pdf`);

                this.mostrarMensaje('✅ PDF horizontal descargado', 'success');

            } catch (error) {
                console.error('Error al generar PDF:', error);
                this.mostrarMensaje('❌ Error al generar el PDF', 'error');
            }
        },

        /**
         * Descarga como PDF - Vertical (Portrait)
         */
        async descargarPDFVertical() {
            try {
                this.mostrarMensaje('⏳ Generando PDF vertical...', 'warning');
                const canvas = await this.capturarHorarioCanvas();

                const imgWidth = canvas.width;
                const imgHeight = canvas.height;
                const imgData = canvas.toDataURL('image/png', 1.0);

                const { jsPDF } = window.jspdf;

                // Crear PDF en orientación vertical
                const pdf = new jsPDF('portrait', 'mm', 'a4');

                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                // Ajustar con márgenes
                const margin = 10;
                const availableWidth = pdfWidth - (margin * 2);
                const availableHeight = pdfHeight - (margin * 3);

                const ratio = Math.min(availableWidth / imgWidth, availableHeight / imgHeight);
                const imgX = (pdfWidth - imgWidth * ratio) / 2;
                const imgY = margin;

                pdf.addImage(
                    imgData,
                    'PNG',
                    imgX,
                    imgY,
                    imgWidth * ratio,
                    imgHeight * ratio,
                    undefined,
                    'FAST'
                );

                // Footer
                const fechaActual = new Date().toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
                pdf.setFontSize(8);
                pdf.setTextColor(150);
                pdf.text(
                    `Horario generado el ${fechaActual}`,
                    pdfWidth / 2,
                    pdfHeight - 5,
                    { align: 'center' }
                );

                pdf.save(`horario_vertical_${this.obtenerFechaActual()}.pdf`);

                this.mostrarMensaje('✅ PDF vertical descargado', 'success');

            } catch (error) {
                console.error('Error al generar PDF:', error);
                this.mostrarMensaje('❌ Error al generar el PDF', 'error');
            }
        },

        // Mantener estas funciones para compatibilidad (llaman a las horizontales por defecto)
        async descargarImagen() {
            return this.descargarImagenHorizontal();
        },

        async descargarPDF() {
            return this.descargarPDFHorizontal();
        },

        /**
         * Obtiene la fecha actual en formato YYYY-MM-DD
         * Útil para nombres de archivo
         */
        obtenerFechaActual() {
            const fecha = new Date();
            const año = fecha.getFullYear();
            const mes = String(fecha.getMonth() + 1).padStart(2, '0');
            const dia = String(fecha.getDate()).padStart(2, '0');
            return `${año}-${mes}-${dia}`;
        }
    }
}