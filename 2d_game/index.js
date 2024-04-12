/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
canvas.width = 500;
canvas.height = 500;
 /** @type {WebGLRenderingContext} */
const gl = canvas.getContext("webgl");

if(gl == false) alert("gl didnt work woh-woh");

const shaderProgram = gl.createProgram();

const vertexShaderSrc = `
attribute vec2 aVertexPosition;
attribute vec2 a_texcoord;

varying vec2 v_texcoord;

uniform vec2 uModel;
uniform vec2 uView;

void main() {
    vec2 position = aVertexPosition + uModel - uView;
    gl_Position = vec4(position, 0.0, 1.5);
    v_texcoord = a_texcoord;
}`
const fragmentShaderSrc = `
#ifdef GL_ES
precision highp float;
#endif
varying vec2 v_texcoord;

uniform sampler2D u_texture;

void main(){
    gl_FragColor = texture2D(u_texture, v_texcoord);
}
`
const verShader = gl.createShader(gl.VERTEX_SHADER);
const fragShader = gl.createShader(gl.FRAGMENT_SHADER);

gl.shaderSource(verShader, vertexShaderSrc);
gl.compileShader(verShader);
if(!gl.getShaderParameter(verShader, gl.COMPILE_STATUS)){
    console.log(`error in vertex shader:\n ${gl.getShaderInfoLog(verShader)}`)
}

gl.shaderSource(fragShader, fragmentShaderSrc);
gl.compileShader(fragShader);
if(!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)){
    console.log(`error in fragment shader:\n ${gl.getShaderInfoLog(fragShader)}`)
}

gl.attachShader(shaderProgram, verShader);
gl.attachShader(shaderProgram, fragShader);
gl.linkProgram(shaderProgram);
if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.log("Error linking shader program:");
    console.log(gl.getProgramInfoLog(shaderProgram));
  }
gl.useProgram(shaderProgram);
const vertexArray = new Float32Array([
    0.5, 0.5,
    -0.5, 0.5,
    -0.5, -0.5,
    
    0.5, -0.5,
    -0.5, -0.5,
    0.5, 0.5
])
// change 2s to 1s to stop texture from repeating itself
const texArray = new Float32Array([
    2, 0,
    0, 0,
    0, 2,

    2, 2,
    0, 2,
    2, 0
])

const vertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

const texBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
gl.bufferData(gl.ARRAY_BUFFER, texArray, gl.STATIC_DRAW);
gl.bindBuffer(gl.ARRAY_BUFFER, null);

const tex = gl.createTexture();
gl.bindTexture(gl.TEXTURE_2D, tex);
gl.texParameteri ( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST ) ;
gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA,gl.UNSIGNED_BYTE,
    new Uint8Array([255, 255, 0, 255]));
    
gl.generateMipmap(gl.TEXTURE_2D);

const textureData = new Image();
textureData.src = "texture.png";
textureData.addEventListener("load", function(){
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE,
      textureData);
    gl.generateMipmap(gl.TEXTURE_2D);
  });

const aVertexPos = gl.getAttribLocation(shaderProgram, "aVertexPosition");
const aTexPos = gl.getAttribLocation(shaderProgram, "a_texcoord");
const uModel = gl.getUniformLocation(shaderProgram, "uModel");
const uView = gl.getUniformLocation(shaderProgram, "uView");

gl.enableVertexAttribArray(aVertexPos);
gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
gl.vertexAttribPointer(
    aVertexPos,
    2,
    gl.FLOAT,
    false,
    0,
    0,
);

gl.enableVertexAttribArray(aTexPos);
gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer);
gl.vertexAttribPointer(
    aTexPos,
    2,
    gl.FLOAT,
    false,
    0,
    0,
);
let transform = [0.0, 0.0]
//gl.enable(gl.BLEND)
//gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
import { RegisterKeys } from "./register_keys.js";
let KeyPressesObj = {
    w: 0,
    a: 0,
    s: 0,
    d: 0
};

RegisterKeys(KeyPressesObj);
const speed = 5;

let time1 = new Date().getTime();
let time2;
function Draw(){
    time2 = new Date().getTime();
    const deltaTime = (time2-time1)/1000;
    time1 = time2;
    // render+
    gl.clearColor(0.0, 0.5, 0.5, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);

    if(KeyPressesObj.w == 1 && transform[1] <= 1) transform[1] += speed * deltaTime;
    if(KeyPressesObj.s == 1 && transform[1] >= -1) transform[1] -= speed * deltaTime;
    if(KeyPressesObj.a == 1 && transform[0] >= -1) transform[0] -= speed * deltaTime;
    if(KeyPressesObj.d == 1 && transform[0] <= 1) transform[0] += speed * deltaTime;
    gl.uniform2fv(uModel, transform);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
    requestAnimationFrame(Draw);
}
Draw();