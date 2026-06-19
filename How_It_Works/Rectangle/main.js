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

const colorLocation = gl.getAttribLocation(
    program,
    "a_color"
);

// Tìm vị trí của uniform.
const matrixLocation = gl.getUniformLocation(
    program,
    "u_matrix"
);

// Tạo một buffer để lưu tọa độ các đỉnh.
const positionBuffer = gl.createBuffer();

// Tạo một buffer để lưu màu sắc.
const colorBuffer = gl.createBuffer();

const translation = [200, 150];
let angleInRadians = 0;
const scale = [1, 1];

function main() {
    if (!gl) {
        console.error("WebGL not supported");
        return;
    }

    // Gắn (bind) buffer đó vào ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // Thiết lập dữ liệu hình học (Geometry).
    setGeometry(gl);

    // Gắn buffer màu sắc vào ARRAY_BUFFER
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // Thiết lập dữ liệu màu sắc.
    setColors(gl);

    drawScene();

    // Setup a ui.
    webglLessonsUI.setupSlider("#x", { value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
    webglLessonsUI.setupSlider("#y", { value: translation[1], slide: updatePosition(1), max: gl.canvas.height });
    webglLessonsUI.setupSlider("#angle", { slide: updateAngle, max: 360 });
    webglLessonsUI.setupSlider("#scaleX", { value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2 });
    webglLessonsUI.setupSlider("#scaleY", { value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2 });
};

function updatePosition(index) {
    return function (event, ui) {
        translation[index] = ui.value;
        drawScene();
    };
}

function updateAngle(event, ui) {
    var angleInDegrees = 360 - ui.value;
    angleInRadians = angleInDegrees * Math.PI / 180;
    drawScene();
}

function updateScale(index) {
    return function (event, ui) {
        scale[index] = ui.value;
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

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    const size = 2;          // 2 components per iteration
    const type = gl.FLOAT;   // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0;
    const offsetAttri1 = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
        positionLocation,
        size,
        type,
        normalize,
        stride,
        offsetAttri1
    );

    // Turn on the attribute
    gl.enableVertexAttribArray(colorLocation);

    // Bind the color buffer.
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

    // Tell the attribute how to get data out of colorBuffer (ARRAY_BUFFER)
    const size2 = 4;
    const type2 = gl.FLOAT;   // the data is 32bit floats
    const normalize2 = false;
    const stride2 = 0;
    const offsetAttri2 = 0;
    gl.vertexAttribPointer(
        colorLocation,
        size2,
        type2,
        normalize2,
        stride2,
        offsetAttri2
    );

    // compute the matrices
    let matrix = m3.projection(gl.canvas.clientWidth, gl.canvas.clientHeight);
    matrix = m3.translate(matrix, translation[0], translation[1]);
    matrix = m3.rotate(matrix, angleInRadians);
    matrix = m3.scale(matrix, scale[0], scale[1]);

    //set the matrix.
    gl.uniformMatrix3fv(matrixLocation, false, matrix);

    // Draw the geometry.
    const primitiveType = gl.TRIANGLES;
    const offset = 0;
    const count = 6;
    gl.drawArrays(primitiveType, offset, count);
}

function setGeometry(gl) {
  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
          -150, -100,
           150, -100,
          -150,  100,
           150, -100,
          -150,  100,
           150,  100]),
      gl.STATIC_DRAW);
}

function setColors(gl) {
  // Pick 2 random colors.
  const r1 = Math.random();
  const b1 = Math.random();
  const g1 = Math.random();
  const r2 = Math.random();
  const b2 = Math.random();
  const g2 = Math.random();

  gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(
        [ r1, b1, g1, 1,
          r1, b1, g1, 1,
          r1, b1, g1, 1,
          r2, b2, g2, 1,
          r2, b2, g2, 1,
          r2, b2, g2, 1]),
      gl.STATIC_DRAW);
}

main();

