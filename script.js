console.log("Laboratorio NeuroVR - Quest Optimized");

document.addEventListener('DOMContentLoaded', function () {
    const scene = document.querySelector('a-scene');
    if (!scene) return;

    const NUM_NODOS = 20;
    const RADIO_ESFERA = 8;
    const ALTURA_MINIMA = 0.8;
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
        const r = RADIO_ESFERA * (0.6 + Math.random() * 0.4);

        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = Math.max(ALTURA_MINIMA, r * Math.cos(phi) + 2);
        const z = r * Math.sin(phi) * Math.sin(theta);

        entidad.setAttribute('position', `${x} ${y} ${z}`);
        scene.appendChild(entidad);

        // Núcleo
        const nucleo = document.createElement('a-sphere');
        nucleo.setAttribute('radius', 0.07);
        nucleo.setAttribute('color', color);
        nucleo.setAttribute('material', `
            emissive: ${color};
            emissiveIntensity: 1.8;
            shader: flat;
        `);
        entidad.appendChild(nucleo);

        // Solo 3 órbitas por nodo
        const orbitas = [];
        const numOrbitas = 3;

        for (let j = 0; j < numOrbitas; j++) {
            const particula = document.createElement('a-sphere');
            particula.setAttribute('radius', 0.025);
            particula.setAttribute('color', color);
            particula.setAttribute('material', `
                emissive: ${color};
                emissiveIntensity: 1.0;
            `);

            orbitas.push({
                elemento: particula,
                radio: 0.2 + Math.random() * 0.4,
                velocidad: 0.4 + Math.random() * 1.2,
                fase: Math.random() * Math.PI * 2,
                inclinacion: (Math.random() - 0.5) * Math.PI,
            });

            entidad.appendChild(particula);
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
            if (distancia < 7) {
                pares.push({ nodoA, nodoB, distancia });
            }
        });
    });

    // ========== IMPULSOS (estela corta) ==========
    pares.forEach((par) => {
        const numImpulsos = 1 + Math.floor(Math.random() * 2);
        for (let k = 0; k < numImpulsos; k++) {
            const impulso = document.createElement('a-sphere');
            impulso.setAttribute('radius', 0.06);
            impulso.setAttribute('color', par.nodoA.color);
            impulso.setAttribute('material', `
                emissive: ${par.nodoA.color};
                emissiveIntensity: 2.5;
            `);
            scene.appendChild(impulso);

            // Solo 3 trazos de estela
            const estela = [];
            for (let e = 0; e < 3; e++) {
                const trazo = document.createElement('a-sphere');
                trazo.setAttribute('radius', 0.035 - (e * 0.01));
                trazo.setAttribute('color', par.nodoA.color);
                trazo.setAttribute('material', `
                    emissive: ${par.nodoA.color};
                    emissiveIntensity: ${1.2 - e * 0.3};
                    transparent: true;
                    opacity: ${0.8 - e * 0.2};
                `);
                scene.appendChild(trazo);
                estela.push({ elemento: trazo, offset: (e + 1) * 0.08 });
            }

            impulsos.push({
                elemento: impulso,
                estela: estela,
                nodoA: par.nodoA,
                nodoB: par.nodoB,
                progreso: Math.random(),
                velocidad: 0.002 + Math.random() * 0.01,
                direccion: Math.random() > 0.5 ? 1 : -1,
            });
        }
    });

    // ========== PARTÍCULAS DE FONDO (1 solo sistema, no 60 esferas) ==========
    const fondo = document.createElement('a-entity');
    fondo.setAttribute('id', 'fondo');
    fondo.setAttribute('position', '0 2 0');
    fondo.setAttribute('particle-system', `
        particleCount: 100;
        maxParticleSize: 0.03;
        color: #ff66aa,#bb55ff,#55bbff,#55ffcc;
        distribution: sphere;
        radius: 9;
        blending: additive;
        opacity: 0.5;
    `);
    scene.appendChild(fondo);

    // ========== ANIMACIÓN CON TICK DE A-FRAME ==========
    let tiempo = 0;

    AFRAME.registerComponent('neuro-tick', {
        tick: function (t, delta) {
            tiempo += delta / 1000;

            nodos.forEach(nodo => {
                nodo.orbitas.forEach(orbita => {
                    const angulo = tiempo * orbita.velocidad + orbita.fase;
                    const x = Math.cos(angulo) * orbita.radio;
                    const z = Math.sin(angulo) * orbita.radio;
                    const y = Math.sin(angulo * 1.3) * orbita.radio * Math.sin(orbita.inclinacion);
                    orbita.elemento.setAttribute('position', `${x} ${y} ${z}`);
                });

                const pulso = 1 + Math.sin(tiempo * 3 + nodo.posicion.x) * 0.35;
                nodo.nucleo.setAttribute('radius', 0.07 * pulso);
            });

            impulsos.forEach(impulso => {
                impulso.progreso += impulso.velocidad * impulso.direccion;
                if (impulso.progreso >= 1 || impulso.progreso <= 0) {
                    impulso.direccion *= -1;
                    impulso.progreso = Math.max(0, Math.min(1, impulso.progreso));
                }

                const A = impulso.nodoA.posicion;
                const B = impulso.nodoB.posicion;
                const t = impulso.progreso;

                const x = A.x + (B.x - A.x) * t;
                const y = A.y + (B.y - A.y) * t;
                const z = A.z + (B.z - A.z) * t;
                impulso.elemento.setAttribute('position', `${x} ${y} ${z}`);

                const brillo = 1 - Math.abs(t - 0.5) * 2;
                impulso.elemento.setAttribute('radius', 0.04 + brillo * 0.05);

                const dirX = B.x - A.x;
                const dirY = B.y - A.y;
                const dirZ = B.z - A.z;
                const distTotal = Math.sqrt(dirX * dirX + dirY * dirY + dirZ * dirZ);

                if (distTotal > 0.001) {
                    const dirNX = dirX / distTotal;
                    const dirNY = dirY / distTotal;
                    const dirNZ = dirZ / distTotal;

                    impulso.estela.forEach(trazo => {
                        const trazoX = x - dirNX * trazo.offset * impulso.direccion;
                        const trazoY = y - dirNY * trazo.offset * impulso.direccion;
                        const trazoZ = z - dirNZ * trazo.offset * impulso.direccion;
                        trazo.elemento.setAttribute('position', `${trazoX} ${trazoY} ${trazoZ}`);
                    });
                }
            });
        }
    });

    // Crear entidad ticker
    const ticker = document.createElement('a-entity');
    ticker.setAttribute('neuro-tick', '');
    scene.appendChild(ticker);

    console.log(`Quest: ${NUM_NODOS} nodos, ${pares.length} conexiones, ${impulsos.length} impulsos`);
});