

window.addEventListener("load", startup, false);

let gl = null;
let glCanvas = null;

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
let angleX = 0;
let angleY = 0;
let angleZ = 0;

let cameraX = 0.0;
let cameraY = 0.0;
let cameraZ = 0.0;
let cameraXrot = 0.0;
let cameraYrot = 0.0;
let cameraZrot = 0.0;

let movingLeft = false;
let movingRight = false;
let movingUp = false;
let movingDown = false;
let strafingLeft = false;
let strafingRight = false;

//ortho
/*let projection = [ 2/(right-left), 0.0, 0.0, -((right+left)/(right-left)),
                  0.0, 2/(_top-bottom), 0.0, -((_top+bottom)/(_top-bottom)),
                  0.0, 0.0, -2/(far-near), -((far+near)/(far-near)),
                  0.0, 0.0, 0.0, 1.0]*/

const aspectRatio = 400 / 400;
const fov = 90;
// perspective
/*let projection = [1.0/(aspectRatio * Math.tan(fov/2)), 0.0, 0.0, 0.0,
                  0.0, 1.0/(Math.tan(fov/2)), 0.0, 0.0,
                  0.0, 0.0, -((far+near)/(far-near)), -((2*far*near)/(far-near)),
                  0.0, 0.0, -1.0, 1.0];*/

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

window.addEventListener("keydown", function (event) {
  if(event.key == "ArrowDown" || event.key == "w" || event.key == "W"){
    movingDown = true;
    return;
  }
  if(event.key == "ArrowUp" || event.key == "s" || event.key == "S")
  {
    movingUp = true;
    return;
  }
  if(event.key == "ArrowLeft" || event.key == "a" || event.key == "A")
  {
    movingLeft = true;
    return;
  }
  if(event.key == "ArrowRight" || event.key == "d" || event.key == "D"){
    movingRight = true;
    return;
  }
  if(event.key == "q" || event.key == "Q"){
    strafingLeft = true;
    return;
  }
  if(event.key == "e" || event.key == "E"){
    strafingRight = true;
    return;
  }
  // Cancel the default action to avoid it being handled twice
}, true);

window.addEventListener("keyup", function (event) {
  if(event.key == "ArrowDown" || event.key == "w" || event.key == "W"){
    movingDown = false;
    return;
  }
  if(event.key == "ArrowUp" || event.key == "s" || event.key == "S")
  {
    movingUp = false;
    return;
  }
  if(event.key == "ArrowLeft" || event.key == "a" || event.key == "A")
  {
    movingLeft = false;
    return;
  }
  if(event.key == "ArrowRight" || event.key == "d" || event.key == "D"){
    movingRight = false;
    return;
  }
  if(event.key == "q" || event.key == "Q"){
    strafingLeft = false;
    return;
  }
  if(event.key == "e" || event.key == "E"){
    strafingRight = false;
    return;
  }
}, true);

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

    let colorArray = new Float32Array(
      [0.5, 0.4, 0.7, 1.0,
       0.4, 0.5, 0.4, 1.0,
       0.2, 0.8, 0.5, 1.0,
       0.5, 0.4, 0.7, 1.0,
       0.4, 0.5, 0.4, 1.0,
       0.2, 0.8, 0.5, 1.0,
       0.5, 0.4, 0.7, 1.0,
       0.4, 0.5, 0.4, 1.0,
       0.2, 0.8, 0.5, 1.0,
       0.5, 0.4, 0.7, 1.0,
       0.4, 0.5, 0.4, 1.0,
       0.2, 0.8, 0.5, 1.0,
       0.5, 0.4, 0.7, 1.0,
       0.4, 0.5, 0.4, 1.0,
       0.2, 0.8, 0.5, 1.0,
       0.5, 0.4, 0.7, 1.0,
       0.4, 0.5, 0.4, 1.0,
       0.2, 0.8, 0.5, 1.0,
       0.5, 0.4, 0.7, 1.0,
       0.4, 0.5, 0.4, 1.0,
       0.2, 0.8, 0.5, 1.0,
       0.5, 0.4, 0.7, 1.0,
       0.4, 0.5, 0.4, 1.0,
       0.2, 0.8, 0.5, 1.0,
       0.5, 0.4, 0.7, 1.0,
       0.4, 0.5, 0.4, 1.0,
       0.2, 0.8, 0.5, 1.0,
       0.5, 0.4, 0.7, 1.0,
       0.4, 0.5, 0.4, 1.0,
       0.2, 0.8, 0.5, 1.0,
       0.5, 0.4, 0.7, 1.0,
       0.4, 0.5, 0.4, 1.0,
       0.2, 0.8, 0.5, 1.0,
       0.5, 0.4, 0.7, 1.0,
       0.4, 0.5, 0.4, 1.0,
       0.2, 0.8, 0.5, 1.0,
       0.5, 0.4, 0.7, 1.0,
       0.4, 0.5, 0.4, 1.0,
       0.2, 0.8, 0.5, 1.0,
       0.5, 0.4, 0.7, 1.0,
       0.4, 0.5, 0.4, 1.0,
       0.2, 0.8, 0.5, 1.0,
       0.5, 0.4, 0.7, 1.0,
       0.4, 0.5, 0.4, 1.0,
       0.2, 0.8, 0.5, 1.0,
       0.5, 0.4, 0.7, 1.0,
       0.4, 0.5, 0.4, 1.0,
       0.2, 0.8, 0.5, 1.0,
       ]);

    vertexArray = new Float32Array([
        // forward
        // top
        -0.5, 0.5, 0.5,
        0.5, 0.5, 0.5,
        0.5, -0.5, 0.5,
        //bottom
        -0.5, 0.5, 0.5,
        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,

        // left
        // top
        -0.5, 0.5, -0.5,
        -0.5, 0.5, 0.5,
        -0.5, -0.5, 0.5,
        // bottom
        -0.5, 0.5, -0.5,
        -0.5, -0.5, -0.5,
        -0.5, -0.5, 0.5,

        // right
        // top
        0.5, 0.5, -0.5,
        0.5, 0.5, 0.5,
        0.5, -0.5, 0.5,
        // bottom
        0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,
        0.5, -0.5, 0.5,

        // back
        // top
        -0.5, 0.5, -0.5,
        0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,
        //bottom
        -0.5, 0.5, -0.5,
        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,

      // up
      // idk
      -0.5, 0.5, 0.5,
      -0.5, 0.5, -0.5,
      0.5, 0.5, -0.5,

      -0.5, 0.5, 0.5,
      0.5, 0.5, 0.5,
      0.5, 0.5, -0.5,

      // down
      -0.5, -0.5, 0.5,
      -0.5, -0.5, -0.5,
      0.5, -0.5, -0.5,

      -0.5, -0.5, 0.5,
      0.5, -0.5, 0.5,
      0.5, -0.5, -0.5,

    ]);

    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

    colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, colorArray, gl.STATIC_DRAW);
    gl.enable(gl.DEPTH_TEST);

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

    const speed = 0.03;
    if(movingUp) cameraZ += speed;
    if(movingDown) cameraZ -= speed;
    if(movingLeft) cameraYrot -= speed;
    if(movingRight) cameraYrot += speed;
    if(strafingLeft) cameraX -= speed*1.5;
    if(strafingRight) cameraX += speed*1.5;
    angleX = 0.5;

    model = [Math.cos(angleY) * Math.cos(angleZ), Math.cos(angleY) * Math.sin(angleZ), -Math.sin(angleY), 0.0,
      (Math.sin(angleX) * Math.sin(angleY) * Math.cos(angleZ)) - (Math.cos(angleX) * Math.sin(angleZ)), (Math.sin(angleX) * Math.sin(angleY) * Math.sin(angleZ)) + (Math.cos(angleX) * Math.cos(angleZ)), Math.sin(angleX) * Math.cos(angleY), 0.0,
      (Math.cos(angleX) * Math.sin(angleY) * Math.cos(angleZ)) + (Math.sin(angleX) * Math.sin(angleZ)), (Math.cos(angleX) * Math.sin(angleY) * Math.sin(angleZ)) - (Math.sin(angleX) * Math.cos(angleZ)), Math.cos(angleX) * Math.cos(angleY), 0.0,
      0.0, 0.0, -1.0, 1.0];
    view = [Math.cos(cameraYrot) * Math.cos(cameraZrot), Math.cos(cameraYrot) * Math.sin(cameraZrot), -Math.sin(cameraYrot), 0.0,
      (Math.sin(cameraXrot) * Math.sin(cameraYrot) * Math.cos(cameraZrot)) - (Math.cos(cameraXrot) * Math.sin(cameraZrot)), (Math.sin(cameraXrot) * Math.sin(cameraYrot) * Math.sin(cameraZrot)) + (Math.cos(cameraXrot) * Math.cos(cameraZrot)), Math.sin(cameraXrot) * Math.cos(cameraYrot), 0.0,
      (Math.cos(cameraXrot) * Math.sin(cameraYrot) * Math.cos(cameraZrot)) + (Math.sin(cameraXrot) * Math.sin(cameraZrot)), (Math.cos(cameraXrot) * Math.sin(cameraYrot) * Math.sin(cameraZrot)) - (Math.sin(cameraXrot) * Math.cos(cameraZrot)), Math.cos(cameraXrot) * Math.cos(cameraYrot), 0.0,
      -cameraX, -cameraY, cameraZ, 1.0];
    
    projection = [ 2/(right-left), 0.0, 0.0, -((right+left)/(right-left)),
                      0.0, 2/(_top-bottom), 0.0, -((_top+bottom)/(_top-bottom)),
                      0.0, 0.0, -2/(far-near), -((far+near)/(far-near)),
                      0.0, 0.0, 0.0, 1.0]


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
  
    gl.drawArrays(gl.TRIANGLES, 0, 36);
  
    requestAnimationFrame((currentTime) => {
      animateScene();
    });
  }
  