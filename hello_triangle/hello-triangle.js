function showError(errorText) {
    const errorBoxDiv = document.getElementById("error-box");
    const errorTextElement = document.createElement("p");
    errorTextElement.innerText = errorText;
    errorBoxDiv.appendChild(errorTextElement);
    console.error(errorText);
}

//showError("This is an error message.");    

function helloTriangle() {

    const canvas = document.getElementById("demo-canvas");

    if (!canvas) {
        showError("Canvas element not found");
        return;
    }

    const gl = canvas.getContext("webgl2");

    if (!gl) {

        const isWebGL1Supported = !!canvas.getContext("webgl");
        if (isWebGL1Supported) {
            showError("WebGL2 is not supported, but WebGL1 is supported. Please use a WebGL2 compatible browser.");
        } else {
            showError("WebGL is not supported");
        }
        return;
    }

    // Thực ra có đến 3 bộ đệm :v. 
    // Bộ đệm 3 dùng cho một số hiệu ứng đồ hoạ.
    // gl.clear(gl.COLOR_BUFFER_BIT);
    // gl.clear(gl.DEPTH_BUFFER_BIT);
    // gl.clearColor(0.08, 0.08, 0.08, 1.0);
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    const triangleVertices = [
        0.0, 0.5, // đỉnh trên
        -0.5, -0.5, // đỉnh trái
        0.5, -0.5 // đỉnh phải
    ];
    
    // vì GPU sử dụng số thực 32-bit, 
    // trong khi JavaScript sử dụng số thực 64-bit, 
    // nên cần chuyển đổi sang Float32Array
    const triangleVerticesBuffer = new Float32Array(triangleVertices);

    // Buffer gọi là opaque handle
    const triangleGeoBuffer = gl.createBuffer();

    // đặt khe buffer trước, sau đó mới có thể giao tiếp với WebGL về dữ liệu cần đặt ở đó.
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, triangleVerticesBuffer, gl.STATIC_DRAW);

    const vertexShaderSourceCode = `#version 300 es
    precision mediump float;

    in vec2 vertexPosition;

    void main() {
        gl_Position = vec4(vertexPosition, 0.0, 1.0);
    }`;

    // Tạo shader và biên dịch cho vertex shader
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vertexShaderSourceCode);
    gl.compileShader(vertexShader);

    // Kiểm tra lỗi biên dịch shader
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        const errorMessage = gl.getShaderInfoLog(vertexShader);
        showError("Vertex shader compilation failed: " + errorMessage);
        return;
    }

    const fragmentShaderSourceCode = `#version 300 es
    precision mediump float;

    out vec4 outputColor;

    void main() {
        outputColor = vec4(0.293, 0.0, 0.51, 1.0); // màu tím
    }`;

    //tương tự như vertex shader
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fragmentShaderSourceCode);
    gl.compileShader(fragmentShader);

    // Kiểm tra lỗi biên dịch fragment shader
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        const errorMessage = gl.getShaderInfoLog(fragmentShader);
        showError("Fragment shader compilation failed: " + errorMessage);
        return;
    }

    const triangleShaderProgram = gl.createProgram();
    gl.attachShader(triangleShaderProgram, vertexShader);
    gl.attachShader(triangleShaderProgram, fragmentShader);
    // Liên kết chương trình shader, để đảm bảo tụi nó tương thích
    gl.linkProgram(triangleShaderProgram);

    // Kiểm tra lỗi liên kết chương trình shader
    if (!gl.getProgramParameter(triangleShaderProgram, gl.LINK_STATUS)) {
        const errorMessage = gl.getProgramInfoLog(triangleShaderProgram);
        showError("Shader program linking failed: " + errorMessage);
        return;
    }

    const vertexPositionAttributeLocation = gl.getAttribLocation(triangleShaderProgram, "vertexPosition");

    if (vertexPositionAttributeLocation < 0) {
        showError("Failed to get vertex position attribute location");
        return;
    }


    // 6 steps to draw a in WebGL:
    // Input assembler - how to read vertices from our GPU triangle buffer
    // Vertex shader - how to place those vertices in clip space
    // Primitive assembly - how to make triangles from those vertices
    // Rasterizer - which pixels are part of a triangle
    // Fragment shader - what color a pixel should be
    // Output merger - how to merge the shaded pixel fragment with the existing output image

    // but you can customize the pipeline by using different shaders, or even skipping some steps.


    // Output merger - how to merge the shaded pixel fragment with the existing output image
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.clearColor(0.08, 0.08, 0.08, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Rasterizer - which pixels are part of a triangle
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Set GPU program (vertex shader + fragment shader pair)
    gl.useProgram(triangleShaderProgram);
    gl.enableVertexAttribArray(vertexPositionAttributeLocation);
    // Input assembler - how to read vertices from our GPU triangle buffer
    // Lưu ý cụm này: vertex atrribute pointer call
    // Trước khi gọi gl.vertexAttribPointer, 
    // cần chỉ định ngay tại đó: "Đây là bộ đệm tôi muốn sử dụng"
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleGeoBuffer);
    gl.vertexAttribPointer(
        /* index: which attribute to use */
        vertexPositionAttributeLocation,
        /* size: how many components per attribute */
        2, 
        /* type: what is the data type stored in the GPU buffer for this attribute */
        gl.FLOAT,
        /* normalized: 
        determine how to convert ints to floats, if that's what you're doing 
        For example:
        Nếu false thì chuyển đổi các số thành các số thực gần nhất.
        Kiểu số 1 nguyên thành 1.0, số nguyên 17 thành 17.0.
        Nếu true thì nó sẽ chuẩn hoá phạm vi số thực từ -1.0 đến 1.0,
        Kiểu nếu bạn có một byte số nguyên có dấu nằm trong khoảng từ -127 đến 127,
        thì số nguyên -127 sẽ được chuẩn hoá thành -1.0, số nguyên 127 sẽ được chuẩn hoá thành 1.0.
        ví dụ số 63 nằm giữa 0 và 1, cụ thể là 63/127 = 0.496, gần bằng 0.5. 
        */
        false,
        /* stride: how many bytes to move forward in the buffer to find the same attribute for the next vertex */
        2 * Float32Array.BYTES_PER_ELEMENT, // mỗi vertex có 2 thành phần, mỗi thành phần là 4 byte
        /* offset: how many bytes should the input assembler skip into the buffer when reading attribute */
        0
    );


    // draw call (also configure primitive assembly)
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}

try {
    helloTriangle();
} catch (e) {
    showError(e);
}