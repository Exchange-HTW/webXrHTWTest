console.log("Laboratorio NeuroVR iniciado");

// Animación suave del cerebro
document.addEventListener('DOMContentLoaded', function () {
    const cerebro = document.querySelector('#cerebro');
    const orbitas = document.querySelector('#orbitas');

    if (cerebro && orbitas) {
        // Rotación suave
        let angulo = 0;

        function animar() {
            angulo += 0.003;

            // Rotar cerebro
            cerebro.setAttribute('rotation', `0 ${angulo * 50} 15`);

            // Rotar órbita de partículas
            orbitas.setAttribute('rotation', `0 ${angulo * 30} ${Math.sin(angulo) * 10}`);

            requestAnimationFrame(animar);
        }

        animar();
    }
});