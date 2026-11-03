
function startSecondLawExperiment() {

   const canvas = document.getElementById("physicsCanvas");

canvas.height = 280;
canvas.style.width = "100%";
canvas.style.height = "auto";
canvas.style.display = "block";

const ctx = canvas.getContext("2d");
    // Gráfico de aceleración en tiempo real
const chartContainer = document.createElement("section");

chartContainer.className = "acceleration-chart";

chartContainer.innerHTML = `
    <div class="chart-heading">
        <div>
            <span>ANÁLISIS FÍSICO</span>
            <h3>Aceleración en tiempo real</h3>
        </div>
        <strong id="chartAcceleration">0.00 m/s²</strong>
    </div>

    <canvas id="accelerationChart" width="900" height="180"></canvas>

    <div class="chart-labels">
    <span>Tiempo (s)</span>
    <span>Aceleración (m/s²)</span>
</div>

<div class="chart-legend">
    <span><i class="legend-dot positive"></i> Aceleración positiva</span>
    <span><i class="legend-dot negative"></i> Aceleración negativa</span>
    <span><i class="legend-dot neutral"></i> Aceleración cero</span>
</div>
`;

canvas.insertAdjacentElement("afterend", chartContainer);

const chartCanvas = document.getElementById("accelerationChart");
const chartCtx = chartCanvas.getContext("2d");

let accelerationHistory = [];
let graphTime = 0;

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
    const stopwatch = document.getElementById("stopwatch");
    const toggleTimer = document.getElementById("toggleTimer");

    const recordsBody = document.getElementById("recordsBody");
    const recordCount = document.getElementById("recordCount");

    // Estado físico del carrito
    let mass = 10;
    let friction = 0.4;
    let appliedForce = 0;
    let velocity = 0;
    let acceleration = 0;
    let distance = 0;

    let forceRemaining = 0;
    let elapsedTime = 0;
    let timerRunning = false;
    let running = true;
    let lastTime = 0;
    let animationId;

    let maxVelocity = 0;
    let maxAcceleration = 0;
    let wheelAngle = 0;
    let particles = [];
    let records = [];

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remaining = seconds % 60;

        return String(minutes).padStart(2, "0") + ":" +
            remaining.toFixed(2).padStart(5, "0");
    }

    function readSettings() {
        mass = Number(massInput.value);
        friction = Number(frictionInput.value);

        massOutput.textContent = mass + " kg";
        forceOutput.textContent = forceInput.value + " N";
        frictionOutput.textContent = friction.toFixed(2);
        massValue.textContent = mass + " kg";
    }

    massInput.addEventListener("input", readSettings);

    forceInput.addEventListener("input", () => {
        forceOutput.textContent = forceInput.value + " N";
    });

    frictionInput.addEventListener("input", readSettings);

    // Dibujo del laboratorio automotriz
    
    function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Compactar verticalmente el escenario
    ctx.save();
    ctx.scale(1, 0.8);

    // Fondo del laboratorio
    const gradient = ctx.createLinearGradient(0, 0, 0, 350);
    gradient.addColorStop(0, "#cce7f7");
    gradient.addColorStop(1, "#f4f7fb");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Edificios
    ctx.fillStyle = "#b8cad9";
    ctx.fillRect(0, 90, canvas.width, 110);

    for (let x = 30; x < canvas.width; x += 150) {
        ctx.fillStyle = "#8ca4b8";
        ctx.fillRect(x, 115, 65, 55);

        ctx.fillStyle = "#dcecf8";
        ctx.fillRect(x + 8, 123, 20, 18);
    }

    // Pista
    ctx.fillStyle = "#354354";
    ctx.fillRect(0, 200, canvas.width, 150);

    const offset = (distance * 30) % 100;

    ctx.fillStyle = "#ffffff";

    for (let x = -offset; x < canvas.width; x += 100) {
        ctx.fillRect(x, 270, 55, 5);
    }

    // Marcas de distancia
    ctx.fillStyle = "#cbd5e1";
    ctx.font = "12px Arial";

    for (let x = -offset; x < canvas.width; x += 100) {
        if (x >= 0) {
            ctx.fillText(
                Math.max(0, Math.floor((distance * 30 + x) / 30)) + " m",
                x + 5,
                335
            );
        }
    }

    const carX = 180;
    const carY = 220;

    // Partículas de aceleración
    particles.forEach(particle => {
        ctx.globalAlpha = particle.life;
        ctx.fillStyle = "#ffcc33";

        ctx.beginPath();
        ctx.arc(
            particle.x,
            particle.y,
            particle.size,
            0,
            Math.PI * 2
        );
        ctx.fill();
    });

    ctx.globalAlpha = 1;

    // Sombra del carrito
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.beginPath();
    ctx.ellipse(carX + 48, 283, 52, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Carrocería
    ctx.fillStyle = "#dc3545";
    ctx.fillRect(carX, carY + 20, 100, 35);

    // Parte frontal
    ctx.fillStyle = "#a91f30";
    ctx.fillRect(carX + 88, carY + 28, 12, 20);

    // Cabina
    ctx.fillStyle = "#a91f30";
    ctx.beginPath();
    ctx.moveTo(carX + 20, carY + 20);
    ctx.lineTo(carX + 35, carY);
    ctx.lineTo(carX + 75, carY);
    ctx.lineTo(carX + 90, carY + 20);
    ctx.closePath();
    ctx.fill();

    // Ventanas
    ctx.fillStyle = "#bde5f5";
    ctx.fillRect(carX + 40, carY + 5, 30, 13);

    // Luces delanteras
    ctx.fillStyle = "#fff3a3";
    ctx.fillRect(carX + 96, carY + 27, 5, 8);

    // Ruedas animadas
    [carX + 22, carX + 80].forEach(wheelX => {

        ctx.save();

        ctx.translate(wheelX, carY + 57);
        ctx.rotate(wheelAngle);

        ctx.fillStyle = "#171b22";
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#9aa9b7";
        ctx.lineWidth = 3;

        ctx.beginPath();
        ctx.moveTo(-9, 0);
        ctx.lineTo(9, 0);
        ctx.moveTo(0, -9);
        ctx.lineTo(0, 9);
        ctx.stroke();

        ctx.fillStyle = "#cbd5e1";
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });

    // Masa
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px Arial";
    ctx.fillText(mass + " kg", carX + 35, carY + 42);

    // Flecha de fuerza
    if (appliedForce > 0) {

        const pulse = 4 + Math.sin(Date.now() / 100) * 3;

        ctx.strokeStyle = "#ffcc33";
        ctx.fillStyle = "#ffcc33";
        ctx.lineWidth = 4 + pulse / 3;

        ctx.beginPath();
        ctx.moveTo(carX + 105, carY + 35);
        ctx.lineTo(carX + 155 + pulse, carY + 35);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(carX + 155 + pulse, carY + 35);
        ctx.lineTo(carX + 143 + pulse, carY + 25);
        ctx.lineTo(carX + 143 + pulse, carY + 45);
        ctx.closePath();
        ctx.fill();
    }

    // Velocímetro
    const gaugeX = 760;
    const gaugeY = 95;
    const gaugeRadius = 48;

    ctx.fillStyle = "#17283b";
    ctx.beginPath();
    ctx.arc(gaugeX, gaugeY, gaugeRadius + 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "#536a80";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(
        gaugeX,
        gaugeY,
        gaugeRadius,
        Math.PI,
        Math.PI * 2
    );
    ctx.stroke();

    const speedAngle = Math.PI +
        Math.min(Math.abs(velocity) / 30, 1) * Math.PI;

    ctx.strokeStyle = "#4bd5b2";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(
        gaugeX,
        gaugeY,
        gaugeRadius,
        Math.PI,
        speedAngle
    );
    ctx.stroke();

    // Aguja
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(gaugeX, gaugeY);
    ctx.lineTo(
        gaugeX + Math.cos(speedAngle) * 35,
        gaugeY + Math.sin(speedAngle) * 35
    );
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px Arial";
    ctx.textAlign = "center";
    ctx.fillText("VELOCIDAD", gaugeX, gaugeY + 18);
    ctx.fillText(Math.abs(velocity).toFixed(1) + " m/s", gaugeX, gaugeY + 34);
    ctx.textAlign = "left";

    // Título del laboratorio
    ctx.fillStyle = "#263b50";
    ctx.font = "bold 15px Arial";
    ctx.fillText("PISTA DE PRUEBAS NEWTON LAB", 25, 30);

    ctx.font = "13px Arial";
ctx.fillText("Distancia: " + distance.toFixed(2) + " m", 25, 52);

// Restaurar escala del escenario
ctx.restore();
}

function drawAccelerationChart() {

    const width = chartCanvas.width;
    const height = chartCanvas.height;

    const padding = {
        left: 65,
        right: 25,
        top: 25,
        bottom: 35
    };

    const graphWidth = width - padding.left - padding.right;
    const graphHeight = height - padding.top - padding.bottom;

    chartCtx.clearRect(0, 0, width, height);

    // Fondo
    chartCtx.fillStyle = "#101a2b";
    chartCtx.fillRect(0, 0, width, height);

    const values = accelerationHistory.map(point => point.value);

    const maxValue = Math.max(
        10,
        ...values.map(value => Math.abs(value))
    );

    const limit = Math.ceil(maxValue / 5) * 5;

    function getY(value) {
        return padding.top +
            ((limit - value) / (limit * 2)) * graphHeight;
    }

    // Cuadrícula horizontal
    chartCtx.strokeStyle = "#29394d";
    chartCtx.lineWidth = 1;
    chartCtx.fillStyle = "#aab9ca";
    chartCtx.font = "12px Arial";
    chartCtx.textAlign = "right";

    for (let i = 0; i <= 4; i++) {

        const value = limit - (i * limit / 2);
        const y = getY(value);

        chartCtx.beginPath();
        chartCtx.moveTo(padding.left, y);
        chartCtx.lineTo(width - padding.right, y);
        chartCtx.stroke();

        chartCtx.fillText(
            value.toFixed(0),
            padding.left - 10,
            y + 4
        );
    }

    // Línea de aceleración cero
    const zeroY = getY(0);

    chartCtx.strokeStyle = "#718096";
    chartCtx.setLineDash([6, 5]);

    chartCtx.beginPath();
    chartCtx.moveTo(padding.left, zeroY);
    chartCtx.lineTo(width - padding.right, zeroY);
    chartCtx.stroke();

    chartCtx.setLineDash([]);

    // Eje de tiempo
    chartCtx.textAlign = "center";
    chartCtx.fillStyle = "#aab9ca";

    chartCtx.fillText(
        graphTime.toFixed(1) + " s",
        width - padding.right - 25,
        height - 10
    );

    
// Dibujar aceleración con colores dinámicos
if (accelerationHistory.length > 1) {

    const firstTime = accelerationHistory[0].time;

    const lastTime = accelerationHistory[
        accelerationHistory.length - 1
    ].time;

    const timeRange = Math.max(lastTime - firstTime, 5);

    for (let i = 1; i < accelerationHistory.length; i++) {

        const previous = accelerationHistory[i - 1];
        const current = accelerationHistory[i];

        const x1 = padding.left +
            ((previous.time - firstTime) / timeRange) * graphWidth;

        const x2 = padding.left +
            ((current.time - firstTime) / timeRange) * graphWidth;

        const y1 = getY(previous.value);
        const y2 = getY(current.value);

        const average = (previous.value + current.value) / 2;

        chartCtx.beginPath();
        chartCtx.moveTo(x1, y1);
        chartCtx.lineTo(x2, y2);

        chartCtx.lineWidth = 3;

        chartCtx.strokeStyle =
            average > 0.01 ? "#4bd5b2" :
            average < -0.01 ? "#ff6b6b" :
            "#718096";

        chartCtx.stroke();
    }
}


    // Valor actual
    const currentColor = acceleration < 0
        ? "#ff6b6b"
        : "#4bd5b2";

    const currentLabel = document.getElementById("chartAcceleration");

    currentLabel.textContent =
        acceleration.toFixed(2) + " m/s²";

    currentLabel.style.color = currentColor;
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

    // Motor físico de la segunda ley
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

        appliedForce = forceRemaining > 0
            ? Number(forceInput.value)
            : 0;

        if (forceRemaining > 0 && dt > 0) {
            forceRemaining = Math.max(0, forceRemaining - dt);
        }

        // Fuerza de fricción cinética
        const normalForce = mass * 9.81;
        let frictionForce = 0;

        if (Math.abs(velocity) > 0.001) {
            frictionForce = -Math.sign(velocity) *
                friction * normalForce;
        } else if (Math.abs(appliedForce) <= friction * normalForce) {
            velocity = 0;
        } else {
            frictionForce = -Math.sign(appliedForce) *
                friction * normalForce;
        }

        // Segunda ley: F neta = masa × aceleración
        const netForce = appliedForce + frictionForce;

        acceleration = netForce / mass;

        const oldVelocity = velocity;

        if (dt > 0) {
            velocity += acceleration * dt;

            if (oldVelocity !== 0 &&
                Math.sign(velocity) !== Math.sign(oldVelocity) &&
                appliedForce === 0) {
                velocity = 0;
                acceleration = 0;
            }

            distance += Math.abs((oldVelocity + velocity) / 2) * dt;
        }

        if (velocity === 0 && appliedForce === 0) {
            acceleration = 0;
        }

        maxVelocity = Math.max(maxVelocity, Math.abs(velocity));
        // Actualizar historial del gráfico
if (dt > 0) {
    graphTime += dt;

    accelerationHistory.push({
        time: graphTime,
        value: acceleration
    });

    // Mantener los últimos 180 puntos
    if (accelerationHistory.length > 180) {
        accelerationHistory.shift();
    }
}
        maxAcceleration = Math.max(
    maxAcceleration,
    Math.abs(acceleration)
);

// Rotación de las ruedas
wheelAngle += velocity * dt / 0.35;

// Crear partículas cuando se aplica fuerza
if (appliedForce > 0 && Math.random() < 0.35) {
    particles.push({
        x: 180,
        y: 270 + Math.random() * 8,
        size: 2 + Math.random() * 3,
        life: 1
    });
}

// Animar partículas
particles.forEach(particle => {
    particle.x -= 2;
    particle.life -= 0.025;
});

particles = particles.filter(particle => particle.life > 0);

        maxAcceleration = Math.max(maxAcceleration, Math.abs(acceleration));

        velocityValue.textContent = Math.abs(velocity).toFixed(2) + " m/s";
        accelerationValue.textContent = acceleration.toFixed(2) + " m/s²";

        draw();
        drawAccelerationChart();

        animationId = requestAnimationFrame(update);
    }

    // Aplicar fuerza
    document.getElementById("applyForce")
        .addEventListener("click", () => {

            readSettings();

            if (Number(forceInput.value) <= 0) {
                message.textContent = "Selecciona una fuerza mayor que cero.";
                return;
            }

            forceRemaining = 0.8;
            timerRunning = true;

            toggleTimer.textContent = "PAUSAR CRONÓMETRO";

            message.textContent =
                "Fuerza aplicada. Observa cómo cambia la aceleración del carrito.";
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

            const record = {

                number: records.length + 1,

                time: elapsedTime,

                mass,

                force: Number(forceInput.value),
    
                friction,

                velocity: Math.abs(velocity),

                acceleration: acceleration,

                distance
            };

            records.push(record);
            renderRecords();

            message.textContent =
                "Ensayo " + record.number + " registrado correctamente.";
        });

    // Reiniciar experimento
    document.getElementById("resetSimulation")
        .addEventListener("click", () => {

            massInput.value = 10;
            forceInput.value = 100;
            frictionInput.value = 0.4;

            mass = 10;
            friction = 0.4;
            appliedForce = 0;
            velocity = 0;
            acceleration = 0;
            distance = 0;

            forceRemaining = 0;
            elapsedTime = 0;
            timerRunning = false;
            lastTime = 0;

            maxVelocity = 0;
            maxAcceleration = 0;
            accelerationHistory = [];
            graphTime = 0;

            drawAccelerationChart();
            wheelAngle = 0;
            particles = [];

            readSettings();

            velocityValue.textContent = "0.00 m/s";
            accelerationValue.textContent = "0.00 m/s²";
            stopwatch.textContent = "00:00.00";

            toggleTimer.textContent = "INICIAR CRONÓMETRO";

            message.textContent =
                "Experimento reiniciado. El historial se conserva.";

            draw();
        });

    // Exportar a Excel
    document.getElementById("exportRecords")
        .addEventListener("click", async () => {

            if (records.length === 0) {
                message.textContent =
                    "Primero debes registrar al menos un ensayo.";
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
                workbook.subject = "Segunda ley de Newton";
                workbook.title = "Bitácora segunda ley";

                const worksheet = workbook.addWorksheet("Segunda Ley", {
                    views: [{ state: "frozen", ySplit: 1 }]
                });

                worksheet.columns = [
                    { header: "Ensayo", key: "number", width: 12 },
                    { header: "Tiempo (s)", key: "time", width: 16 },
                    { header: "Masa (kg)", key: "mass", width: 16 },
                    { header: "Fuerza (N)", key: "force", width: 16 },
                    { header: "Fricción", key: "friction", width: 14 },
                    { header: "Velocidad máxima (m/s)", key: "velocity", width: 24 },
                    { header: "Aceleración máxima (m/s²)", key: "acceleration", width: 27 },
                    { header: "Distancia (m)", key: "distance", width: 18 }
                ];

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

                const header = worksheet.getRow(1);
                header.height = 32;

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

                ["B", "C", "D", "E", "F", "G", "H"].forEach(column => {
                    worksheet.getColumn(column).numFmt = "0.00";
                });

                worksheet.autoFilter = {
                    from: "A1",
                    to: "H" + (records.length + 1)
                };

                const buffer = await workbook.xlsx.writeBuffer();

                const blob = new Blob([buffer], {
                    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                });

                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");

                link.href = url;
                link.download = "NewtonLab_SegundaLey.xlsx";

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

    // Cierre del experimento
    document.getElementById("exitSimulation")
        .addEventListener("click", () => {
            running = false;
            cancelAnimationFrame(animationId);
        });

    readSettings();
    renderRecords();
    draw();

    animationId = requestAnimationFrame(update);
}
