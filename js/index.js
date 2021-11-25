const canvas = document.getElementById("frame");
const cellSize = 50;

function draw(state) {
    const context = canvas.getContext("2d");
    
    context.strokeStyle = "black";
    context.lineWidth = 1;

    const width = state.internal.image().width();
    const height = state.internal.image().height();

    const cells = state.internal.image().cells();

    for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
        const index = ((y * width) + x) * 3
        const color = `rgb(${cells[index + 0]}, ${cells[index + 1]}, ${cells[index + 2]})`
        context.fillStyle = color;
        context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
    }}

    for (let x = 0; x <= width; x++) {
        context.beginPath();

        context.moveTo(x * cellSize + 0.5, 0);
        context.lineTo(x * cellSize + 0.5, height * cellSize);
        context.stroke();
    }

    for (let y = 0; y <= width; y++) {
        context.beginPath();

        context.moveTo(0, y * cellSize + 0.5);
        context.lineTo(width * cellSize + 0.5, y * cellSize);
        context.stroke();
    }
}

function drawToCanvas(state, event) {
    const rect = canvas.getBoundingClientRect();

    let x = event.clientX - rect.left;
    let y = event.clientY - rect.top;

    x = Math.floor(x / cellSize);
    y = Math.floor(y / cellSize);

    state.internal.brush(x, y, state.currentColor)

    draw(state);
}

function setupCanvas(state) {
    canvas.addEventListener('click', (event) => {
        drawToCanvas(state, event)
    })

    canvas.addEventListener("mousedown", (_event) => {
        state.dragging = true;
        state.internal.start_undo_block();
    });
    
    canvas.addEventListener("mouseup", (_event) => {
        state.dragging = false;
        state.internal.close_undo_block();
    });

    document.getElementById("undo").addEventListener("click", (_event) => {
         state.internal.undo();
         draw(state)
    });

    document.getElementById("redo").addEventListener("click", (_event) => {
         state.internal.redo();
         draw(state)
    })

    canvas.addEventListener("mousemove", (event) => {
        if (!state.dragging) return;

        drawToCanvas(state, event);
    });
    
    document.getElementById("color-picker").addEventListener("change", (event) => {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(event.target.value);
        
        state.currentColor = [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ]
    })
}

async function main() {
    const lib = await import("../pkg/index.js").catch(console.error);

    const internal = new lib.InternalState(10, 10)

    const state = {
        internal,
        currentColor: [200, 255, 200],
        dragging: false
    }

    setupCanvas(state);

    draw(state);
}

main()