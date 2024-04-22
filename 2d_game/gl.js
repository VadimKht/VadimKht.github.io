export class MyGame{
    aVertexPos;
    aTexPos;
    uModel;
    uView;
    textureData;
    speed = 5;
    tex;
    constructor(canvas, gl, KeyPressesObj){
        this.canvas = canvas;
        this.gl = gl;
        this.time1 = new Date().getTime();
        this.time2 = 0;
        this.KeyPressesObj = KeyPressesObj;
        this.transform = [0.0, 0.0];
    }
    init(){
        const shaderProgram = this.gl.createProgram();

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
        const verShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        const fragShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

        this.gl.shaderSource(verShader, vertexShaderSrc);
        this.gl.compileShader(verShader);
        if(!this.gl.getShaderParameter(verShader, this.gl.COMPILE_STATUS)){
            console.log(`error in vertex shader:\n ${gl.getShaderInfoLog(verShader)}`)
        }

        this.gl.shaderSource(fragShader, fragmentShaderSrc);
        this.gl.compileShader(fragShader);
        if(!this.gl.getShaderParameter(fragShader, this.gl.COMPILE_STATUS)){
            console.log(`error in fragment shader:\n ${this.gl.getShaderInfoLog(fragShader)}`)
        }

        this.gl.attachShader(shaderProgram, verShader);
        this.gl.attachShader(shaderProgram, fragShader);
        this.gl.linkProgram(shaderProgram);
        if (!this.gl.getProgramParameter(shaderProgram, this.gl.LINK_STATUS)) {
            console.log("Error linking shader program:");
            console.log(gl.getProgramInfoLog(shaderProgram));
        }
        this.gl.useProgram(shaderProgram);
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
            1, 0,
            0, 0,
            0, 1,

            1, 1,
            0, 1,
            1, 0
        ])

        const vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexArray, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        const texBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, texArray, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this.tex = this.gl.createTexture();
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex);
        this.gl.texParameteri ( this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST ) ;
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA,this.gl.UNSIGNED_BYTE,
            new Uint8Array([255, 255, 0, 255]));
            
        this.gl.generateMipmap(this.gl.TEXTURE_2D);

        this.textureData = new Image();
        this.textureData.src = "texture.png";
        this.textureData.addEventListener("load", this.HandleEvent.bind(this));

        this.aVertexPos = this.gl.getAttribLocation(shaderProgram, "aVertexPosition");
        this.aTexPos = this.gl.getAttribLocation(shaderProgram, "a_texcoord");
        this.uModel = this.gl.getUniformLocation(shaderProgram, "uModel");
        this.uView = this.gl.getUniformLocation(shaderProgram, "uView");

        this.gl.enableVertexAttribArray(this.aVertexPos);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, vertexBuffer);
        this.gl.vertexAttribPointer(
            this.aVertexPos,
            2,
            this.gl.FLOAT,
            false,
            0,
            0,
        );

        this.gl.enableVertexAttribArray(this.aTexPos);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, texBuffer);
        this.gl.vertexAttribPointer(
            this.aTexPos,
            2,
            this.gl.FLOAT,
            false,
            0,
            0,
        );

        //gl.enable(gl.BLEND)
        //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
    Draw(){
        this.time2 = new Date().getTime();
        const deltaTime = (this.time2-this.time1)/1000;
        this.time1 = this.time2;
        // render+
        this.gl.clearColor(0.0, 0.5, 0.5, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.viewport(0, 0, canvas.width, canvas.height);
    
        if(this.KeyPressesObj.w == 1 && this.transform[1] <= 1) this.transform[1] += this.speed * deltaTime;
        if(this.KeyPressesObj.s == 1 && this.transform[1] >= -1) this.transform[1] -= this.speed * deltaTime;
        if(this.KeyPressesObj.a == 1 && this.transform[0] >= -1) this.transform[0] -= this.speed * deltaTime;
        if(this.KeyPressesObj.d == 1 && this.transform[0] <= 1) this.transform[0] += this.speed * deltaTime;
        this.gl.uniform2fv(this.uModel, this.transform);
    
        this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
        requestAnimationFrame(this.Draw.bind(this));
    }
    HandleEvent(){
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA,this.gl.UNSIGNED_BYTE,
        this.textureData);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
    }
}