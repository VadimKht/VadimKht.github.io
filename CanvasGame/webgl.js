main();
let posX = 0;
let posY = 0;
let upMove = false;
let downMove = false;
let leftMove = false;
let rightMove = false;

window.onkeydown = function(e) { 
    if(e.keyCode == 37) leftMove = true;
    if(e.keyCode == 39) rightMove = true;
    if(e.keyCode == 38) upMove = true;
    if(e.keyCode == 40) downMove = true;
};
window.onkeyup = function(e) { 
    if(e.keyCode == 37) leftMove = false;
    if(e.keyCode == 39) rightMove = false;
    if(e.keyCode == 38) upMove = false;
    if(e.keyCode == 40) downMove = false;
};

//
// start here
//
function main() {
  const canvas = document.getElementById("glcanvas");
  alert(canvas);
  // Initialize the GL context
  const gl = canvas.getContext("webgl");
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it.",
    );
    return;
  }

  const vsSource = `
    attribute vec4 aVertexPosition;
    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    void main() {
      gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
    }
  `;

  const fsSource = `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
    }
  `;

  const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
  
  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
    },
    uniformLocations: {
      projectionMatrix: gl.getUniformLocation(shaderProgram, "uProjectionMatrix"),
      modelViewMatrix: gl.getUniformLocation(shaderProgram, "uModelViewMatrix"),
    },
  };

  const buffers = initBuffers(gl);

    // this is NOT a good way to draw frames. i haven't started learning webgl completely yet, all of the code here is just copy paste.
    setInterval(() => {
        if(upMove) posY += 0.4;
        if(downMove) posY -= 0.4;
        if(leftMove) posX -= 0.4;
        if(rightMove) posX += 0.4;
        drawScene(gl, programInfo, buffers, posX, posY);
    }, 330);
}

function initShaderProgram(gl, vsSource, fsSource) {
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert(
        `Unable to initialize the shader program: ${gl.getProgramInfoLog(
            shaderProgram,
        )}`,
        );
        return null;
    }

    return shaderProgram;
    }

    function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // See if it compiled successfully
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(
        `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`,
        );
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}
