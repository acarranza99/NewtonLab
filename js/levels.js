
// ========================================
// NEWTON LAB - SISTEMA DE NIVELES
// ========================================

const experiments = {
    1: {
        title: "Primera Ley de Newton",
        subtitle: "Ley de la inercia",
        description:
            "Un objeto permanece en reposo o en movimiento rectilíneo uniforme mientras no actúe sobre él una fuerza neta.",
        formula: "ΣF = 0 → velocidad constante",
        objective:
            "Aplica una fuerza a la caja y observa cómo cambia su movimiento."
    },

    2: {
        title: "Segunda Ley de Newton",
        subtitle: "Fuerza y aceleración",
        description:
            "La aceleración de un objeto depende de la fuerza neta aplicada y de su masa.",
        formula: "F = m × a",
        objective:
            "Modifica la masa y la fuerza para comparar la aceleración."
    },

    3: {
        title: "Tercera Ley de Newton",
        subtitle: "Acción y reacción",
        description:
            "Cuando un cuerpo ejerce una fuerza sobre otro, el segundo ejerce una fuerza igual y opuesta sobre el primero.",
        formula: "F₁₂ = −F₂₁",
        objective:
            "Observa qué sucede cuando dos objetos interactúan."
    }
};

// Crear la ventana de cada experimento
function openLevel(levelNumber) {

    const experiment = experiments[levelNumber];

    if (!experiment) {
        console.error("Experimento no encontrado.");
        return;
    }

    // Eliminar una ventana anterior
    const previousModal = document.getElementById("experimentModal");

    if (previousModal) {
        previousModal.remove();
    }

    // Crear ventana
    const modal = document.createElement("div");
    modal.id = "experimentModal";
    modal.className = "experiment-modal";

    modal.innerHTML = `
        <div class="experiment-content">

            <button class="close-modal" id="closeModal">
                ✕
            </button>

            <span class="eyebrow">LABORATORIO DE NEWTON</span>

            <h2>${experiment.title}</h2>

            <h3>${experiment.subtitle}</h3>

            <p>${experiment.description}</p>

            <div class="formula-box">
                <span>FÓRMULA FÍSICA</span>
                <strong>${experiment.formula}</strong>
            </div>

            <div class="objective-box">
                <strong>OBJETIVO DEL EXPERIMENTO</strong>
                <p>${experiment.objective}</p>
            </div>

            <button class="primary-button" id="beginExperiment">
                INICIAR EXPERIMENTO →
            </button>

        </div>
    `;

    document.body.appendChild(modal);

    // Cerrar ventana
   
document.getElementById("beginExperiment")
    .addEventListener("click", () => {

        modal.remove();

        if (typeof startSimulation === "function") {
            startSimulation(levelNumber);
        } else {
            console.error("No se encontró el motor de simulación.");
        }

    });

}

// ========================================
// NEWTON LAB - PANTALLA DE SIMULACION
// ========================================



function startSimulation(levelNumber) {

    const experiment = experiments[levelNumber];

    const simulation = document.createElement("div");
    simulation.id = "simulationScreen";
    simulation.className = "simulation-screen";

    simulation.innerHTML = `
        <div class="simulation-panel">

            <div class="simulation-header">
                <div>
                    <span class="eyebrow">
                        NEWTON LAB / EXPERIMENTO ${levelNumber}
                    </span>
                    <h2>${experiment.title}</h2>
                    <p>${experiment.subtitle}</p>
                </div>

                <button id="exitSimulation" class="close-modal">✕</button>
            </div>

            <div class="simulation-description">
                ${experiment.objective}
            </div>

            <canvas id="physicsCanvas" width="900" height="350"></canvas>

            <div class="simulation-stats">
                <div>VELOCIDAD
                    <strong id="velocityValue">0.00 m/s</strong>
                </div>
                <div>ACELERACIÓN
                    <strong id="accelerationValue">0.00 m/s²</strong>
                </div>
                <div>MASA
                    <strong id="massValue">10 kg</strong>
                </div>
            </div>

            <div class="experiment-settings">
                <h3>Configuración del experimento</h3>

                <div class="setting-control">
                    <label for="massInput">
                        Masa del objeto
                        <strong id="massOutput">10 kg</strong>
                    </label>
                    <input id="massInput" type="range"
                        min="1" max="150" step="1" value="10">
                </div>

                <div class="setting-control">
                    <label for="forceInput">
                        Fuerza aplicada
                        <strong id="forceOutput">100 N</strong>
                    </label>
                    <input id="forceInput" type="range"
                        min="0" max="500" step="5" value="100">
                </div>

                <div class="setting-control">
                    <label for="frictionInput">
                        Coeficiente de fricción
                        <strong id="frictionOutput">0.40</strong>
                    </label>
                    <input id="frictionInput" type="range"
                        min="0" max="1" step="0.05" value="0.40">
                </div>
            </div>

            <div class="simulation-controls">
                <button id="applyForce" class="primary-button">
                    APLICAR FUERZA →
                </button>

                <button id="resetSimulation" class="level-button">
                    REINICIAR EXPERIMENTO
                </button>
            </div>

            <p id="simulationMessage">
                Configura los parámetros y comienza tu experimento.
            </p>

            <!-- CRONOMETRO -->
            <section class="lab-log">

                <div class="log-heading">
                    <div>
                        <span class="eyebrow">CONTROL DEL TIEMPO</span>
                        <h3>Cronómetro del experimento</h3>
                    </div>

                    <div class="stopwatch" id="stopwatch">
                        00:00.00
                    </div>
                </div>

                <div class="log-actions">
                    <button id="toggleTimer" class="secondary-button">
                        INICIAR CRONÓMETRO
                    </button>

                    <button id="recordTrial" class="primary-button">
                        REGISTRAR ENSAYO +
                    </button>
                </div>

                <!-- HISTORIAL -->
                <div class="records-heading">
                    <div>
                        <span class="eyebrow">REGISTRO DE DATOS</span>
                        <h3>Historial de ensayos</h3>
                    </div>

                    <span id="recordCount">0 ensayos</span>
                </div>

                <div class="records-table-wrapper">
                    <table class="records-table">
                        <thead>
                            <tr>
                                <th>Ensayo</th>
                                <th>Tiempo</th>
                                <th>Masa</th>
                                <th>Fuerza</th>
                                <th>Fricción</th>
                                <th>Velocidad</th>
                                <th>Aceleración</th>
                                <th>Distancia</th>
                            </tr>
                        </thead>

                        <tbody id="recordsBody">
                            <tr>
                                <td colspan="8" class="empty-records">
                                    Todavía no hay ensayos registrados.
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div class="log-footer">
                    <button id="exportRecords" class="secondary-button">
                        <span>↓</span> EXPORTAR EXCEL
                    </button>

                    <button id="clearRecords" class="danger-button">
                        BORRAR HISTORIAL
                    </button>
                </div>

            </section>

        </div>
    `;

    document.body.appendChild(simulation);

    document.getElementById("exitSimulation")
        .addEventListener("click", () => {
            simulation.remove();
        });

    if (levelNumber === 1) {
    startInertiaExperiment();

} else if (levelNumber === 2) {
    startSecondLawExperiment();

} else if (levelNumber === 3) {
    startThirdLawExperiment();
}
}


// ========================================
// NIVEL 1 - EXPERIMENTO DE INERCIA
// ========================================

    


function startInertiaExperiment() {

   const canvas = document.getElementById("physicsCanvas");

canvas.height = 280;
canvas.style.width = "100%";
canvas.style.height = "auto";
canvas.style.display = "block";

const ctx = canvas.getContext("2d");

    const massInput = document.getElementById("massInput");
    const forceInput = document.getElementById("forceInput");
    const frictionInput = document.getElementById("frictionInput");

    const massOutput = document.getElementById("massOutput");
    const forceOutput = document.getElementById("forceOutput");
    const frictionOutput = document.getElementById("frictionOutput");

    const velocityValue = document.getElementById("velocityValue");
    const accelerationValue = document.getElementById("accelerationValue");
    const massValue = document.getElementById("massValue");

    const message = document.getElementById("simulationMessage");
    // Ajustar presentación del primer experimento
    canvas.style.width = "100%";
    canvas.style.display = "block";
    canvas.style.margin = "0 auto 16px";

    const stopwatch = document.getElementById("stopwatch");
    const toggleTimer = document.getElementById("toggleTimer");

    const recordsBody = document.getElementById("recordsBody");
    const recordCount = document.getElementById("recordCount");

    const box = new PhysicsObject(10, 0.4);

    let forceRemaining = 0;
    let lastTime = 0;
    let animationId;
    let running = true;

    let elapsedTime = 0;
    let timerRunning = false;
    let maxVelocity = 0;

    let records = [];

    function formatTime(seconds) {

        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return (
            String(minutes).padStart(2, "0") + ":" +
            remainingSeconds.toFixed(2).padStart(5, "0")
        );
    }

    function readSettings() {

        const mass = Number(massInput.value);
        const force = Number(forceInput.value);
        const friction = Number(frictionInput.value);

        box.setMass(mass);
        box.setFriction(friction);

        massOutput.textContent = mass + " kg";
        forceOutput.textContent = force + " N";
        frictionOutput.textContent = friction.toFixed(2);

        massValue.textContent = mass + " kg";

        return { mass, force, friction };
    }

    massInput.addEventListener("input", readSettings);
    forceInput.addEventListener("input", readSettings);
    frictionInput.addEventListener("input", readSettings);

   function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Compactar verticalmente el escenario
    ctx.save();
    ctx.scale(1, 0.9);

    // Fondo
    ctx.fillStyle = "#eaf2fa";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Posición visual fija de la caja
    const boxX = 180;
    const boxWidth = 75;
    const boxHeight = 55;

    // Desplazamiento visual del escenario
    const scrollOffset = box.position * 20;

    // Suelo
    ctx.fillStyle = "#aebfd0";
    ctx.fillRect(0, 270, canvas.width, 80);

    // Marcas repetidas del suelo
    ctx.fillStyle = "#71869b";

    const spacing = 100;
    const offset = scrollOffset % spacing;

    for (let x = -offset; x < canvas.width; x += spacing) {
        ctx.fillRect(x, 270, 3, 15);
    }

    // Indicadores de distancia
    ctx.fillStyle = "#52677d";
    ctx.font = "12px Arial";

    for (let x = -offset; x < canvas.width; x += spacing) {
        const distanceMark = Math.floor(
            (scrollOffset + x) / 20
        );

        if (x >= 0) {
            ctx.fillText(
                Math.max(0, distanceMark) + " m",
                x + 5,
                305
            );
        }
    }

    // Caja
    ctx.fillStyle = "#3978d4";
    ctx.fillRect(boxX, 215, boxWidth, boxHeight);

    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.fillText(box.mass + " kg", boxX + 15, 248);

    // Indicador de fuerza
    if (forceRemaining > 0) {
        ctx.fillStyle = "#e05b45";
        ctx.font = "bold 20px Arial";
        ctx.fillText("FUERZA →", boxX, 190);
    }

    // Indicador de movimiento
if (Math.abs(box.velocity) > 0.01) {
    ctx.fillStyle = "#168d6c";
    ctx.font = "bold 15px Arial";
    ctx.fillText("MOVIMIENTO →", boxX, 165);
}

// Restaurar escala del escenario
ctx.restore();

}


    function renderRecords() {

        recordCount.textContent =
            records.length + (records.length === 1 ? " ensayo" : " ensayos");

        if (records.length === 0) {
            recordsBody.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-records">
                        Todavía no hay ensayos registrados.
                    </td>
                </tr>
            `;
            return;
        }

        recordsBody.innerHTML = records.map(record => `
            <tr>
                <td>${record.number}</td>
                <td>${formatTime(record.time)}</td>
                <td>${record.mass.toFixed(1)} kg</td>
                <td>${record.force.toFixed(1)} N</td>
                <td>${record.friction.toFixed(2)}</td>
                <td>${record.velocity.toFixed(2)} m/s</td>
                <td>${record.acceleration.toFixed(2)} m/s²</td>
                <td>${record.distance.toFixed(2)} m</td>
            </tr>
        `).join("");
    }

    function update(time) {

        if (!running) return;

        const deltaTime = lastTime === 0
            ? 0
            : Math.min((time - lastTime) / 1000, 0.033);

        lastTime = time;

        if (timerRunning) {
            elapsedTime += deltaTime;
            stopwatch.textContent = formatTime(elapsedTime);
        }

        box.applyForce(
            forceRemaining > 0
                ? Number(forceInput.value)
                : 0
        );

        if (deltaTime > 0 && forceRemaining > 0) {
            forceRemaining = Math.max(
                0,
                forceRemaining - deltaTime
            );
        }

        const result = box.update(deltaTime);

        maxVelocity = Math.max(
            maxVelocity,
            Math.abs(result.velocity)
        );

       
        velocityValue.textContent =
            Math.abs(result.velocity).toFixed(2) + " m/s";

        accelerationValue.textContent =
            result.acceleration.toFixed(2) + " m/s²";

        massValue.textContent = box.mass + " kg";

        draw();

        animationId = requestAnimationFrame(update);
    }

    // Aplicar fuerza
    document.getElementById("applyForce")
        .addEventListener("click", () => {

            const settings = readSettings();

            if (settings.force === 0) {
                message.textContent =
                    "Selecciona una fuerza mayor que cero.";
                return;
            }

            forceRemaining = 0.8;
            timerRunning = true;

            toggleTimer.textContent = "PAUSAR CRONÓMETRO";

            message.textContent =
                "Aplicando " + settings.force +
                " N a un objeto de " + settings.mass + " kg.";

        });

    // Iniciar o pausar cronómetro
    toggleTimer.addEventListener("click", () => {

        timerRunning = !timerRunning;

        toggleTimer.textContent = timerRunning
            ? "PAUSAR CRONÓMETRO"
            : "REANUDAR CRONÓMETRO";

    });

    // Registrar ensayo
    document.getElementById("recordTrial")
        .addEventListener("click", () => {

            const settings = readSettings();

            const record = {
                number: records.length + 1,
                time: elapsedTime,
                mass: settings.mass,
                force: settings.force,
                friction: settings.friction,
                velocity: Math.abs(box.velocity),
                acceleration: box.acceleration,
                distance: box.position
            };

            records.push(record);
            renderRecords();

            message.textContent =
                "Ensayo " + record.number + " guardado correctamente.";

        });

    // Reiniciar simulación sin borrar el historial
    document.getElementById("resetSimulation")
        .addEventListener("click", () => {

            massInput.value = 10;
            forceInput.value = 100;
            frictionInput.value = 0.40;

            box.reset();

            forceRemaining = 0;
            maxVelocity = 0;
            elapsedTime = 0;
            timerRunning = false;
            lastTime = 0;

            readSettings();

            velocityValue.textContent = "0.00 m/s";
            accelerationValue.textContent = "0.00 m/s²";

            stopwatch.textContent = "00:00.00";
            toggleTimer.textContent = "INICIAR CRONÓMETRO";

            message.textContent =
                "Simulación reiniciada. El historial se conserva.";

            draw();

        });


        // Exportar historial a Excel

        document.getElementById("exportRecords")
        .addEventListener("click", async () => {

        if (records.length === 0) {
            message.textContent =
                "Primero debes registrar al menos un ensayo.";
            return;
        }

        if (typeof ExcelJS === "undefined") {
            message.textContent =
                "No se pudo cargar ExcelJS. Verifica tu conexión a internet.";
            return;
        }

        try {
            const workbook = new ExcelJS.Workbook();

            workbook.creator = "Newton Lab";
            workbook.subject = "Bitácora de experimentos de física";
            workbook.title = "Registro de ensayos";
            workbook.created = new Date();

            const worksheet = workbook.addWorksheet("Bitácora", {
                views: [{ state: "frozen", ySplit: 1 }]
            });

            // Encabezados y configuración de columnas
            worksheet.columns = [
                { header: "Ensayo", key: "number", width: 12 },
                { header: "Tiempo (s)", key: "time", width: 16 },
                { header: "Masa (kg)", key: "mass", width: 16 },
                { header: "Fuerza (N)", key: "force", width: 16 },
                { header: "Fricción", key: "friction", width: 14 },
                { header: "Velocidad (m/s)", key: "velocity", width: 20 },
                { header: "Aceleración (m/s²)", key: "acceleration", width: 22 },
                { header: "Desplazamiento (m)", key: "distance", width: 23 }
            ];

            // Registrar los ensayos
            records.forEach(record => {
                worksheet.addRow({
                    number: record.number,
                    time: Number(record.time.toFixed(2)),
                    mass: record.mass,
                    force: record.force,
                    friction: record.friction,
                    velocity: Number(record.velocity.toFixed(2)),
                    acceleration: Number(record.acceleration.toFixed(2)),
                    distance: Number(record.distance.toFixed(2))
                });
            });

            // Formato de encabezados
            const header = worksheet.getRow(1);

            header.height = 30;
            header.eachCell(cell => {
                cell.font = {
                    bold: true,
                    color: { argb: "FFFFFFFF" },
                    size: 11
                };

                cell.fill = {
                    type: "pattern",
                    pattern: "solid",
                    fgColor: { argb: "FF17324D" }
                };

                cell.alignment = {
                    horizontal: "center",
                    vertical: "middle",
                    wrapText: true
                };

                cell.border = {
                    bottom: {
                        style: "medium",
                        color: { argb: "FF48D6B2" }
                    }
                };
            });

            // Formato de los datos
            worksheet.eachRow((row, rowNumber) => {
                if (rowNumber > 1) {
                    row.height = 24;

                    row.eachCell(cell => {
                        cell.alignment = {
                            horizontal: "center",
                            vertical: "middle"
                        };

                        cell.border = {
                            bottom: {
                                style: "thin",
                                color: { argb: "FFD9E2EC" }
                            }
                        };

                        if (rowNumber % 2 === 0) {
                            cell.fill = {
                                type: "pattern",
                                pattern: "solid",
                                fgColor: { argb: "FFEAF2F8" }
                            };
                        }
                    });
                }
            });

            // Formatos numéricos
            ["B", "C", "D", "E", "F", "G", "H"].forEach(column => {
                worksheet.getColumn(column).numFmt = "0.00";
            });

            worksheet.getColumn("A").numFmt = "0";

            // Filtros en los encabezados
            worksheet.autoFilter = {
                from: "A1",
                to: "H" + (records.length + 1)
            };

            // Preparar descarga
            const buffer = await workbook.xlsx.writeBuffer();

            const blob = new Blob(
                [buffer],
                {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                }
            );

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download = "NewtonLab_Bitacora.xlsx";

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => URL.revokeObjectURL(url), 1000);

            message.textContent =
                "Bitácora de Excel exportada correctamente.";

        } catch (error) {
            console.error("Error al exportar Excel:", error);

            message.textContent =
                "Ocurrió un error al generar el archivo Excel.";
        }
    });


    // Borrar historial con confirmación
    document.getElementById("clearRecords")
        .addEventListener("click", () => {

            if (!confirm("¿Deseas borrar todos los ensayos registrados?")) {
                return;
            }

            records = [];
            renderRecords();

            message.textContent =
                "Historial de ensayos eliminado.";

        });

    readSettings();
    renderRecords();
    draw();

    animationId = requestAnimationFrame(update);

    document.getElementById("exitSimulation")
        .addEventListener("click", () => {

            running = false;
            cancelAnimationFrame(animationId);

        });
}