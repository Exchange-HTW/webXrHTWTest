console.log("Laboratorio NeuroVR - Nivel 3: Ondas EEG");

document.addEventListener('DOMContentLoaded', function () {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    const NUM_NODOS = 25;
    const RADIO_ESFERA = 8;
    const ALTURA_MINIMA = -3;
    const nodos = [];
    const impulsos = [];

    const colores = [
        '#ff66aa', '#bb55ff', '#55bbff',
        '#ffaa44', '#55ffcc', '#ff55ff',
    ];

    // ========== NODOS ==========
    for (let i = 0; i < NUM_NODOS; i++) {
        const color = colores[i % colores.length];

        const entidad = document.createElement('a-entity');
        entidad.setAttribute('id', `nodo-${i}`);

        const phi = Math.acos(1 - (i + 0.5) / NUM_NODOS);
        const theta = Math.PI * (1 + Math.sqrt(5)) * i;
        const r = RADIO_ESFERA * (0.5 + Math.random() * 0.5);

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = Math.max(ALTURA_MINIMA, r * Math.cos(phi) + 1.2);
        const z = r * Math.sin(phi) * Math.sin(theta);

        entidad.setAttribute('position', `${x} ${y} ${z}`);
        scene.appendChild(entidad);

        const nucleo = document.createElement('a-sphere');
        nucleo.setAttribute('radius', 0.07);
        nucleo.setAttribute('color', color);
        nucleo.setAttribute('material', `
            emissive: ${color};
            emissiveIntensity: 1.8;
            shader: flat;
        `);
        entidad.appendChild(nucleo);

        const orbitas = [];
        const numOrbitas = 4;

        for (let j = 0; j < numOrbitas; j++) {
            const particula = document.createElement('a-sphere');
            particula.setAttribute('radius', 0.025);
            particula.setAttribute('color', color);
            particula.setAttribute('material', `
                emissive: ${color};
                emissiveIntensity: 1.0;
            `);

            const orbita = {
                elemento: particula,
                radio: 0.25 + Math.random() * 0.5,
                velocidad: 0.4 + Math.random() * 1.2,
                fase: Math.random() * Math.PI * 2,
                inclinacion: (Math.random() - 0.5) * Math.PI,
            };

            entidad.appendChild(particula);
            orbitas.push(orbita);
        }

        nodos.push({
            entidad: entidad,
            nucleo: nucleo,
            orbitas: orbitas,
            posicion: { x, y, z },
            color: color
        });
    }

    // ========== CONEXIONES ==========
    const pares = [];
    nodos.forEach((nodoA, i) => {
        nodos.forEach((nodoB, j) => {
            if (i >= j) return;
            const dx = nodoA.posicion.x - nodoB.posicion.x;
            const dy = nodoA.posicion.y - nodoB.posicion.y;
            const dz = nodoA.posicion.z - nodoB.posicion.z;
            const distancia = Math.sqrt(dx * dx + dy * dy + dz * dz);
            if (distancia < 5) {
                pares.push({ nodoA, nodoB, distancia });
            }
        });
    });

    // ========== IMPULSOS CON ESTELA ==========
    pares.forEach((par) => {
        const numImpulsos = 1 + Math.floor(Math.random() * 1.5);

        for (let k = 0; k < numImpulsos; k++) {
            const impulso = document.createElement('a-sphere');
            impulso.setAttribute('radius', 0.06);
            impulso.setAttribute('color', par.nodoA.color);
            impulso.setAttribute('material', `
                emissive: ${par.nodoA.color};
                emissiveIntensity: 2.5;
            `);
            scene.appendChild(impulso);

            const estela = [];
            for (let e = 0; e < 2; e++) {
                const trazo = document.createElement('a-sphere');
                const escala = 0.045 - (e * 0.018);
                trazo.setAttribute('radius', escala);
                trazo.setAttribute('color', par.nodoA.color);
                trazo.setAttribute('material', `
                    emissive: ${par.nodoA.color};
                    emissiveIntensity: ${1.4 - e * 0.5};
                    transparent: true;
                    opacity: ${0.85 - e * 0.3};
                `);
                scene.appendChild(trazo);
                estela.push({ elemento: trazo, offset: (e + 1) * 0.1 });
            }

            impulsos.push({
                elemento: impulso,
                estela: estela,
                nodoA: par.nodoA,
                nodoB: par.nodoB,
                progreso: Math.random(),
                velocidad: 0.003 + Math.random() * 0.01,
                direccion: Math.random() > 0.5 ? 1 : -1,
            });
        }
    });

    // ========== POLVO NEURONAL FLOTANTE ==========
    const particulasFlotantes = [];
    for (let i = 0; i < 60; i++) {
        const p = document.createElement('a-sphere');
        const color = colores[Math.floor(Math.random() * colores.length)];
        const radio = 0.03 + Math.random() * 0.04;

        p.setAttribute('radius', radio);
        p.setAttribute('color', color);
        p.setAttribute('material', `
            emissive: ${color};
            emissiveIntensity: 0.7;
            transparent: true;
            opacity: 0.8;
        `);

        const phi2 = Math.acos(2 * Math.random() - 1);
        const theta2 = Math.random() * Math.PI * 2;
        const r2 = 3 + Math.random() * 9;

        const px = r2 * Math.sin(phi2) * Math.cos(theta2);
        const py = Math.max(-1, r2 * Math.cos(phi2) + 1.5);
        const pz = r2 * Math.sin(phi2) * Math.sin(theta2);

        p.setAttribute('position', `${px} ${py} ${pz}`);
        scene.appendChild(p);

        particulasFlotantes.push({
            elemento: p,
            baseX: px,
            baseY: py,
            baseZ: pz,
            velocidad: 0.1 + Math.random() * 0.5,
            amplitud: 0.3 + Math.random() * 1.0,
            fase: Math.random() * Math.PI * 2,
        });
    }

    // ========== ONDAS EEG ==========
    const ondasEEG = [];
    const MAX_ONDAS = 8;
    const posicionCerebro = { x: 0, y: 1.6, z: -1.5 };

    function crearOnda() {
        if (ondasEEG.length >= MAX_ONDAS) {
            // Reciclar la más vieja
            const vieja = ondasEEG.shift();
            if (vieja && vieja.elemento) {
                vieja.elemento.parentNode.removeChild(vieja.elemento);
            }
        }

        const color = colores[Math.floor(Math.random() * colores.length)];

        // Crear un a-ring que se expande
        const anillo = document.createElement('a-ring');
        anillo.setAttribute('radius-inner', 0.05);
        anillo.setAttribute('radius-outer', 0.08);
        anillo.setAttribute('color', color);
        anillo.setAttribute('material', `
            emissive: ${color};
            emissiveIntensity: 1.5;
            transparent: true;
            opacity: 0.9;
            side: double;
        `);
        anillo.setAttribute('position', `${posicionCerebro.x} ${posicionCerebro.y} ${posicionCerebro.z}`);
        anillo.setAttribute('rotation', `${Math.random() * 360} ${Math.random() * 360} 0`);
        scene.appendChild(anillo);

        ondasEEG.push({
            elemento: anillo,
            color: color,
            radio: 0.08,
            velocidad: 0.008 + Math.random() * 0.02,
            rotacionX: (Math.random() - 0.5) * 0.5,
            rotacionY: (Math.random() - 0.5) * 0.5,
            opacidad: 0.9,
        });
    }

    // Crear primera onda
    crearOnda();
    let tiempoUltimaOnda = 0;

    // ========== ANIMACIÓN ==========
    let tiempo = 0;

    AFRAME.registerComponent('neuro-tick', {
        tick: function (t, delta) {
            tiempo += delta / 1000;

            // Crear nueva onda cada 2-3 segundos
            if (tiempo - tiempoUltimaOnda > 2 + Math.random() * 1.5) {
                crearOnda();
                tiempoUltimaOnda = tiempo;
            }

            // Nodos
            nodos.forEach(nodo => {
                const pulso = 1 + Math.sin(tiempo * 3 + nodo.posicion.x) * 0.35;
                nodo.nucleo.setAttribute('radius', 0.07 * pulso);

                if (nodo.orbitas) {
                    nodo.orbitas.forEach(orbita => {
                        const angulo = tiempo * orbita.velocidad + orbita.fase;
                        const ox = Math.cos(angulo) * orbita.radio;
                        const oz = Math.sin(angulo) * orbita.radio;
                        const oy = Math.sin(angulo * 1.3) * orbita.radio * Math.sin(orbita.inclinacion);
                        orbita.elemento.setAttribute('position', `${ox} ${oy} ${oz}`);
                    });
                }
            });

            // Impulsos
            impulsos.forEach(impulso => {
                impulso.progreso += impulso.velocidad * impulso.direccion;
                if (impulso.progreso >= 1 || impulso.progreso <= 0) {
                    impulso.direccion *= -1;
                    impulso.progreso = Math.max(0, Math.min(1, impulso.progreso));
                }

                const A = impulso.nodoA.posicion;
                const B = impulso.nodoB.posicion;
                const t2 = impulso.progreso;

                const x = A.x + (B.x - A.x) * t2;
                const y = A.y + (B.y - A.y) * t2;
                const z = A.z + (B.z - A.z) * t2;
                impulso.elemento.setAttribute('position', `${x} ${y} ${z}`);

                const brillo = 1 - Math.abs(t2 - 0.5) * 2;
                impulso.elemento.setAttribute('radius', 0.04 + brillo * 0.05);

                const dirX = B.x - A.x;
                const dirY = B.y - A.y;
                const dirZ = B.z - A.z;
                const distTotal = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);

                if (distTotal > 0.001) {
                    const dnx = dirX / distTotal;
                    const dny = dirY / distTotal;
                    const dnz = dirZ / distTotal;

                    impulso.estela.forEach(trazo => {
                        const tx = x - dnx * trazo.offset * impulso.direccion;
                        const ty = y - dny * trazo.offset * impulso.direccion;
                        const tz = z - dnz * trazo.offset * impulso.direccion;
                        trazo.elemento.setAttribute('position', `${tx} ${ty} ${tz}`);
                    });
                }
            });

            // Polvo flotante
            particulasFlotantes.forEach(p => {
                const offsetY = Math.sin(tiempo * p.velocidad + p.fase) * p.amplitud;
                const offsetX = Math.cos(tiempo * p.velocidad * 0.7 + p.fase) * p.amplitud * 0.5;
                const offsetZ = Math.sin(tiempo * p.velocidad * 0.6 + p.fase + 1) * p.amplitud * 0.5;
                p.elemento.setAttribute('position', {
                    x: p.baseX + offsetX,
                    y: p.baseY + offsetY,
                    z: p.baseZ + offsetZ
                });
            });

            // Panel flotante
            const panel = document.querySelector('#panel-bienvenida');
            if (panel) {
                const flotar = Math.sin(tiempo * 0.5) * 0.08;
                const posActual = panel.getAttribute('position');
                panel.setAttribute('position', {
                    x: posActual.x,
                    y: 2.8 + flotar,
                    z: posActual.z
                });
            }

            // Cerebro girando
            const cerebroMedio = document.querySelector('#cerebro-medio');
            const cerebroChico = document.querySelector('#cerebro-chico');
            if (cerebroMedio) {
                cerebroMedio.setAttribute('rotation', {
                    x: tiempo * 15,
                    y: tiempo * 25,
                    z: tiempo * 5
                });
            }
            if (cerebroChico) {
                cerebroChico.setAttribute('rotation', {
                    x: tiempo * -20,
                    y: tiempo * -15,
                    z: tiempo * 10
                });
            }

            // Ondas EEG: expandir y desvanecer
            for (let i = ondasEEG.length - 1; i >= 0; i--) {
                const onda = ondasEEG[i];
                onda.radio += onda.velocidad;
                onda.opacidad -= 0.003;

                if (onda.opacidad <= 0 || onda.radio > 10) {
                    // Eliminar
                    if (onda.elemento && onda.elemento.parentNode) {
                        onda.elemento.parentNode.removeChild(onda.elemento);
                    }
                    ondasEEG.splice(i, 1);
                } else {
                    onda.elemento.setAttribute('radius-inner', onda.radio - 0.04);
                    onda.elemento.setAttribute('radius-outer', onda.radio);
                    onda.elemento.setAttribute('material', `
                        emissive: ${onda.color};
                        emissiveIntensity: ${onda.opacidad * 1.5};
                        transparent: true;
                        opacity: ${onda.opacidad};
                        side: double;
                    `);

                    // Rotar ligeramente
                    const rotActual = onda.elemento.getAttribute('rotation');
                    onda.elemento.setAttribute('rotation', {
                        x: rotActual.x + onda.rotacionX,
                        y: rotActual.y + onda.rotacionY,
                        z: rotActual.z
                    });
                }
            }
        }
    });

    const ticker = document.createElement('a-entity');
    ticker.setAttribute('neuro-tick', '');
    scene.appendChild(ticker);

    console.log(`Nivel 3: Ondas EEG activas`);
});