
// ========================================
// NEWTON LAB - CONTROL PRINCIPAL
// ========================================

document.addEventListener("DOMContentLoaded", () => {

    const startButton = document.getElementById("startButton");
    const levelsSection = document.getElementById("levels");
    const levelButtons = document.querySelectorAll("[data-level]");

    // Desplazarse hasta los experimentos
    startButton.addEventListener("click", () => {
        levelsSection.scrollIntoView({
            behavior: "smooth"
        });
    });

    // Abrir el nivel seleccionado
    levelButtons.forEach(button => {

        button.addEventListener("click", () => {

            const levelNumber = Number(button.dataset.level);

            if (typeof openLevel === "function") {
                openLevel(levelNumber);
            } else {
                console.error("No se encontró la función openLevel.");
            }

        });

    });

    console.log("Newton Lab iniciado correctamente.");

});
