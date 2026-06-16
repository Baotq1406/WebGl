const canvas = document.getElementById("c");
const gl = canvas.getContext("webgl");

if (!gl) {
    alert("WebGL is not supported");
}


function createShader(gl, type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    const success =
        gl.getShaderParameter(
            shader,
            gl.COMPILE_STATUS
        );

    if (success) {
        return shader;
    }

    console.error(gl.getShaderInfoLog(shader));

    gl.deleteShader(shader);
}


function createProgram(
    gl,
    vertexShader,
    fragmentShader
) {

    const program = gl.createProgram();

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    const success =
        gl.getProgramParameter(
            program,
            gl.LINK_STATUS
        );

    if (success) {
        return program;
    }

    console.error(
        gl.getProgramInfoLog(program)
    );

    gl.deleteProgram(program);
}


const vertexShaderSource =
    document.getElementById("vertex-shader-2d").text;

const fragmentShaderSource =
    document.getElementById("fragment-shader-2d").text;


const vertexShader =
    createShader(
        gl,
        gl.VERTEX_SHADER,
        vertexShaderSource
    );

const fragmentShader =
    createShader(
        gl,
        gl.FRAGMENT_SHADER,
        fragmentShaderSource
    );

const program =
    createProgram(
        gl,
        vertexShader,
        fragmentShader
    );

const positionBuffer =
    gl.createBuffer();

gl.bindBuffer(
    gl.ARRAY_BUFFER,
    positionBuffer
);

// Triangle vertices
const positions = [
     0.0,  0.5,
    -0.5, -0.5,
     0.5, -0.5
];

gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array(positions),
    gl.STATIC_DRAW
);


gl.viewport(
    0,
    0,
    canvas.width,
    canvas.height
);

gl.clearColor(
    0,
    0,
    0,
    1
);

gl.clear(gl.COLOR_BUFFER_BIT);

gl.useProgram(program);

const positionAttributeLocation =
    gl.getAttribLocation(
        program,
        "a_position"
    );

gl.enableVertexAttribArray(
    positionAttributeLocation
);

gl.bindBuffer(
    gl.ARRAY_BUFFER,
    positionBuffer
);

gl.vertexAttribPointer(
    positionAttributeLocation,
    2,          // x,y
    gl.FLOAT,
    false,
    0,
    0
);

gl.drawArrays(
    gl.TRIANGLES,
    0,
    3
);