// setup canvas va webgl
const canvas = document.getElementById("canvas");
const gl = canvas.getContext("webgl");
const ui = document.getElementById("ui");
const table = document.createElement("table");
const tbody = document.createElement("tbody");
table.id = "table";
tbody.id = "tbody";

// anh can xu ly
const image = new Image();

// tao chuong trinh shader tu cac script trong html
const program = webglUtils.createProgramFromScripts(
    gl,
    ["vertex-shader-2d", "fragment-shader-2d"]
);

// lay vi tri cac attribute va uniform tu shader
const positionAttributeLocation = gl.getAttribLocation(
    program,
    "a_position"
);

const texcoordAttributeLocation = gl.getAttribLocation(
    program,
    "a_texCoord"
);

const resolutionUniformLocation = gl.getUniformLocation(
    program,
    "u_resolution"
);

const textureSizeLocation = gl.getUniformLocation(
    program,
    "u_textureSize"
);

const kernelLocation = gl.getUniformLocation(
    program,
    "u_kernel[0]"
);

const kernelWeightLocation = gl.getUniformLocation(
    program,
    "u_kernelWeight"
);

const flipYLocation = gl.getUniformLocation(
    program,
    "u_flipY"
);

// dinh nghia cac bo loc (kernel) 3x3 cho convolution
const kernel = {
    // khong loc, giu nguyen anh goc
    normal: [
        0, 0, 0,
        0, 1, 0,
        0, 0, 0
    ],
    // lam mo Gaussian
    gaussianBlur: [
        0.045, 0.122, 0.045,
        0.122, 0.332, 0.122,
        0.045, 0.122, 0.045
    ],
    gaussianBlur2: [
        1, 2, 1,
        2, 4, 2,
        1, 2, 1
    ],
    gaussianBlur3: [
        0, 1, 0,
        1, 1, 1,
        0, 1, 0
    ],
    // lam net anh (unsharp masking)
    unsharpen: [
        -1, -1, -1,
        -1, 9, -1,
        -1, -1, -1
    ],
    sharpness: [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
    ],
    sharpen: [
        -1, -1, -1,
        -1, 16, -1,
        -1, -1, -1
    ],
    // phat hien bien (edge detection)
    edgeDetect: [
        -0.125, -0.125, -0.125,
        -0.125, 1, -0.125,
        -0.125, -0.125, -0.125
    ],
    edgeDetect2: [
        -1, -1, -1,
        -1, 8, -1,
        -1, -1, -1
    ],
    edgeDetect3: [
        -5, 0, 0,
        0, 0, 0,
        0, 0, 5
    ],
    edgeDetect4: [
        -1, -1, -1,
        0, 0, 0,
        1, 1, 1
    ],
    edgeDetect5: [
        -1, -1, -1,
        2, 2, 2,
        -1, -1, -1
    ],
    edgeDetect6: [
        -5, -5, -5,
        -5, 39, -5,
        -5, -5, -5
    ],
    // Sobel phat hien bien ngang
    sobelHorizontal: [
        1, 2, 1,
        0, 0, 0,
        -1, -2, -1
    ],
    // Sobel phat hien bien doc
    sobelVertical: [
        1, 0, -1,
        2, 0, -2,
        1, 0, -1
    ],
    // Prewitt phat hien bien ngang
    previtHorizontal: [
        1, 1, 1,
        0, 0, 0,
        -1, -1, -1
    ],
    // Prewitt phat hien bien doc
    previtVertical: [
        1, 0, -1,
        1, 0, -1,
        1, 0, -1
    ],
    // lam mo deu (box blur)
    boxBlur: [
        0.111, 0.111, 0.111,
        0.111, 0.111, 0.111,
        0.111, 0.111, 0.111
    ],
    // lam mo hinh tam giac
    triangleBlur: [
        0.0625, 0.125, 0.0625,
        0.125, 0.25, 0.125,
        0.0625, 0.125, 0.0625
    ],
    // tao hieu ung noi (emboss)
    emboss: [
        -2, -1, 0,
        -1, 1, 1,
        0, 1, 2
    ]
}

// danh sach cac hieu ung duoc ap dung (co the sap xep bang keo tha)
const effects = [
    { name: "gaussianBlur3", on: true },
    { name: "gaussianBlur3", on: true },
    { name: "gaussianBlur3", on: true },
    { name: "sharpness", },
    { name: "sharpness", },
    { name: "sharpness", },
    { name: "sharpen", },
    { name: "sharpen", },
    { name: "sharpen", },
    { name: "unsharpen", },
    { name: "unsharpen", },
    { name: "unsharpen", },
    { name: "emboss", on: true },
    { name: "edgeDetect", },
    { name: "edgeDetect", },
    { name: "edgeDetect3", },
    { name: "edgeDetect3", },
];

// buffer cho vi tri dinh va toa do texture
const positionBuffer = gl.createBuffer();
const texcoordBuffer = gl.createBuffer();

// mang chua texture va framebuffer trung gian (ping-pong rendering)
const textures = [];
const framebuffers = [];

// texture chua anh goc
const originTexture = createAndSetupTexture(gl);

// khoi tao: tai anh va bat dau xu ly
function main() {
    if (!gl) {
        console.error("WebGL not supported");
        return;
    }

    image.src = "../Images/AnhTest.png";
    image.onload = function () {
        render(image);
    };
}

// thiet lap texture, framebuffer va tao giao dien danh sach hieu ung
function render(image) {
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    setRectangle(gl, 0, 0, image.width, image.height);

    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0,
    ]), gl.STATIC_DRAW);

    gl.bindTexture(gl.TEXTURE_2D, originTexture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        image
    );

    for (let i = 0; i < 2; i++) {
        const texture = createAndSetupTexture(gl);
        textures.push(texture);

        gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            image.width,
            image.height,
            0,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            null
        );

        const fbo = gl.createFramebuffer();
        framebuffers.push(fbo);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        gl.framebufferTexture2D(
            gl.FRAMEBUFFER,
            gl.COLOR_ATTACHMENT0,
            gl.TEXTURE_2D,
            texture,
            0
        );
    }

for (let i = 0; i < effects.length; i++) {
    const effect = effects[i];      // thêm dòng này

    const tr = document.createElement("tr");
    const td = document.createElement("td");

    const chk = document.createElement("input");
    chk.type = "checkbox";
    chk.value = effect.name;

    if (effect.on) {
        chk.checked = true;
    }

    chk.onchange = drawEffects;

    td.appendChild(chk);
    td.appendChild(document.createTextNode(" ≡ " + effect.name));

    tr.appendChild(td);
    tbody.appendChild(tr);
}

    table.appendChild(tbody);
    ui.appendChild(table);
    $(table).tableDnD({ onDrop: drawEffects });

    drawEffects();
}

// tao texture va thiet lap tham so mac dinh
function createAndSetupTexture(gl) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    return texture;
}

// tinh trong so cua kernel (tong cac phan tu), tranh chia cho 0
function computeKernelWeight(kernel) {
    var weight = kernel.reduce(function (prev, curr) {
        return prev + curr;
    });
    return weight <= 0 ? 1 : weight;
}

// ap dung tat ca cac hieu ung duoc chon len anh
function drawEffects(name) {
    webglUtils.resizeCanvasToDisplaySize(gl.canvas);

    // xoa canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // su dung chuong trinh shader
    gl.useProgram(program);

    // bat thuoc tinh vi tri dinh
    gl.enableVertexAttribArray(positionAttributeLocation);

    // gan buffer vi tri
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // mo ta cach doc du lieu tu buffer vi tri
    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(
        positionAttributeLocation, size, type, normalize, stride, offset);

    // bat thuoc tinh toa do texture
    gl.enableVertexAttribArray(texcoordAttributeLocation);

    // gan buffer toa do texture
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);

    // mo ta cach doc du lieu tu buffer toa do texture
    var size = 2;
    var type = gl.FLOAT;
    var normalize = false;
    var stride = 0;
    var offset = 0;
    gl.vertexAttribPointer(
        texcoordAttributeLocation, size, type, normalize, stride, offset);

    // truyen kich thuoc anh vao shader
    gl.uniform2f(textureSizeLocation, image.width, image.height);

    // bat dau tu anh goc
    gl.bindTexture(gl.TEXTURE_2D, originTexture);

    // khong lat anh khi ve vao texture (flipY = 1)
    gl.uniform1f(flipYLocation, 1);

    // duyet qua tung hieu ung duoc chon va ap dung bang ky thuat ping-pong
    var count = 0;
    for (var ii = 0; ii < tbody.rows.length; ++ii) {
        var checkbox = tbody.rows[ii].firstChild.firstChild;
        if (checkbox.checked) {
            // ve vao framebuffer trung gian
            setFramebuffer(framebuffers[count % 2], image.width, image.height);

            drawWithKernel(checkbox.value);

            // dung ket qua vua render lam dau vao cho lan tiep theo
            gl.bindTexture(gl.TEXTURE_2D, textures[count % 2]);

            ++count;
        }
    }

    // ve ket qua cuoi cung ra canvas (lat Y de dung chieu man hinh)
    gl.uniform1f(flipYLocation, -1);
    setFramebuffer(null, gl.canvas.width, gl.canvas.height);
    drawWithKernel("normal");
}
// chuyen doi sang framebuffer moi va cap nhat viewport
function setFramebuffer(fbo, width, height) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);

    // bao cho shader biet kich thuoc framebuffer
    gl.uniform2f(resolutionUniformLocation, width, height);

    // thiet lap viewport cho framebuffer
    gl.viewport(0, 0, width, height);
}

// ap dung mot bo loc (kernel) len texture hien tai
function drawWithKernel(name) {
    // truyen kernel va trong so vao shader
    gl.uniform1fv(kernelLocation, kernel[name]);
    gl.uniform1f(kernelWeightLocation, computeKernelWeight(kernel[name]));

    // ve hinh chu nhat (2 tam giac = 6 dinh)
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
}

// tao buffer chua 4 dinh cua hinh chu nhat (2 tam giac)
function setRectangle(gl, x, y, width, height) {
    var x1 = x;
    var x2 = x + width;
    var y1 = y;
    var y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,
    ]), gl.STATIC_DRAW);
}

// bat dau chuong trinh
main();