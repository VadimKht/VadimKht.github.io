import { multiplyMatrices } from "./util.js";

window.addEventListener("load", startup, false);

let gl = null;
let glCanvas = null;

let model;
let view;
let projection;


// https://www.alanzucconi.com/wp-content/uploads/2016/02/2D_affine_transformation_matrix.svg_.png
// https://wikimedia.org/api/rest_v1/media/math/render/svg/8ea4e438d7439b8fa504fb53fd7fafd678007243
const _fov = 0.5;
const pageWidth = window.innerWidth-20;
const pageHeight = window.innerHeight-300;
const width = pageWidth;
const height = pageHeight;

const aspectRatio = width / height;
const left = -(_fov*aspectRatio);
const right = (_fov*aspectRatio);
const _top = _fov;
const bottom = -_fov;
const far = 100.0;
const near = 0.1
let angleX = 0;
let angleY = 0;
let angleZ = 0;

let cameraX = 0.0;
let cameraY = 0.0;
let cameraZ = 0.0;
let cameraXrot = 0.0;
let cameraYrot = 0.0;
let cameraZrot = 0.0;
let speed = 1;
const runSpeed = 2;
const normalSpeed = 1;
let isRunning = false

let movingLeft = false;
let movingRight = false;
let movingUp = false;
let movingDown = false;
let strafingLeft = false;
let strafingRight = false;
let xRottingDown = false;
let xRottingUp = false;
let gettingUp = false;
let gettingDown = false;

let fpsElement = document.getElementById("fps");
let inputMatrixElement = document.getElementById("textForModelMatrix");
let buttonMatrixElement = document.getElementById("buttonForModelMatrix");
let inputMatrixButtonElement = document.getElementById("submitTextMatrixButton");


let time;
let timeNext;
let deltaTime;
let avgFPS = 1;
let fpsArr = [0, 0];
let onePass = false;

let inputtext = `1,0,0,0,
                0,1,0,0,
                0,0,1,0,
                0,0,0,1`;
//ortho
/*let projection = [ 2/(right-left), 0.0, 0.0, -((right+left)/(right-left)),
                  0.0, 2/(_top-bottom), 0.0, -((_top+bottom)/(_top-bottom)),
                  0.0, 0.0, -2/(far-near), -((far+near)/(far-near)),
                  0.0, 0.0, 0.0, 1.0]*/

// perspective
/*let projection = [1.0/(aspectRatio * Math.tan(fov/2)), 0.0, 0.0, 0.0,
                  0.0, 1.0/(Math.tan(fov/2)), 0.0, 0.0,
                  0.0, 0.0, -((far+near)/(far-near)), -((2*far*near)/(far-near)),
                  0.0, 0.0, -1.0, 1.0];*/

// Vertex information

let vertexArray;
let vertexBuffer;

let colorBuffer;

let aColor;
let aVertexPosition;

let uView;
let uModel;
let uProjection;

let shaderProgram;

window.addEventListener("keydown", function (event) {
  if(event.key == "ArrowDown" || event.key == "s" || event.key == "S"){
    movingDown = true;
    return;
  }
  if(event.key == "ArrowUp" || event.key == "w" || event.key == "W")
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
  if(event.key == "1"){
    xRottingDown = true;
    return;
  }
  if(event.key == "3"){
    xRottingUp = true;
    return;
  }
  if(event.key == "Shift"){
    isRunning = true;
    return;
  }
  if(event.key == " "){
    gettingUp = true;
    return;
  }
  if(event.key == "c"){
    gettingDown = true;
    return;
  }
}, true);

window.addEventListener("keyup", function (event) {
  if(event.key == "ArrowDown" || event.key == "s" || event.key == "S"){
    movingDown = false;
    return;
  }
  if(event.key == "ArrowUp" || event.key == "w" || event.key == "W")
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
  if(event.key == "1"){
    xRottingDown = false;
    return;
  }
  if(event.key == "3"){
    xRottingUp = false;
    return;
  }
  if(event.key == "Shift"){
    isRunning = false;
    return;
  }
  if(event.key == " "){
    gettingUp = false;
    return;
  }
  if(event.key == "c"){
    gettingDown = false;
    return;
  }
}, true);


buttonMatrixElement.onclick = () =>{
  const text = inputMatrixElement;
  const elementWithMatrices = document.getElementsByClassName("matrices")[0];
  const textParsed = JSON.parse(`[${text.value}]`, (key,value) => eval(value));

  let l = 0;
  for(let i = 1; i < 8; i += 2 )
  {
      for(let k = 1; k < 8; k += 2)
      {
          if(textParsed[l] == undefined) textParsed[l] = 0;
          elementWithMatrices.childNodes[i].childNodes[k].value = textParsed[l];
          l += 1 ;
      }
  }
}

inputMatrixButtonElement.onclick = () => {
  const elementWithMatrices = document.getElementsByClassName("matrices")[0];
  let columnData = [];
  for(let i = 1; i < 8; i += 2)
  {
      for(let k = 1; k < 8; k += 2)
      {
          columnData.push(eval(elementWithMatrices.childNodes[i].childNodes[k].value));
      }
  }
  inputtext = JSON.stringify(columnData);
}


function startup(){
    /** @type {HTMLCanvasElement} */
    glCanvas = document.getElementById("canvas");
    glCanvas.width = pageWidth;
    glCanvas.height = pageHeight;
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
       ]);

    vertexArray = new Float32Array([
      // forward
      // top
      -0.5, 0.5, 0.5,
      0.5, 0.5, 0.5,
      0.5, -0.5, 0.5,
      //bottom
      -0.5, -0.5, 0.5,
      0.5, -0.5, 0.5,
      -0.5, 0.5, 0.5,

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
    const indices = new Uint16Array([
      // forward
      0, 1, 2,
      3, 2, 0,
      // left
      6, 0, 3,
      6, 10, 3,
      // right
      12, 1, 2,
      12, 16, 2,
      // back
      6, 12, 16,
      21, 10, 16,
      // up
      0, 6, 12,
      0, 1, 12,
      // down
      3, 10, 16,
      3, 2, 16
    ])

    const texture = new Float32Array([
      //front
      0, 0, 
      1, 0,
      1, 1, 
      
      0, 1,
      1, 1, 
      0, 0,

      //left
      0, 0, 
      1, 0,
      1, 1,

      0, 0,
      0, 1,
      1, 1,

      //right
      0, 0,
      1, 0,
      1, 1,
      // its not aligning  my calculations but i want cube to look OKAY today 
      0, 0,
      0, 1,
      1, 1,

      // back
      1, 0,
      0, 0,
      0, 1,
      
      0, 0,
      0, 1,
      1, 1,

      //up
      0, 1,
      0, 0,
      1, 0,
      
      0, 1,
      1, 1,
      1, 0,

      //down
      0, 1,
      0, 0,
      1, 0,

      0, 1,
      1, 1,
      1, 0
    ])
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

    colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texture, gl.STATIC_DRAW);

    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      indices,
      gl.STATIC_DRAW
    );

    let tex = gl.createTexture();
    let texturebmp = new Image();

    texturebmp.src = "texture.bmp";
    texturebmp.addEventListener("load", function(){
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA,gl.UNSIGNED_BYTE,
        texturebmp);
      gl.generateMipmap(gl.TEXTURE_2D);
    })

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    uModel = gl.getUniformLocation(shaderProgram, "model");
    uView = gl.getUniformLocation(shaderProgram, "view");
    uProjection = gl.getUniformLocation(shaderProgram, "projection");
    aVertexPosition = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    aColor = gl.getAttribLocation(shaderProgram, "a_texcoord");

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
      2,
      gl.FLOAT,
      false,
      0,
      0,
    );
    
    time = new Date().getTime();
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
    timeNext = new Date().getTime();
    deltaTime = (timeNext-time)/1000;
    time = timeNext;

    fpsArr.push(deltaTime);

    if(onePass){
      let total = 0;
      for(let i = 0; i < fpsArr.length; i++)
      {
        total += fpsArr[i];
      }

      avgFPS = 1/(total/fpsArr.length);
      onePass = false;
      fpsArr = [];
    }

    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    gl.clearColor(0.0, 1.0, 1.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
  
    gl.useProgram(shaderProgram);
    if(isRunning) speed = runSpeed;
    else speed = normalSpeed;
    speed *= deltaTime
    if(movingUp){
      cameraZ += speed * Math.cos(cameraYrot);
      cameraX += speed * Math.sin(cameraYrot);
    }
    if(movingDown){
      cameraZ += -speed * Math.cos(cameraYrot);
      cameraX -= speed * Math.sin(cameraYrot);
    }
    if(movingLeft){
      cameraYrot -= speed;
    } 
    if(movingRight) {
      cameraYrot += speed;
    }
    if(strafingRight){
      cameraX += speed * Math.cos(cameraYrot);
      cameraZ += -speed * Math.sin(cameraYrot);
    }
    if(strafingLeft){
      cameraX += -speed * Math.cos(cameraYrot);
      cameraZ += speed * Math.sin(cameraYrot);
    }
    if(xRottingUp){
      cameraXrot += speed;
      cameraYrot -= speed*Math.sin(cameraZrot);
    }
    if(xRottingDown){
      cameraXrot -= speed;
      cameraYrot += speed*Math.sin(cameraZrot);
    }
    if(gettingUp){
      cameraY += speed;
    }
    if(gettingDown){
      cameraY -= speed;
    }
    /*model = [Math.cos(angleY) * Math.cos(angleZ), Math.cos(angleY) * Math.sin(angleZ), -Math.sin(angleY), 0.0,
      (Math.sin(angleX) * Math.sin(angleY) * Math.cos(angleZ)) - (Math.cos(angleX) * Math.sin(angleZ)), (Math.sin(angleX) * Math.sin(angleY) * Math.sin(angleZ)) + (Math.cos(angleX) * Math.cos(angleZ)), Math.sin(angleX) * Math.cos(angleY), 0.0,
      (Math.cos(angleX) * Math.sin(angleY) * Math.cos(angleZ)) + (Math.sin(angleX) * Math.sin(angleZ)), (Math.cos(angleX) * Math.sin(angleY) * Math.sin(angleZ)) - (Math.sin(angleX) * Math.cos(angleZ)), Math.cos(angleX) * Math.cos(angleY), 0.0,
      0.0, 0.0, -2.0, 1.0];*/
    
    let iTP;

    inputtext ? iTP = JSON.parse(`[${inputtext}]`) : iTP = JSON.parse(`[1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]`);
    model = [
      iTP[0], iTP[1], iTP[2], iTP[3],
      iTP[4], iTP[5], iTP[6], iTP[7],
      iTP[8], iTP[9], iTP[10], iTP[2],
      iTP[12], iTP[13], iTP[14], iTP[15],
    ]

    // todo: change to quaternions - euler to quaternion and then use as angle
    const x1 = Math.cos(cameraYrot) * Math.cos(cameraZrot);
    const y1 = Math.cos(cameraYrot) * Math.sin(cameraZrot);
    const z1 = -Math.sin(cameraYrot)
    const x2 = (Math.sin(cameraXrot) * Math.sin(cameraYrot) * Math.cos(cameraZrot)) - (Math.cos(cameraXrot) * Math.sin(cameraZrot));
    const y2 = (Math.sin(cameraXrot) * Math.sin(cameraYrot) * Math.sin(cameraZrot)) + (Math.cos(cameraXrot) * Math.cos(cameraZrot));
    const z2 = Math.sin(cameraXrot) * Math.cos(cameraYrot);
    const x3 = (Math.cos(cameraXrot) * Math.sin(cameraYrot) * Math.cos(cameraZrot)) + (Math.sin(cameraXrot) * Math.sin(cameraZrot));
    const y3 = (Math.cos(cameraXrot) * Math.sin(cameraYrot) * Math.sin(cameraZrot)) - (Math.sin(cameraXrot) * Math.cos(cameraZrot));
    const z3 = Math.cos(cameraXrot) * Math.cos(cameraYrot);

    const xRotMtrx =[
      1.0, 0.0, 0.0, 0.0,
      0.0, Math.cos(cameraXrot), -Math.sin(cameraXrot), 0.0,
      0.0, Math.sin(cameraXrot), Math.cos(cameraXrot), 0.0,
      0.0, 0.0, 1.0, 1.0
    ];
    const yRotMtrx =[
      Math.cos(cameraYrot), 0.0, -Math.sin(cameraYrot), 0.0,
      0.0, 1.0, 0.0, 0.0,
      Math.sin(cameraYrot), 0.0, Math.cos(cameraYrot), 0.0,
      0.0, 0.0, 1.0, 1.0
    ];
    const zRotMtrx =[
      Math.cos(cameraZrot), Math.sin(cameraZrot), 0.0, 0.0,
      -Math.sin(cameraZrot), Math.cos(cameraZrot), 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      0.0, 0.0, -1.0, 1.0
    ];
    const rotationMtrx = [
      x1, y1, z1, 0.0,
      x2, y2, z2, 0.0,
      x3, y3, z3, 0.0,
      0.0, 0.0, 0.0, 1.0
    ];

    const transformMtrx = [
      1.0, 0.0, 0.0, 0.0,
      0.0, 1.0, 0.0, 0.0,
      0.0, 0.0, 1.0, 0.0,
      -cameraX, -cameraY, cameraZ, 1.0
    ];

    const zyrot = multiplyMatrices(zRotMtrx, yRotMtrx);;

    const yztfrot = multiplyMatrices(zyrot, transformMtrx);
    const ztfxrot = multiplyMatrices(xRotMtrx, yztfrot);

    //view = multiplyMatrices(rotationMtrx, transformMtrx);

    //GOOD LORD THIS TOOK ME A WHILE TO FIGURE OUT
    view = ztfxrot;

    projection = [ 2/(right-left), 0.0, 0.0, -((right+left)/(right-left)),
                      0.0, 2/(_top-bottom), 0.0, -((_top+bottom)/(_top-bottom)),
                      0.0, 0.0, -2/(far-near), -((far+near)/(far-near)),
                      0.0, 0.0, 0.0, 1.0];
    

    gl.uniformMatrix4fv(uModel, false, model);
    gl.uniformMatrix4fv(uView, false, view);
    gl.uniformMatrix4fv(uProjection,false, projection);
    
    gl.drawArrays(gl.TRIANGLES, 0, 36);
    //gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
    requestAnimationFrame((currentTime) => {
      animateScene();
    })

  }
  
document.getElementById("fwdbtn").addEventListener('click', () => {
  movingUp = !movingUp;
  movingDown = false;
})
document.getElementById("bckbtn").addEventListener('click', () => {
  movingDown = !movingDown;
  movingup = false;
})

document.getElementById("trnlftbtn").addEventListener('click', () => {
  movingLeft = !movingLeft;
  movingRight = false;
})
document.getElementById("trnrhtbtn").addEventListener('click', () => {
  movingRight = !movingRight;
  movingLeft = false;
})

document.getElementById("lkpbtn").addEventListener('click', () => {
  xRottingUp = !xRottingUp;
  xRottingDown = false;
})
document.getElementById("lkdbtn").addEventListener('click', () => {
  xRottingDown = !xRottingDown;
  xRottingUp = false;
})

document.getElementById("strflftbtn").addEventListener('click', () => {
  strafingLeft = !strafingLeft;
  straingRight = false;
})
document.getElementById("strfrhtbtn").addEventListener('click', () => {
  strafingRight = !strafingRight;
  strafingLeft = false;
})

setInterval(()=>{
  fpsElement.textContent = Math.round(avgFPS);
  onePass = true;
},200)
