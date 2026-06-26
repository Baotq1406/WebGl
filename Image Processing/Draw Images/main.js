console.log("WebGL 2D Image Processing");

const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");

// Create a WebGL program from the vertex and fragment shaders
const program = webglUtils.createProgramFromScripts(
    gl,
    ["vertex-shader-2d", "fragment-shader-2d"]
);

// Get the attribute and uniform locations
const positionAttributeLocation = gl.getAttribLocation(
    program,
    "a_position"
);
const texcoordAttributeLocation = gl.getAttribLocation(
    program,
    "a_texcoord"
);
const resolutionUniformLocation = gl.getUniformLocation(
    program,
    "u_resolution"
);
const textureSizeUniformLocation = gl.getUniformLocation(
    program,
    "u_textureSize"
);

// Create buffers for position and texture coordinates
const positionBuffer = gl.createBuffer();
const texcoordBuffer = gl.createBuffer();

function main() {
    const image = new Image();

    image.src = "../images/AnhTest.png"; // Set the source of the image
    image.onload = function () {
        render(image);
    }
}

function render(image) {
    if (!gl) {
        console.error("WebGL not supported");
        return;
    }

    // Bind the position buffer and set the rectangle geometry
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    setRectangle(gl, 0, 0, image.width, image.height);

    // Bind the texture coordinate buffer and set the data
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    setTexcoords(gl);
    // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    //     0.0, 0.0,
    //     1.0, 0.0,
    //     0.0, 1.0,
    //     0.0, 1.0,
    //     1.0, 0.0,`
    //     1.0, 1.0,
    // ]), gl.STATIC_DRAW);

    // Create and bind a texture
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    // Set texture parameters
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    // Upload the image into the texture
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    // Enable the position attribute
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

    // Enable the texture coordinate attribute
    gl.enableVertexAttribArray(texcoordAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

    const texcoordSize = 2;          // 2 components per iteration
    const texcoordType = gl.FLOAT;  
    const texcoordNormalize = false;
    const texcoordStride = 0;
    const texcoordOffset = 0;

    gl.vertexAttribPointer(
        texcoordAttributeLocation,
        texcoordSize,
        texcoordType,
        texcoordNormalize,
        texcoordStride,
        texcoordOffset
    );

    // Set the resolution uniform
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    // Set the texture size uniform
    gl.uniform2f(textureSizeUniformLocation, image.width, image.height);

    // Draw the rectangle
    const primitiveType = gl.TRIANGLES;
    const offset2 = 0;
    const count = 6;
    gl.drawArrays(primitiveType, offset2, count);
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

function setTexcoords(gl) {
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([
            0.0, 0.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 1.0,
            1.0, 0.0,
            1.0, 1.0,
        ]),
        gl.STATIC_DRAW
    );
}

main();
