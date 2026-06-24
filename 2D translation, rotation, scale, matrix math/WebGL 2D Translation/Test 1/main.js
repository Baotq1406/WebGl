console.log("Hello WebGL!");

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

// Thiết lập (tạo) chương trình GLSL từ Vertex Shader và Fragment Shader.
const program = webglUtils.createProgramFromScripts(
    gl,
    ["vertex-shader-2d", "fragment-shader-2d"]
);

// Tìm vị trí (location) mà dữ liệu đỉnh sẽ được truyền vào.
const positionLocation = gl.getAttribLocation(
    program,
    "a_position"
);

// Tìm vị trí của uniform.
const resolutionLocation = gl.getUniformLocation(
    program,
    "u_resolution"
);

const colorLocation = gl.getUniformLocation(
    program,
    "u_color"
);

// Tạo một buffer để lưu tọa độ các đỉnh.
const positionBuffer = gl.createBuffer();

const translation = [0, 0];
const width = 100;
const height = 30;
const color = [Math.random(), Math.random(), Math.random(), 1];

function main() {
    if (!gl) {
        console.error("WebGL not supported");
        return;
    }

    // Gắn (bind) buffer đó vào ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    drawScene();

    //setup a ui.
    webglLessonsUI.setupSlider("#x", { value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
    webglLessonsUI.setupSlider("#y", { value: translation[1], slide: updatePosition(1), max: gl.canvas.height });
}

function updatePosition(index) {
    return function(event, ui) {
        translation[index] = ui.value;
        drawScene();
    };
}

function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionLocation);

    // Bind the position buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // set a rectangle 
    setRectangle(gl, translation[0], translation[1], width, height);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    const size = 2;          // 2 components per iteration
    const type = gl.FLOAT;
    const normalize = false; // don't normalize the data
    const stride = 0;
    const offset = 0;        // start at the beginning of the buffer

    gl.vertexAttribPointer(
        positionLocation,
        size,
        type,
        normalize,
        stride,
        offset
    );

    // set the resolution
    gl.uniform2f(resolutionLocation, gl.canvas.width, gl.canvas.height);

    // set the color
    gl.uniform4fv(colorLocation, color);

    // Draw the rectangle.
    const primitiveType = gl.TRIANGLES;
    const offsetDraw = 0;
    const count = 6;
    gl.drawArrays(primitiveType, offsetDraw, count);
}

function setRectangle(gl, x, y, width, height) {
    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;

    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2,
        ]),
        gl.STATIC_DRAW
    );
}

main();