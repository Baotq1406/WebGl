/*
WebGL chỉ quan tâm đến 2 thứ
1. Tọa độ trong Clip Space (Clip Space Coordinates) 
    Vertex Shader: cung cấp tọa độ trong Clip Space.
2. Màu sắc (Colors)
    Fragment Shader: cung cấp màu sắc cho mỗi pixel.
*/

const canvas = document.getElementById("c");
const gl = canvas.getContext("webgl");

//tự resize canvas khi thay đổi kích thước cửa sổ trình duyệt
// canvas.width = canvas.clientWidth;
// canvas.height = canvas.clientHeight;

// *** MÃ GIẢ (PSEUDO CODE) ***

/*
Vertex Shader không chạy một lần cho cả đối tượng 
mà 1 lần cho mỗi đỉnh (vertex). ()
VD:
3 đỉnh  → chạy 3 lần
100 đỉnh → chạy 100 lần
10000 đỉnh → chạy 10000 lần

*/

// var positionBuffer = [
//   0,   0,   0, 0,
//   0, 0.5,   0, 0,
//   0.7, 0,   0, 0,
// ];

//attribute được gọi là dữ liệu theo từng đỉnh (per-vertex data).
// var attributes = {};
// var gl_Position;

// drawArrays(..., offset, count) {

//   var stride = 4;
//   var size = 4;

//   for (var i = 0; i < count; ++i) {

//      // Sao chép 4 giá trị tiếp theo từ positionBuffer
//      // vào attribute a_position
//      const start = offset + i * stride;

//      attributes.a_position =
//          positionBuffer.slice(start, start + size);

//      runVertexShader();



//      doSomethingWith_gl_Position();
//   }
// }


if (!gl) {
    alert("WebGL is not supported");
}

// Tạo một shader mới, gắn mã GLSL vào shader đó và compile shader.
function createShader(gl, type, source) {

    //Bước 1: Tạo một shader mới, Lúc này GPU chỉ tạo ra một "vỏ" shader rỗng.
    const shader = gl.createShader(type);

    //Bước 2: Gắn mã GLSL vào shader 
    gl.shaderSource(shader, source);

    //Bước 3: Compile shader
    gl.compileShader(shader);

    //Buớc 4: Kiểm tra xem shader đã được compile thành công chưa
    const success = gl
        .getShaderParameter(shader, gl.COMPILE_STATUS);

    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));

    //Bước 5: Nếu shader không compile được, xóa shader đó đi giải phóng tài nguyên GPU.
    gl.deleteShader(shader);
}

const vertexShaderSource = document.querySelector("#vertex-shader-2d").text;
const fragmentShaderSource = document.querySelector("#fragment-shader-2d").text;

// Tạo vertex shader và fragment shader
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

// Tạo một chương trình shader bằng cách liên kết vertex shader và fragment shader lại với nhau.
function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    const success =
        gl.getProgramParameter(program, gl.LINK_STATUS);

    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

const program = createProgram(
    gl,
    vertexShader,
    fragmentShader
);

//Việc đầu tiên cần làm là tìm vị trí (location) 
// của attribute đó trong program vừa tạo
const positionAttributeLocation =
    gl.getAttribLocation(program, "a_position");

//Attribute nhận dữ liệu từ buffer, 
//vì vậy chúng ta cần tạo một buffer
const positionBuffer = gl.createBuffer();

//WebGL cho phép thao tác với nhiều tài nguyên thông qua các bind point toàn cục
//bind point giống như các biến toàn cục bên trong WebGL:
//1. Gắn (bind) một tài nguyên vào bind point.
//2. Các hàm tiếp theo sẽ thao tác với tài nguyên đó thông qua bind point.
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// 3 điểm 2D
const positions = [
  0, 0,
  0, 0.5,
  0.7, 0,
];

/*
positions là một mảng JavaScript thông thường.
Trong khi đó WebGL yêu cầu dữ liệu có kiểu xác định rõ ràng (strongly typed data).
new Float32Array(positions) 
sẽ tạo ra một mảng gồm các số thực 32-bit và sao chép dữ liệu từ positions.
*/

//gl.bufferData() sẽ sao chép dữ liệu đó lên GPU vào positionBuffer.
gl.bufferData(
    gl.ARRAY_BUFFER, //bind point
    new Float32Array(positions), 
    //là một gợi ý (hint) cho WebGL về cách dữ liệu sẽ được sử dụng.
    //WebGL có thể dùng thông tin này để tối ưu hiệu năng.
    gl.STATIC_DRAW //Dữ liệu sẽ được sử dụng để vẽ một hoặc vài lần, sau đó sẽ không thay đổi nữa.
);

//Để số lượng pixel bên trong canvas 
//khớp với kích thước hiển thị của nó, ta dùng hàm hỗ trợ
// muốn dùng có thư viện webgl-utils.js, thêm vào index.html
webglUtils.resizeCanvasToDisplaySize(gl.canvas);

gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

// Clear the canvas
gl.clearColor(0, 0, 0, 0);
gl.clear(gl.COLOR_BUFFER_BIT);

// Tell it to use our program (pair of shaders)
gl.useProgram(program);

//Cho phép WebGL đọc dữ liệu từ buffer
//để cung cấp cho a_position
gl.enableVertexAttribArray(positionAttributeLocation);

// Bind position buffer
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

// Chỉ cho attribute biết cách đọc dữ liệu từ positionBuffer

/*
vec4 là một vector gồm 4 số thực.
a_position = {
    x: 0,
    y: 0,
    z: 0,
    w: 0
};
size = 2 tức là chỉ lấy 2 thành phần đầu tiên (x, y) để tạo ra vec4.
z = 0
w = 1
*/

const size = 2;          // mỗi lần đọc lấy 2 thành phần
const type = gl.FLOAT;   // dữ liệu là số thực 32-bit
const normalize = false; // không chuẩn hóa dữ liệu
const stride = 0;        // tự động nhảy size * sizeof(type)
const attributeOffset = 0;        // bắt đầu từ đầu buffer

/*
Một chi tiết "ẩn" của gl.vertexAttribPointer
là nó sẽ liên kết (bind) ARRAY_BUFFER hiện tại với attribute đó.
Nói cách khác, sau lệnh trên, attribute này đã được liên kết với positionBuffer.
Điều đó có nghĩa là sau này chúng ta hoàn toàn có thể bind một buffer khác vào ARRAY_BUFFER, 
nhưng attribute vẫn tiếp tục sử dụng positionBuffer.
*/ 

gl.vertexAttribPointer(
    positionAttributeLocation, //attribute location
    size, //số lượng thành phần mỗi lần đọc
    type, //kiểu dữ liệu
    normalize, //có chuẩn hóa dữ liệu không
    stride, //khoảng cách giữa các lần đọc
    attributeOffset //bắt đầu đọc từ đâu
);

// Cứ mỗi 3 đỉnh liên tiếp sẽ tạo thành 1 tam giác độc lập.
const primitiveType = gl.TRIANGLES;
// offset = 0 tức là bắt đầu đọc từ đầu buffer
const drawOffset  = 0;
// count = 3 tức là đọc 3 đỉnh (3 * 2 = 6 giá trị trong buffer)
const count = 3;

gl.drawArrays(
    primitiveType,
    drawOffset,
    count
);