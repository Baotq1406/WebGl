console.log("Hello WebGL!");

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

// Thiết lập chương trình GLSL
const program = webglUtils.createProgramFromScripts(
    gl,
    ["vertex-shader-2d", "fragment-shader-2d"]
);

// Tìm vị trí (location) mà dữ liệu đỉnh sẽ được truyền vào.
const positionAttributeLocation =
    gl.getAttribLocation(program, "a_position");

// Tìm vị trí của các uniform
const matrixLocation =
    gl.getUniformLocation(program, "u_matrix");

// Tạo một buffer.
const positionBuffer = gl.createBuffer();

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

    drawScene();

    // Setup a ui.
    webglLessonsUI.setupSlider("#x", { value: translation[0], slide: updatePosition(0), max: gl.canvas.width });
    webglLessonsUI.setupSlider("#y", { value: translation[1], slide: updatePosition(1), max: gl.canvas.height });
    webglLessonsUI.setupSlider("#angle", { slide: updateAngle, max: 360 });
    webglLessonsUI.setupSlider("#scaleX", { value: scale[0], slide: updateScale(0), min: -5, max: 5, step: 0.01, precision: 2 });
    webglLessonsUI.setupSlider("#scaleY", { value: scale[1], slide: updateScale(1), min: -5, max: 5, step: 0.01, precision: 2 });
}

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

// Vẽ khung cảnh.
function drawScene() {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // Cho WebGL biết cách chuyển đổi từ clip space sang pixel.
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Xóa canvas.
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Bảo WebGL sử dụng chương trình shader của chúng ta.
    gl.useProgram(program);

    // Bật attribute.
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Gắn buffer chứa vị trí đỉnh.
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Chỉ cho attribute biết cách lấy dữ liệu từ positionBuffer (ARRAY_BUFFER).
    const size = 2;          // Mỗi đỉnh gồm 2 thành phần (x, y)
    const type = gl.FLOAT;   // Dữ liệu là số thực 32-bit
    const normalize = false; // Không chuẩn hóa dữ liệu
    const stride = 0;        // 0 = tự động nhảy tới đỉnh tiếp theo
    const offset = 0;        // Bắt đầu từ đầu buffer

    gl.vertexAttribPointer(
        positionAttributeLocation,
        size,
        type,
        normalize,
        stride,
        offset
    );

    // Tính toán ma trận biến đổi.
    let matrix = m3.projection(
        gl.canvas.clientWidth,
        gl.canvas.clientHeight
    );

    matrix = m3.translate(
        matrix,
        translation[0],
        translation[1]
    );

    matrix = m3.rotate(
        matrix,
        angleInRadians
    );

    matrix = m3.scale(
        matrix,
        scale[0],
        scale[1]
    );

    // Gửi ma trận vào shader.
    gl.uniformMatrix3fv(
        matrixLocation,
        false,
        matrix
    );

    // Vẽ hình học.
    const primitiveType = gl.TRIANGLES;
    const drawOffset = 0; // Vị trí bắt đầu đọc dữ liệu đỉnh
    const count = 3;      // Số lượng đỉnh cần vẽ

    gl.drawArrays(
        primitiveType,
        drawOffset,
        count
    );
}

// Điền dữ liệu vào buffer bằng các giá trị xác định một tam giác.
// Lưu ý: dữ liệu sẽ được ghi vào bất kỳ buffer nào hiện đang
// được gắn (bind) với điểm liên kết ARRAY_BUFFER.
function setGeometry(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            0, -100,
            150, 125,
            -175, 100]),
        gl.STATIC_DRAW);
}

main();