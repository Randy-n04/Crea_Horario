// app/static/js/horario.js
document.addEventListener('alpine:init', () => {
        if (localStorage.theme === 'dark') {
            document.documentElement.classList.add('dark');
        }
    });
    
function horarioApp() {
    return {
        // ==================== DATOS ====================
        clases: [],
        nuevaClase: { nombre: '', profesor: '', dias: [], hora_inicio: '08:00', hora_fin: '10:00' },
        mensaje: { texto: '', tipo: '' },
        cargando: false,
        diasSemana: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        modalAbierto: false,
        claseSeleccionada: null,
        indiceClaseSeleccionada: -1,
        modoOscuro: localStorage.theme === 'dark', 
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

        // ==================== MÉTODOS API ====================
        
        async apiCall(url, method = 'GET', body = null) {
            const options = { method, headers: { 'Content-Type': 'application/json' } };
            if (body) options.body = JSON.stringify(body);
            const response = await fetch(url, options);
            return response.json();
        },

        async cargarClases() {
            try {
                const data = await this.apiCall('/api/clases');
                this.clases = data.clases;
            } catch (error) {
                console.error('Error al cargar clases:', error);
                this.mostrarMensaje('Error al cargar clases', 'error');
            }
        },

        async agregarClase() {
            if (this.nuevaClase.dias.length === 0) {
                this.mostrarMensaje('Debes seleccionar al menos un día', 'warning');
                return;
            }

            this.cargando = true;
            try {
                const data = await this.apiCall('/api/clases', 'POST', this.nuevaClase);
                if (data.success) {
                    this.clases = data.horario.clases;
                    this.resetearFormulario();
                }
                this.mostrarMensaje(data.message, data.success ? 'success' : 'error');
            } catch (error) {
                console.error('Error al agregar clase:', error);
                this.mostrarMensaje('Error al agregar clase', 'error');
            } finally {
                this.cargando = false;
            }
        },

        async eliminarClase(indice) {
            try {
                const data = await this.apiCall(`/api/clases/${indice}`, 'DELETE');
                this.clases = data.horario.clases;
                this.mostrarMensaje(data.message, 'success');
            } catch (error) {
                console.error('Error al eliminar clase:', error);
                this.mostrarMensaje('Error al eliminar clase', 'error');
            }
        },

        async resetearHorario() {
            if (!confirm('¿Estás seguro de eliminar TODAS las clases?')) return;
            try {
                await this.apiCall('/api/reset', 'POST');
                this.clases = [];
                this.mostrarMensaje('Horario reseteado', 'success');
            } catch (error) {
                console.error('Error al resetear:', error);
                this.mostrarMensaje('Error al resetear', 'error');
            }
        },

        async cambiarColorClase(nuevoColor) {
            if (this.indiceClaseSeleccionada === -1) {
                this.mostrarMensaje('No hay clase seleccionada', 'error');
                return;
            }
            try {
                const data = await this.apiCall(`/api/clases/${this.indiceClaseSeleccionada}`, 'PUT', { color: nuevoColor });
                if (data.success) {
                    this.clases = data.horario.clases;
                    this.claseSeleccionada.color = nuevoColor;
                    this.mostrarMensaje('Color actualizado', 'success');
                } else {
                    this.mostrarMensaje(data.message, 'error');
                }
            } catch (error) {
                console.error('Error al cambiar color:', error);
                this.mostrarMensaje('Error al cambiar color', 'error');
            }
        },

        // ==================== MÉTODOS UI ====================

        resetearFormulario() {
            this.nuevaClase = { nombre: '', profesor: '', dias: [], hora_inicio: '08:00', hora_fin: '10:00' };
        },

        obtenerClasesUnicas() {
            const vistos = new Set();
            return this.clases.filter(clase => {
                const id = `${clase.nombre}-${clase.profesor}`;
                if (vistos.has(id)) return false;
                vistos.add(id);
                return true;
            });
        },

        mostrarMensaje(texto, tipo) {
            this.mensaje = { texto, tipo };
            setTimeout(() => this.mensaje = { texto: '', tipo: '' }, 5000);
        },

        formatearDias(dias) {
            return dias.map(d => d.substring(0, 3)).join(', ');
        },

        mostrarDetallesConIndice(clase) {
            this.indiceClaseSeleccionada = this.clases.findIndex(c => 
                c.nombre === clase.nombre && 
                c.profesor === clase.profesor && 
                c.hora_inicio === clase.hora_inicio &&
                c.hora_fin === clase.hora_fin &&
                c.dias.join(',') === clase.dias.join(',') &&
                c.color === clase.color
            );
            
            if (this.indiceClaseSeleccionada === -1) {
                this.mostrarMensaje('Error al abrir clase', 'error');
                return;
            }
            
            this.claseSeleccionada = { ...clase };
            this.modalAbierto = true;
        },

        cerrarModal() {
            this.modalAbierto = false;
            this.claseSeleccionada = null;
            this.indiceClaseSeleccionada = -1;
        },

        async eliminarClaseDesdeModal() {
            if (this.indiceClaseSeleccionada === -1) return;
            await this.eliminarClase(this.indiceClaseSeleccionada);
            this.cerrarModal();
        },

        // ==================== CÁLCULOS DE HORARIO ====================

        horasVisibles() {
            if (this.clases.length === 0) {
                return Array.from({ length: 15 }, (_, i) => `${i + 7}:00`);
            }

            let [horaMin, horaMax] = [21, 7];
            this.clases.forEach(clase => {
                const horaInicio = parseInt(clase.hora_inicio.split(':')[0]);
                const horaFin = parseInt(clase.hora_fin.split(':')[0]);
                if (horaInicio < horaMin) horaMin = horaInicio;
                if (horaFin > horaMax) horaMax = horaFin;
            });

            return Array.from({ length: horaMax - horaMin + 1 }, (_, i) => `${horaMin + i}:00`);
        },

        obtenerClaseEnCelda(dia, horaStr) {
            const horaCelda = parseInt(horaStr.split(':')[0]);
            return this.clases.filter(clase => 
                clase.dias.includes(dia) && 
                parseInt(clase.hora_inicio.split(':')[0]) === horaCelda
            );
        },

        calcularPosicionTopClase(clase, horaStr) {
            const horaCelda = parseInt(horaStr.split(':')[0]);
            const [horaInicio, minInicio] = clase.hora_inicio.split(':').map(Number);
            return (horaInicio === horaCelda && minInicio > 0) ? (minInicio / 60) * 80 : 0;
        },

        calcularAlturaClase(clase) {
            const [horaIni, minIni] = clase.hora_inicio.split(':').map(Number);
            const [horaFin, minFin] = clase.hora_fin.split(':').map(Number);
            const minutos = (horaFin * 60 + minFin) - (horaIni * 60 + minIni);
            return (minutos / 60) * 80;
        },

        // ==================== EXPORTACIÓN ====================

        async capturarCanvas(optimizado = false) {
            const elemento = optimizado ? document.querySelector('.horario-grid') : document.getElementById('horario-container');
            if (!elemento) throw new Error('Elemento no encontrado');

            await new Promise(resolve => setTimeout(resolve, optimizado ? 500 : 300));

            const config = {
                scale: 3,
                backgroundColor: '#ffffff',
                logging: false,
                useCORS: true,
                allowTaint: true,
                foreignObjectRendering: false,
                imageTimeout: 0,
                removeContainer: true,
                onclone: (clonedDoc) => {
                    const target = optimizado ? clonedDoc.querySelector('.horario-grid') : clonedDoc.getElementById('horario-container');
                    if (!target) return;

                    target.style.opacity = '1';
                    target.querySelectorAll('.clase-bloque').forEach(bloque => {
                        bloque.style.opacity = '1';
                        bloque.style.animation = 'none';
                        bloque.style.transform = 'none';
                        bloque.style.backgroundColor = window.getComputedStyle(bloque).backgroundColor;
                    });

                    if (optimizado) {
                        const horas = this.horasVisibles();
                        const alturaHeader = 60, alturaPorHora = 100;
                        const alturaTotal = alturaHeader + (horas.length * alturaPorHora);
                        const anchoGrid = 1400;

                        Object.assign(target.style, {
                            width: `${anchoGrid}px`,
                            height: `${alturaTotal}px`,
                            minWidth: `${anchoGrid}px`,
                            minHeight: `${alturaTotal}px`,
                            fontSize: '1rem',
                            display: 'grid',
                            gridTemplateRows: `${alturaHeader}px repeat(${horas.length}, ${alturaPorHora}px)`
                        });

                        target.querySelectorAll('.horario-header').forEach(h => {
                            h.style.height = `${alturaHeader}px`;
                            h.style.fontSize = '1.1rem';
                            h.style.padding = '16px 10px';
                        });

                        target.querySelectorAll('.horario-celda, .horario-hora').forEach(c => {
                            c.style.height = `${alturaPorHora}px`;
                            c.style.padding = '12px';
                        });

                        target.querySelectorAll('.clase-bloque').forEach(bloque => {
                            const horaTexto = bloque.querySelector('.clase-hora')?.textContent.trim();
                            const match = horaTexto?.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
                            if (match) {
                                const [_, horaIni, minIni, horaFin, minFin] = match.map(Number);
                                const duracion = (horaFin * 60 + minFin) - (horaIni * 60 + minIni);
                                bloque.style.height = `${(duracion / 60) * alturaPorHora}px`;
                                bloque.style.top = minIni > 0 ? `${(minIni / 60) * alturaPorHora}px` : '0px';
                            }
                            
                            Object.assign(bloque.style, { fontSize: '1.1rem', padding: '14px' });
                            const nombre = bloque.querySelector('.clase-nombre');
                            const hora = bloque.querySelector('.clase-hora');
                            if (nombre) Object.assign(nombre.style, { fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' });
                            if (hora) Object.assign(hora.style, { fontSize: '1.2rem', fontWeight: '600' });
                        });
                    }
                }
            };

            if (optimizado) {
                const horas = this.horasVisibles();
                const alturaTotal = 60 + (horas.length * 100);
                Object.assign(config, { width: 1400, height: alturaTotal, windowWidth: 1400, windowHeight: alturaTotal });
            } else {
                Object.assign(config, {
                    windowWidth: elemento.scrollWidth,
                    windowHeight: elemento.scrollHeight
                });
            }

            return await html2canvas(elemento, config);
        },

        async descargar(tipo, orientacion) {
            const esHorizontal = orientacion === 'horizontal';
            const esPDF = tipo === 'pdf';
            
            try {
                this.mostrarMensaje(`Generando ${tipo.toUpperCase()} ${orientacion}...`, 'warning');
                const canvas = await this.capturarCanvas(esHorizontal);

                if (esPDF) {
                    const { jsPDF } = window.jspdf;
                    const pdf = new jsPDF(esHorizontal ? 'landscape' : 'portrait', 'mm', 'a4');
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const margin = esHorizontal ? 8 : 10;
                    const ratio = Math.min(
                        (pdfWidth - margin * 2) / canvas.width,
                        (pdfHeight - margin * (esHorizontal ? 2.5 : 3)) / canvas.height
                    );

                    pdf.addImage(
                        canvas.toDataURL('image/png', 1.0),
                        'PNG',
                        (pdfWidth - canvas.width * ratio) / 2,
                        margin,
                        canvas.width * ratio,
                        canvas.height * ratio,
                        undefined,
                        'FAST'
                    );

                    pdf.setFontSize(esHorizontal ? 7 : 8);
                    pdf.setTextColor(150);
                    pdf.text(
                        `Horario generado el ${new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}`,
                        pdfWidth / 2,
                        pdfHeight - (esHorizontal ? 4 : 5),
                        { align: 'center' }
                    );

                    pdf.save(`horario_${orientacion}_${this.obtenerFechaActual()}.pdf`);
                } else {
                    canvas.toBlob((blob) => {
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.download = `horario_${orientacion}_${this.obtenerFechaActual()}.png`;
                        link.href = url;
                        link.click();
                        URL.revokeObjectURL(url);
                    }, 'image/png', 1.0);
                }

                this.mostrarMensaje(`${tipo.toUpperCase()} ${orientacion} descargado`, 'success');
            } catch (error) {
                console.error(`Error al generar ${tipo}:`, error);
                this.mostrarMensaje(`Error al generar ${tipo}`, 'error');
            }
        },

        descargarImagenHorizontal() { return this.descargar('imagen', 'horizontal'); },
        descargarImagenVertical() { return this.descargar('imagen', 'vertical'); },
        descargarPDFHorizontal() { return this.descargar('pdf', 'horizontal'); },
        descargarPDFVertical() { return this.descargar('pdf', 'vertical'); },

        obtenerFechaActual() {
            const fecha = new Date();
            return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}-${String(fecha.getDate()).padStart(2, '0')}`;
        },

        toggleModoOscuro() {
            this.modoOscuro = !this.modoOscuro;
            document.documentElement.classList.toggle('dark');
            localStorage.theme = this.modoOscuro ? 'dark' : 'light';
        }
    }
}