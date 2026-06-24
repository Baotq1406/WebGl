console.log("Hello WebGL");

const canvas = document.querySelector("#canvas");
const gl = canvas.getContext("webgl");

const program = webglUtils.createProgramFromScripts(
    gl,
    ["vertex-shader-2d", "fragment-shader-2d"]
);

const positionAttributeLocation = gl.getAttribLocation(
    program,
    "a_position"
);

// Get the uniform 
const resolutionUniformLocation = gl.getUniformLocation(
    program,
    "u_resolution"
);

const colorUniformLocation = gl.getUniformLocation(
    program,
    "u_color"
);

const translationUniformLocation = gl.getUniformLocation(
    program,
    "u_translation"
);

// Create a buffer to store the position data
const positionBuffer = gl.createBuffer();

const translation = [0, 0];
const color = [Math.random(), Math.random(), Math.random(), 1];

function main() {
    if (!gl) {
        console.log("WebGL not supported");
        return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    setGeometry(gl);

    drawScene();
}

function updatePosition(index) {
    return function (event, ui) {
        translation[index] = ui.value;
        drawScene();
    }
}

function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.enableVertexAttribArray(positionAttributeLocation);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const size = 2;
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;

    gl.vertexAttribPointer(
        positionAttributeLocation,
        size,
        type,
        normalize,
        stride,
        offset
    );

    //set the resolution
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    //set the color
    gl.uniform4fv(colorUniformLocation, color);

    //set the translation
    gl.uniform2fv(translationUniformLocation, translation);

    const primitiveType = gl.TRIANGLES;
    const offset2 = 0;
    const count = 18;

    gl.drawArrays(primitiveType, offset2, count);
}

// Fill the buffer with the values that define a letter 'F'.
// function setGeometry(gl, x, y) {
//   var width = 100;
//   var height = 150;
//   var thickness = 30;
//   gl.bufferData(
//       gl.ARRAY_BUFFER,
//       new Float32Array([
//           // left column
//           x, y,
//           x + thickness, y,
//           x, y + height,
//           x, y + height,
//           x + thickness, y,
//           x + thickness, y + height,
 
//           // top rung
//           x + thickness, y,
//           x + width, y,
//           x + thickness, y + thickness,
//           x + thickness, y + thickness,
//           x + width, y,
//           x + width, y + thickness,
 
//           // middle rung
//           x + thickness, y + thickness * 2,
//           x + width * 2 / 3, y + thickness * 2,
//           x + thickness, y + thickness * 3,
//           x + thickness, y + thickness * 3,
//           x + width * 2 / 3, y + thickness * 2,
//           x + width * 2 / 3, y + thickness * 3,
//       ]),
//       gl.STATIC_DRAW);
// }

// Fill the buffer with the values that define a letter 'F'.
function setGeometry(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            // left column
            0, 0,
            30, 0,
            0, 150,
            0, 150,
            30, 0,
            30, 150,

            // top rung
            30, 0,
            100, 0,
            30, 30,
            30, 30,
            100, 0,
            100, 30,

            // middle rung
            30, 60,
            67, 60,
            30, 90,
            30, 90,
            67, 60,
            67, 90,
        ]),
        gl.STATIC_DRAW);
}

main(); 
