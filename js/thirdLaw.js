
function startThirdLawExperiment() {

    const canvas = document.getElementById("physicsCanvas");
    canvas.height = 260;
    const ctx = canvas.getContext("2d");

    const message = document.getElementById("simulationMessage");
    const stopwatch = document.getElementById("stopwatch");
    const toggleTimer = document.getElementById("toggleTimer");

    const recordsBody = document.getElementById("recordsBody");
    const recordCount = document.getElementById("recordCount");

    // Personalizar la interfaz del tercer nivel
    document.querySelector(".simulation-stats").innerHTML = `
        <div>VELOCIDAD A<strong id="velocityA">0.00 m/s</strong></div>
        <div>VELOCIDAD B<strong id="velocityB">0.00 m/s</strong></div>
        <div>ACELERACIÓN A<strong id="accelerationA">0.00 m/s²</strong></div>
        <div>ACELERACIÓN B<strong id="accelerationB">0.00 m/s²</strong></div>
    `;

    document.querySelector(".experiment-settings").innerHTML = `
        <h3>Configuración de astronautas</h3>

        <div class="setting-control">
            <label for="massA">
                Masa del astronauta A
                <strong id="massAOutput">10 kg</strong>
            </label>
            <input id="massA" type="range" min="1" max="150"
                value="10" step="1">
        </div>

        <div class="setting-control">
            <label for="massB">
                Masa del astronauta B
                <strong id="massBOutput">10 kg</strong>
            </label>
            <input id="massB" type="range" min="1" max="150"
                value="10" step="1">
        </div>

        <div class="setting-control">
            <label for="interactionForce">
                Fuerza de interacción
                <strong id="forceOutput">100 N</strong>
            </label>
            <input id="interactionForce" type="range"
                min="10" max="500" step="5" value="100">
        </div>

        <p class="physics-explanation">
            Las fuerzas de acción y reacción tienen la misma magnitud
            y sentidos opuestos.
        </p>
    `;

    // Crear gráfico comparativo
    const chartContainer = document.createElement("section");
    chartContainer.className = "acceleration-chart";

    chartContainer.innerHTML = `
        <div class="chart-heading">
            <div>
                <span>ANÁLISIS FÍSICO</span>
                <h3>Aceleración de ambos astronautas</h3>
            </div>
        </div>

        <canvas id="thirdLawChart" width="900" height="220"></canvas>

        <div class="chart-legend">
            <span><i class="legend-dot positive"></i> Astronauta A</span>
            <span><i class="legend-dot negative"></i> Astronauta B</span>
        </div>
    `;

    canvas.insertAdjacentElement("afterend", chartContainer);
    
// Reorganizar interfaz del tercer nivel
const simulationPanel = document.querySelector(
    "#simulationScreen .simulation-panel"
);

const statsPanel = simulationPanel.querySelector(
    ".simulation-stats"
);

const settingsPanel = simulationPanel.querySelector(
    ".experiment-settings"
);

const controlsPanel = simulationPanel.querySelector(
    ".simulation-controls"
);

const messagePanel = simulationPanel.querySelector(
    "#simulationMessage"
);

const labLog = simulationPanel.querySelector(".lab-log");

// Orden de presentación
simulationPanel.insertBefore(statsPanel, canvas);
simulationPanel.insertBefore(settingsPanel, canvas);
simulationPanel.insertBefore(controlsPanel, canvas);
simulationPanel.insertBefore(messagePanel, canvas);
simulationPanel.insertBefore(chartContainer, statsPanel);


    const chartCanvas = document.getElementById("thirdLawChart");
    const chartCtx = chartCanvas.getContext("2d");

    // Referencias a controles
    const massAInput = document.getElementById("massA");
    const massBInput = document.getElementById("massB");
    const forceInput = document.getElementById("interactionForce");

    const velocityAOutput = document.getElementById("velocityA");
    const velocityBOutput = document.getElementById("velocityB");
    const accelerationAOutput = document.getElementById("accelerationA");
    const accelerationBOutput = document.getElementById("accelerationB");

    // Estado físico
    let massA = 10;
    let massB = 10;
    let force = 100;

    let positionA = -100;
    let positionB = 100;

    let velocityA = 0;
    let velocityB = 0;

    let accelerationA = 0;
    let accelerationB = 0;
    let maxAccelerationA = 0;
    let maxAccelerationB = 0;

    let pushing = false;
    let pushRemaining = 0;

    let elapsedTime = 0;
    let timerRunning = false;
    let running = true;
    let lastTime = 0;
    let animationId;

    let records = [];
    let graphHistory = [];

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remaining = seconds % 60;

        return String(minutes).padStart(2, "0") + ":" +
            remaining.toFixed(2).padStart(5, "0");
    }

    function readSettings() {
        massA = Number(massAInput.value);
        massB = Number(massBInput.value);
        force = Number(forceInput.value);

        document.getElementById("massAOutput").textContent =
            massA + " kg";

        document.getElementById("massBOutput").textContent =
            massB + " kg";

        document.getElementById("forceOutput").textContent =
            force + " N";
    }

    massAInput.addEventListener("input", readSettings);
    massBInput.addEventListener("input", readSettings);
    forceInput.addEventListener("input", readSettings);

    // Dibujar astronautas
    function drawAstronaut(x, y, label, color) {

        ctx.save();
        ctx.translate(x, y);

        // Mochila
        ctx.fillStyle = "#718096";
        ctx.fillRect(-23, -5, 12, 30);

        // Cuerpo
        ctx.fillStyle = color;
        ctx.fillRect(-13, 0, 26, 35);

        // Casco
        ctx.fillStyle = "#e2e8f0";
        ctx.beginPath();
        ctx.arc(0, -13, 19, 0, Math.PI * 2);
        ctx.fill();

        // Visor
        ctx.fillStyle = "#5bc0de";
        ctx.beginPath();
        ctx.ellipse(0, -13, 13, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        // Brazos
        ctx.strokeStyle = color;
        ctx.lineWidth = 9;
        ctx.lineCap = "round";

        ctx.beginPath();
        ctx.moveTo(-10, 8);
        ctx.lineTo(-23, 20);
        ctx.moveTo(10, 8);
        ctx.lineTo(23, 20);
        ctx.stroke();

        // Piernas
        ctx.beginPath();
        ctx.moveTo(-7, 32);
        ctx.lineTo(-13, 48);
        ctx.moveTo(7, 32);
        ctx.lineTo(13, 48);
        ctx.stroke();

        // Identificador
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 13px Arial";
        ctx.textAlign = "center";
        ctx.fillText(label, 0, 67);

        ctx.restore();
    }

    // Escenario espacial
    function drawSpace() {

        const gradient = ctx.createLinearGradient(0, 0, 0, 350);
        gradient.addColorStop(0, "#07152e");
        gradient.addColorStop(1, "#172d50");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Estrellas
        for (let i = 0; i < 65; i++) {
            const x = (i * 137) % canvas.width;
            const y = (i * 71) % canvas.height;

            ctx.fillStyle = i % 3 === 0 ? "#4bd5b2" : "#ffffff";

            ctx.beginPath();
            ctx.arc(x, y, i % 4 === 0 ? 2 : 1, 0, Math.PI * 2);
            ctx.fill();
        }

        // Planeta decorativo
        const planet = ctx.createRadialGradient(
            760, 65, 5, 760, 65, 65
        );

        planet.addColorStop(0, "#7dd3fc");
        planet.addColorStop(1, "#1d4ed8");

        ctx.fillStyle = planet;
        ctx.beginPath();
        ctx.arc(760, 65, 65, 0, Math.PI * 2);
        ctx.fill();

        // Centro de referencia
        ctx.strokeStyle = "rgba(255,255,255,0.18)";
        ctx.setLineDash([5, 7]);

        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();

        ctx.setLineDash([]);

        // Escala dinámica para mantener ambos astronautas visibles
        const farthest = Math.max(
            Math.abs(positionA),
            Math.abs(positionB),
            150
        );

        const scale = Math.min(
            0.85,
            (canvas.width * 0.40) / farthest
        );

        const center = canvas.width / 2;

        const xA = center + positionA * scale;
        const xB = center + positionB * scale;

        // Flechas de fuerza durante el impulso
        if (pushing) {

            ctx.lineWidth = 5;

            // Fuerza sobre A hacia la izquierda
            ctx.strokeStyle = "#ff6b6b";
            ctx.fillStyle = "#ff6b6b";

            ctx.beginPath();
            ctx.moveTo(xA - 20, 160);
            ctx.lineTo(xA - 95, 160);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(xA - 95, 160);
            ctx.lineTo(xA - 80, 150);
            ctx.lineTo(xA - 80, 170);
            ctx.closePath();
            ctx.fill();

            // Fuerza sobre B hacia la derecha
            ctx.strokeStyle = "#4bd5b2";
            ctx.fillStyle = "#4bd5b2";

            ctx.beginPath();
            ctx.moveTo(xB + 20, 160);
            ctx.lineTo(xB + 95, 160);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(xB + 95, 160);
            ctx.lineTo(xB + 80, 150);
            ctx.lineTo(xB + 80, 170);
            ctx.closePath();
            ctx.fill();
            
            // Valores numéricos de acción y reacción
            ctx.font = "bold 15px Arial";
            ctx.textAlign = "center";

            // Fuerza ejercida sobre el astronauta A
            ctx.fillStyle = "#ff6b6b";
            ctx.fillText(
                "A: -" + force + " N",
                xA - 65,
                135
            );

            // Fuerza ejercida sobre el astronauta B
            ctx.fillStyle = "#4bd5b2";
            ctx.fillText(
                "B: +" + force + " N",
                xB + 65,
                135
            );

        }

        drawAstronaut(xA, 155, "ASTRONAUTA A", "#2563eb");
        drawAstronaut(xB, 155, "ASTRONAUTA B", "#dc3545");

        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 15px Arial";
        ctx.textAlign = "center";
        ctx.fillText("LABORATORIO ESPACIAL NEWTON LAB", center, 30);
        ctx.font = "bold 13px Arial";
ctx.fillStyle = "#ffffff";

ctx.fillText(
    "ACCIÓN = REACCIÓN | FUERZAS IGUALES Y OPUESTAS",
    center,
    82
);

        ctx.font = "13px Arial";
        ctx.fillStyle = "#cbd5e1";
        ctx.fillText(
            "Separación: " + Math.abs(positionB - positionA).toFixed(2) + " m",
            center,
            55
        );

        ctx.textAlign = "left";
    }

    // Gráfico comparativo
    function drawChart() {

        const width = chartCanvas.width;
        const height = chartCanvas.height;

        chartCtx.clearRect(0, 0, width, height);

        chartCtx.fillStyle = "#101a2b";
        chartCtx.fillRect(0, 0, width, height);

        const padding = 35;
        const values = graphHistory.flatMap(point => [
            point.a,
            point.b
        ]);

        const limit = Math.max(
            5,
            Math.ceil(Math.max(...values.map(Math.abs), 1) / 5) * 5
        );

        function getY(value) {
            return height / 2 -
                (value / limit) * (height / 2 - padding);
        }

        // Cuadrícula
        chartCtx.strokeStyle = "#29394d";
        chartCtx.lineWidth = 1;

        for (let i = 0; i <= 4; i++) {
            const y = padding + i * (height - padding * 2) / 4;

            chartCtx.beginPath();
            chartCtx.moveTo(45, y);
            chartCtx.lineTo(width - 20, y);
            chartCtx.stroke();
        }

        // Eje cero
        chartCtx.strokeStyle = "#718096";
        chartCtx.setLineDash([6, 5]);

        chartCtx.beginPath();
        chartCtx.moveTo(45, height / 2);
        chartCtx.lineTo(width - 20, height / 2);
        chartCtx.stroke();

        chartCtx.setLineDash([]);

        if (graphHistory.length > 1) {

            const first = graphHistory[0].time;
            const last = graphHistory[graphHistory.length - 1].time;
            const range = Math.max(last - first, 5);

            [
                { key: "a", color: "#4bd5b2" },
                { key: "b", color: "#ff6b6b" }
            ].forEach(series => {

                chartCtx.beginPath();

                graphHistory.forEach((point, index) => {

                    const x = 45 +
                        ((point.time - first) / range) * (width - 65);

                    const y = getY(point[series.key]);

                    if (index === 0) {
                        chartCtx.moveTo(x, y);
                    } else {
                        chartCtx.lineTo(x, y);
                    }
                });

                chartCtx.strokeStyle = series.color;
                chartCtx.lineWidth = 3;
                chartCtx.stroke();
            });
        }
    }

    // Bitácora
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
        <td>${record.massA} kg</td>
        <td>${record.massB} kg</td>
        <td>${record.force} N</td>
        <td>${record.velocityA.toFixed(2)} m/s</td>
        <td>${record.velocityB.toFixed(2)} m/s</td>
        <td>${record.accelerationA.toFixed(2)} m/s²</td>
        <td>${record.accelerationB.toFixed(2)} m/s²</td>
        <td>${record.maxAccelerationA.toFixed(2)} m/s²</td>
        <td>${record.maxAccelerationB.toFixed(2)} m/s²</td>
        <td>${record.separation.toFixed(2)} m</td>
    </tr>
`).join("");

    }

    // Motor físico
    function update(time) {

        if (!running) return;

        const dt = lastTime === 0
            ? 0
            : Math.min((time - lastTime) / 1000, 0.033);

        lastTime = time;

        if (timerRunning) {
            elapsedTime += dt;
            stopwatch.textContent = formatTime(elapsedTime);
        }

        // Fuerzas iguales y opuestas
        let forceA = 0;
        let forceB = 0;

        if (pushing) {

            forceA = -force;
            forceB = force;

            if (dt > 0) {
                pushRemaining -= dt;

                if (pushRemaining <= 0) {
                    pushing = false;
                    pushRemaining = 0;
                }
            }
        }

        accelerationA = forceA / massA;
        accelerationB = forceB / massB;
        maxAccelerationA = Math.max(
    maxAccelerationA,
    Math.abs(accelerationA)
);

maxAccelerationB = Math.max(
    maxAccelerationB,
    Math.abs(accelerationB)
);

        if (dt > 0) {

            velocityA += accelerationA * dt;
            velocityB += accelerationB * dt;

            positionA += velocityA * dt;
            positionB += velocityB * dt;

            graphHistory.push({
                time: elapsedTime,
                a: accelerationA,
                b: accelerationB
            });

            if (graphHistory.length > 180) {
                graphHistory.shift();
            }
        }

        velocityAOutput.textContent =
            velocityA.toFixed(2) + " m/s";

        velocityBOutput.textContent =
            velocityB.toFixed(2) + " m/s";

        accelerationAOutput.textContent =
            accelerationA.toFixed(2) + " m/s²";

        accelerationBOutput.textContent =
            accelerationB.toFixed(2) + " m/s²";

        drawSpace();
        drawChart();

        animationId = requestAnimationFrame(update);
    }

    // Aplicar interacción
    document.getElementById("applyForce")
        .addEventListener("click", () => {

            readSettings();

            if (pushing) {
                message.textContent =
                    "Espera a que termine el impulso actual.";
                return;
            }

            pushing = true;
            pushRemaining = 1.2;
            maxAccelerationA = 0;
            maxAccelerationB = 0;

            timerRunning = true;
            toggleTimer.textContent = "PAUSAR CRONÓMETRO";

            message.textContent =
                "¡Acción y reacción! Ambos astronautas reciben fuerzas iguales y opuestas.";
        });

    // Cronómetro
    toggleTimer.addEventListener("click", () => {

        timerRunning = !timerRunning;

        toggleTimer.textContent = timerRunning
            ? "PAUSAR CRONÓMETRO"
            : "REANUDAR CRONÓMETRO";
    });

    // Registrar ensayo
    document.getElementById("recordTrial")
        .addEventListener("click", () => {

            records.push({
                number: records.length + 1,
                time: elapsedTime,
                massA,
                massB,
                force,
                velocityA,
                velocityB,
                accelerationA,
                accelerationB,
                maxAccelerationA,
                maxAccelerationB,
                separation: Math.abs(positionB - positionA)
});

            renderRecords();

            message.textContent =
                "Ensayo " + records.length + " registrado.";
        });

    // Reiniciar
    document.getElementById("resetSimulation")
        .addEventListener("click", () => {

            massAInput.value = 10;
            massBInput.value = 10;
            forceInput.value = 100;

            positionA = -100;
            positionB = 100;

            velocityA = 0;
            velocityB = 0;
            accelerationA = 0;
            accelerationB = 0;
            maxAccelerationA = 0;
            maxAccelerationB = 0;

            pushing = false;
            pushRemaining = 0;

            elapsedTime = 0;
            timerRunning = false;
            lastTime = 0;

            graphHistory = [];

            readSettings();

            stopwatch.textContent = "00:00.00";
            toggleTimer.textContent = "INICIAR CRONÓMETRO";

            message.textContent =
                "Experimento reiniciado. El historial se conserva.";

            velocityAOutput.textContent = "0.00 m/s";
            velocityBOutput.textContent = "0.00 m/s";
            accelerationAOutput.textContent = "0.00 m/s²";
            accelerationBOutput.textContent = "0.00 m/s²";

            drawSpace();
            drawChart();
        });

    // Exportar a Excel
    document.getElementById("exportRecords")
        .addEventListener("click", async () => {

            if (records.length === 0) {
                message.textContent =
                    "Primero registra al menos un ensayo.";
                return;
            }

            if (typeof ExcelJS === "undefined") {
                message.textContent =
                    "No se pudo cargar ExcelJS. Verifica tu conexión.";
                return;
            }

            try {

                const workbook = new ExcelJS.Workbook();

                workbook.creator = "Newton Lab";
                workbook.subject = "Tercera ley de Newton";

                const worksheet = workbook.addWorksheet("Tercera Ley");

                
worksheet.columns = [
    { header: "Ensayo", key: "number", width: 12 },
    { header: "Tiempo (s)", key: "time", width: 16 },
    { header: "Masa A (kg)", key: "massA", width: 15 },
    { header: "Masa B (kg)", key: "massB", width: 15 },
    { header: "Fuerza (N)", key: "force", width: 15 },
    { header: "Velocidad A (m/s)", key: "velocityA", width: 21 },
    { header: "Velocidad B (m/s)", key: "velocityB", width: 21 },
    { header: "Aceleración A (m/s²)", key: "accelerationA", width: 23 },
    { header: "Aceleración B (m/s²)", key: "accelerationB", width: 23 },
    { header: "Aceleración máxima A (m/s²)", key: "maxAccelerationA", width: 27 },
    { header: "Aceleración máxima B (m/s²)", key: "maxAccelerationB", width: 27 },
    { header: "Separación (m)", key: "separation", width: 18 }
];


                records.forEach(record => {
                    worksheet.addRow({
                        ...record,
                        time: Number(record.time.toFixed(2)),
                        velocityA: Number(record.velocityA.toFixed(2)),
                        velocityB: Number(record.velocityB.toFixed(2)),
                        accelerationA: Number(record.accelerationA.toFixed(2)),
                        accelerationB: Number(record.accelerationB.toFixed(2)),
                        separation: Number(record.separation.toFixed(2))
                    });
                });

                const header = worksheet.getRow(1);
                header.height = 35;

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
                });

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

                worksheet.autoFilter = {
                    from: "A1",
                    to: "L" + (records.length + 1)
                };

                worksheet.views = [
                    { state: "frozen", ySplit: 1 }
                ];

                const buffer = await workbook.xlsx.writeBuffer();

                const blob = new Blob([buffer], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                });

                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");

                link.href = url;
                link.download = "NewtonLab_TerceraLey.xlsx";

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                setTimeout(() => URL.revokeObjectURL(url), 1000);

                message.textContent = "Excel exportado correctamente.";

            } catch (error) {
                console.error(error);
                message.textContent = "Error al generar el archivo Excel.";
            }
        });

    // Borrar historial
    document.getElementById("clearRecords")
        .addEventListener("click", () => {

            if (!confirm("¿Deseas borrar todos los ensayos registrados?")) {
                return;
            }

            records = [];
            renderRecords();

            message.textContent = "Historial eliminado.";
        });

    // Cerrar experimento
    document.getElementById("exitSimulation")
        .addEventListener("click", () => {
            running = false;
            cancelAnimationFrame(animationId);
        });

    // Cambiar encabezados de la bitácora
    const tableHeaders = document.querySelectorAll(".records-table thead th");

    
const headerNames = [
    "Ensayo",
    "Tiempo",
    "Masa A",
    "Masa B",
    "Fuerza",
    "Velocidad A",
    "Velocidad B",
    "Aceleración A",
    "Aceleración B",
    "Aceleración máxima A",
    "Aceleración máxima B",
    "Separación"
];

const tableHead = document.querySelector(".records-table thead");

tableHead.innerHTML = `
    <tr>
        ${headerNames.map(name => `<th>${name}</th>`).join("")}
    </tr>
`;

const emptyRow = recordsBody.querySelector(".empty-records");

if (emptyRow) {
    emptyRow.setAttribute("colspan", "12");
}


    // Cambiar texto del botón
    document.getElementById("exportRecords").innerHTML =
        "<span>↓</span> EXPORTAR EXCEL";

    readSettings();
    renderRecords();
    drawSpace();
    drawChart();

    animationId = requestAnimationFrame(update);
}
