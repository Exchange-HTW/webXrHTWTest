console.log("Laboratorio NeuroVR - 60fps Quest Edition");

document.addEventListener('DOMContentLoaded', function () {
    const scene = document.querySelector('a-scene');

    if (!scene) {
        console.error("No se encontró la escena");
        return;
    }

    const NUM_NODOS = 40;
    const RADIO_ESFERA = 9;
    const ALTURA_MINIMA = 0.6;
    const nodos = [];
    const impulsos = [];

    const colores = [
        '#ff66aa', '#bb55ff', '#55bbff',
        '#ffaa44', '#55ffcc', '#ff55ff',
        '#ff8855', '#88ff55',
    ];

    // ========== NODOS (hemisferio superior) ==========
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

        const nucleo = document.createElement('a-sphere');
        nucleo.setAttribute('radius', 0.06);
        nucleo.setAttribute('color', color);
        nucleo.setAttribute('material', `
            emissive: ${color};
            emissiveIntensity: 1.6;
            shader: flat;
        `);
        entidad.appendChild(nucleo);

        const orbitas = [];
        const numOrbitas = 4 + Math.floor(Math.random() * 5);

        for (let j = 0; j < numOrbitas; j++) {
            const particula = document.createElement('a-sphere');
            particula.setAttribute('radius', 0.022);
            particula.setAttribute('color', color);
            particula.setAttribute('material', `
                emissive: ${color};
                emissiveIntensity: 0.9;
            `);

            const orbita = {
                elemento: particula,
                radio: 0.12 + Math.random() * 0.45,
                velocidad: 0.3 + Math.random() * 1.5,
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

            if (distancia < 6) {
                pares.push({
                    nodoA: nodoA,
                    nodoB: nodoB,
                    distancia: distancia
                });
            }
        });
    });

    // ========== IMPULSOS CON ESTELAS ==========
    pares.forEach((par) => {
        const numImpulsos = 1 + Math.floor(Math.random() * 3);

        for (let k = 0; k < numImpulsos; k++) {
            const impulso = document.createElement('a-sphere');
            impulso.setAttribute('radius', 0.05);
            impulso.setAttribute('color', par.nodoA.color);
            impulso.setAttribute('material', `
                emissive: ${par.nodoA.color};
                emissiveIntensity: 2.2;
            `);
            scene.appendChild(impulso);

            const estela = [];
            const numEstela = 8;

            for (let e = 0; e < numEstela; e++) {
                const trazo = document.createElement('a-sphere');
                trazo.setAttribute('radius', 0.025 - (e * 0.0028));
                trazo.setAttribute('color', par.nodoA.color);
                trazo.setAttribute('material', `
                    emissive: ${par.nodoA.color};
                    emissiveIntensity: ${1 - e * 0.11};
                    transparent: true;
                    opacity: ${0.75 - e * 0.08};
                `);
                scene.appendChild(trazo);
                estela.push({
                    elemento: trazo,
                    offset: (e + 1) * 0.07
                });
            }

            impulsos.push({
                elemento: impulso,
                estela: estela,
                nodoA: par.nodoA,
                nodoB: par.nodoB,
                progreso: Math.random(),
                velocidad: 0.0015 + Math.random() * 0.014,
                direccion: Math.random() > 0.5 ? 1 : -1,
            });
        }
    });

    // ========== PARTÍCULAS FLOTANTES ==========
    for (let i = 0; i < 60; i++) {
        const particula = document.createElement('a-sphere');
        const radio = 0.015 + Math.random() * 0.03;
        particula.setAttribute('radius', radio);

        const color = colores[Math.floor(Math.random() * colores.length)];
        particula.setAttribute('color', color);
        particula.setAttribute('material', `
            emissive: ${color};
            emissiveIntensity: 0.5;
            transparent: true;
            opacity: 0.6;
        `);

        const phi = Math.acos(Math.random());
        const theta = Math.random() * Math.PI * 2;
        const r = 3 + Math.random() * 10;
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = Math.abs(r * Math.cos(phi)) + ALTURA_MINIMA;
        const z = r * Math.sin(phi) * Math.sin(theta);

        particula.setAttribute('position', `${x} ${y} ${z}`);
        scene.appendChild(particula);
    }

    // ========== ANIMACIÓN 60FPS ==========
    let tiempo = 0;

    function animar() {
        tiempo += 0.016;

        nodos.forEach(nodo => {
            nodo.orbitas.forEach(orbita => {
                const angulo = tiempo * orbita.velocidad + orbita.fase;
                const x = Math.cos(angulo) * orbita.radio;
                const z = Math.sin(angulo) * orbita.radio;
                const y = Math.sin(angulo * 1.3) * orbita.radio * Math.sin(orbita.inclinacion);
                orbita.elemento.setAttribute('position', `${x} ${y} ${z}`);
            });

            const pulso = 1 + Math.sin(tiempo * 3 + nodo.posicion.x) * 0.4;
            nodo.nucleo.setAttribute('radius', 0.06 * pulso);
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
            impulso.elemento.setAttribute('radius', 0.035 + brillo * 0.05);

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

        requestAnimationFrame(animar);
    }

    requestAnimationFrame(animar);

    console.log(`Red: ${NUM_NODOS} nodos, ${pares.length} conexiones, ${impulsos.length} impulsos`);
});