

window.addEventListener("load", startup, false);

let gl = null;
let glCanvas = null;

// Aspect ratio and coordinate system
// details

let aspectRatio;

// https://www.alanzucconi.com/wp-content/uploads/2016/02/2D_affine_transformation_matrix.svg_.png
// https://wikimedia.org/api/rest_v1/media/math/render/svg/8ea4e438d7439b8fa504fb53fd7fafd678007243
const width = 1920;
const height = 1080;
const left = -1.0;
const right = 1.0;
const _top = 1.0;
const bottom = -1.0;
const far = 100.0;
const near = 0.0;
let angle = 1;
let view = [Math.cos(angle), 0.0, Math.sin(angle), 0.0,
            0.0, 1.0, 0.0, 0.0,
            -Math.sin(angle), 0.0, Math.cos(angle), 0.0,
            0.0, 0.0, 0.0, 1.0];
let model = [1.0, 0.0, 0.0, 0.0,
             0.0, 1.0, 0.0, 0.0,
             0.0, 0.0, 1.0, 0.0,
             0.0, 0.0, 0.0, 1.0];

//ortho
let projection = [ 2/(right-left), 0.0, 0.0, -((right+left)/(right-left)),
                  0.0, 2/(_top-bottom), 0.0, -((_top+bottom)/(_top-bottom)),
                  0.0, 0.0, -2/(far-near), -((far+near)/(far-near)),
                  0.0, 0.0, 0.0, 1.0]

console.log(projection);

// Vertex information

let vertexArray;
let vertexBuffer;
let vertexNumComponents;
let vertexCount;

let colorBuffer;

let aColor;
let aVertexPosition;

let uView;
let uModel;
let uProjection;

let shaderProgram;

function startup(){
    /** @type {HTMLCanvasElement} */
    glCanvas = document.getElementById("canvas");
    /** @type {WebGLRenderingContext} */
    gl = canvas.getContext("webgl");
    if(gl == false){
        alert("unable to make canvas context")
    }

    const shaderSet = [
        {
          type: gl.VERTEX_SHADER,
          id: "vertex-shader",
        },
        {
          type: gl.FRAGMENT_SHADER,
          id: "fragment-shader",
        },
    ];

    shaderProgram = buildShaderProgram(shaderSet);
    aspectRatio = glCanvas.width / glCanvas.height;

    let colorArray = new Float32Array(
      [0.5, 0.4, 0.7, 1.0,
       0.4, 0.5, 0.4, 1.0,
       0.2, 0.8, 0.5, 1.0]);

    vertexArray = new Float32Array([
        -0.5, 0.5, 0.0,
        0.5, 0.5, 0.0,
        0.5, -0.5, 0.0
    ]);

    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

    colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colorArray, gl.STATIC_DRAW);


    currentAngle = 0.0;

    animateScene();
}

function buildShaderProgram(shaderInfo) {
    const program = gl.createProgram();
  
    shaderInfo.forEach((desc) => {
      const shader = compileShader(desc.id, desc.type);
  
      if (shader) {
        gl.attachShader(program, shader);
      }
    });
  
    gl.linkProgram(program);
  
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.log("Error linking shader program:");
      console.log(gl.getProgramInfoLog(program));
    }
  
    return program;
}

function compileShader(id, type) {
    const code = document.getElementById(id).firstChild.nodeValue;
    const shader = gl.createShader(type);
  
    gl.shaderSource(shader, code);
    gl.compileShader(shader);
  
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.log(
        `Error compiling ${
          type === gl.VERTEX_SHADER ? "vertex" : "fragment"
        } shader:`,
      );
      console.log(gl.getShaderInfoLog(shader));
    }
    return shader;
  }

  function animateScene() {
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    gl.clearColor(0.8, 0.9, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  
    gl.useProgram(shaderProgram);
  
    angle += 0.01;
    view = [Math.cos(angle), 0.0, Math.sin(angle), 0.0,
      0.0, 1.0, 0.0, 0.0,
      -Math.sin(angle), 0.0, Math.cos(angle), 0.0,
      0.0, 0.0, 0.0, 1.0];



    uModel = gl.getUniformLocation(shaderProgram, "model");
    uView = gl.getUniformLocation(shaderProgram, "view");
    uProjection = gl.getUniformLocation(shaderProgram, "projection");
    aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    aColor = gl.getAttribLocation(shaderProgram, "aColor");

    gl.uniformMatrix4fv(uModel, false, model);
    gl.uniformMatrix4fv(uView, false, view);
    gl.uniformMatrix4fv(uProjection,false, projection);

    gl.enableVertexAttribArray(aVertexPosition);
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.vertexAttribPointer(
      aVertexPosition,
      3,
      gl.FLOAT,
      false,
      0,
      0,
    );
    

    gl.enableVertexAttribArray(aColor);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(
      aColor,
      4,
      gl.FLOAT,
      false,
      0,
      0,
    );
  
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  
    requestAnimationFrame((currentTime) => {
      animateScene();
    });
  }
  