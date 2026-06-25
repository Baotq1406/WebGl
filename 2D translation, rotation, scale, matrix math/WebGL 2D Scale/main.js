console.log("WebGL hello world");

const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

const program = webglUtils.createProgramFromScripts(
    gl,
    ["vertex-shader-2d", "fragment-shader-2d"]
);

const positionAttributeLocation = gl.getAttribLocation(
    program,
    "a_position"
);

// Get the uniform\
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

const rotationUniformLocation = gl.getUniformLocation(
    program,
    "u_rotation"
);

const scaleUniformLocation = gl.getUniformLocation(
    program,
    "u_scale"
);

// Create a buffer to store the position data
const positionBuffer = gl.createBuffer();

const translation = [250, 125];
const scale = [1, 1];
const rotation = [0, 1];
const color = [Math.random(), Math.random(), Math.random(), 1];

function main() {
    if (!gl) {
        console.log("WebGL not supported");
        return;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    setGeometry(gl);

    drawScene();

    setupUI();
}

function setupUI() {
    webglLessonsUI.setupSlider("#x", { value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
    webglLessonsUI.setupSlider("#y", { value: translation[1], slide: updatePosition(1), max: gl.canvas.height });
    webglLessonsUI.setupSlider("#angle", { value: 90, slide: updateRotation(), max: 360 });
    webglLessonsUI.setupSlider("#scaleX", { value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2 });
    webglLessonsUI.setupSlider("#scaleY", { value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2 });

}

function updatePosition(index) {
    return function (event, ui) {
        translation[index] = ui.value;
        drawScene();
    };
}

function updateScale(index) {
    return function (event, ui) {
        scale[index] = ui.value;
        drawScene();
    };
}

function updateRotation() {
    return function (event, ui) {
        const angleInDegrees = ui.value;
        const angleInRadians = angleInDegrees * Math.PI / 180;
        rotation[0] = Math.sin(angleInRadians);
        rotation[1] = Math.cos(angleInRadians);
        drawScene();
    };
}

function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    const size = 2;          // 2 components per iteration
    const type = gl.FLOAT;
    const normalize = false; // don't normalize the data
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

    // Set the resolution
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    // Set the color
    gl.uniform4fv(colorUniformLocation, color);

    // Set the translation
    gl.uniform2fv(translationUniformLocation, translation);

    // Set the rotation
    gl.uniform2fv(rotationUniformLocation, rotation);

    // Set the scale
    gl.uniform2fv(scaleUniformLocation, scale);

    const primitiveType = gl.TRIANGLES;
    const offset2 = 0;
    const count = 18;
    gl.drawArrays(primitiveType, offset2, count);
}

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