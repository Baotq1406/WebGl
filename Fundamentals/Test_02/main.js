console.log("Hello WebGL!");

const canvas = document.getElementById("c");
const gl = canvas.getContext("webgl");

// Sử dụng các hàm tiện ích (boilerplate utils) để biên dịch shader
// và liên kết (link) chúng thành một chương trình shader (program)
const program = webglUtils.createProgramFromScripts(
    gl,
    ["vertex-shader-2d", "fragment-shader-2d"]
);

// Lấy vị trí (location) của attribute nơi dữ liệu đỉnh sẽ được truyền vào
const positionAttributeLocation = gl.getAttribLocation(
    program,
    "a_position"
);

// Lấy vị trí của các biến uniform
const resolutionUniformLocation = gl.getUniformLocation(
    program,
    "u_resolution"
);

const colorUniformLocation = gl.getUniformLocation(
    program,
    "u_color"
);

// Tạo một buffer để chứa ba điểm 2D
const positionBuffer = gl.createBuffer();

// Gắn (bind) buffer này vào ARRAY_BUFFER
// Có thể hình dung như:
// ARRAY_BUFFER = positionBuffer
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const positions = [
    10, 20,
    80, 20,
    10, 30,

    10, 30,
    80, 20,
    80, 30,
];

webglUtils.resizeCanvasToDisplaySize(gl.canvas);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// Xóa canvas
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);

gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(positions),
    gl.STATIC_DRAW
);

gl.useProgram(program);
gl.enableVertexAttribArray(positionAttributeLocation);

// Gắn (bind) buffer chứa dữ liệu đỉnh vào vị trí attribute
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const size = 2;          // 2 components per iteration
const type = gl.FLOAT;
const normalize = false; // don't normalize the data
const stride = 0;
const attributeOffset = 0;
gl.vertexAttribPointer(
    positionAttributeLocation,
    size,
    type,
    normalize,
    stride,
    attributeOffset
);

// set the resolution
gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);



// const primitiveType = gl.TRIANGLES;
// const offset = 0;
// const count = 6;
// gl.drawArrays(primitiveType, offset, count);

// Vẽ 50 hình chữ nhật với vị trí và màu sắc ngẫu nhiên
for (var ii = 0; ii < 50; ++ii) {

    // Thiết lập một hình chữ nhật ngẫu nhiên.
    // Hàm này sẽ ghi dữ liệu vào positionBuffer vì
    // đó là buffer cuối cùng được bind vào điểm
    // ARRAY_BUFFER.
    setRectangle(
        gl,
        randomInt(300),
        randomInt(300),
        randomInt(300),
        randomInt(300));

    // Thiết lập màu ngẫu nhiên.
    gl.uniform4f(
        colorUniformLocation,
        Math.random(),
        Math.random(),
        Math.random(),
        1);

    // Vẽ hình chữ nhật.
    const primitiveType = gl.TRIANGLES;
    const offset = 0;
    const count = 6;
    gl.drawArrays(primitiveType, offset, count);
}

function randomInt(range) {
    return Math.floor(Math.random() * range);
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
        gl.STATIC_DRAW);
}