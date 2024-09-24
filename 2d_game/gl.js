export class MyGame{
    aVertexPos;
    aTexPos;
    uModel;
    uView;
    textureData;
    speed = 5;
    tex;
    ratio;

    // ObjList - [[id, vertamt, vertArr[], texArr[], isOccupied, position:{x,y}], ]
    /**
     * @param {[Number, Number, Array, Array, Boolean, {Number, Number}]} 
     */
    objectlist = []
    
    // deOccupiedList - [[id in objlist, length], [id in objlist, length] ]
    deoccupiedList = [];

    VerticesInScene = 0;
    vertexBuffer;
    vertexArray;

    // this way the objects id get alligned with array id
    lastIndex = -1;

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
        uniform float uRatio;

        void main() {
            vec2 position = aVertexPosition + uModel - uView;

            mat4 scale = mat4(0.5 * uRatio, 0.0,0.0,0.0, 0.0,0.5,0.0,0.0, 0.0,0.0,1.0,0.0, 0.0,0.0,0.0,1.0);
            gl_Position = scale * vec4(position, 0.0, 1.5);
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
            console.log(`error in vertex shader:\n ${this.gl.getShaderInfoLog(verShader)}`)
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

        const texArray = new Float32Array([
            1, 0,
            0, 0,
            0, 1,

            1, 1,
            0, 1,
            1, 0,
        ])

        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexArray, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        this.texBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texBuffer);
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
        this.uRatio = this.gl.getUniformLocation(shaderProgram, "uRatio");

        this.gl.enableVertexAttribArray(this.aVertexPos);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(
            this.aVertexPos,
            2,
            this.gl.FLOAT,
            false,
            0,
            0,
        );

        this.gl.enableVertexAttribArray(this.aTexPos);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texBuffer);
        this.gl.vertexAttribPointer(
            this.aTexPos,
            2,
            this.gl.FLOAT,
            false,
            0,
            0,
        );

        // removes transparent objects in texture
        //gl.enable(gl.BLEND)
        //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    }
    AddObject(x,y,title){
        // Object's identifier for DeleteObject that gets returned
        let id;
        let Pos = [
            0.5+x, 0.5+y,
            -0.5+x, 0.5+y,
            -0.5+x, -0.5+y,
            
            -0.5+x, -0.5+y,
            0.5+x, -0.5+y,
            0.5+x, 0.5+y
        ];
        let Tex = [
            1, 0,
            0, 0,
            0, 1,

            0, 1,
            1, 1,
            1, 0
        ];
        // it is 2 dimensional so i divide by 2 since each is x,y
        this.VerticesInScene += Pos.length/2;

        if(title == undefined) title = "Cube";

        // Creates a new object in objectlist and if there is deocupied id
        // (they get deoccupied in delete object function) make one in the
        // deocupied one. this way it won't be an infinitely big list with
        // creating and deleting objects
        if(this.deoccupiedList.length == 0){
            this.objectlist.push([this.lastIndex, // id
                                Pos.length/2,     // vertex amount
                                Pos,              
                                Tex,
                                true,             // is occupied
                                title,            // name
            ]);
            this.objectlist[this.lastIndex+1]["position"] = {x,y}
            this.lastIndex += 1;
            id = this.lastIndex;
        }
        else{
            const id_deoccupied = this.deoccupiedList[this.deoccupiedList.length-1][0];
            // vertex amount
            this.objectlist[id_deoccupied][1] = Pos.length/2;

            this.objectlist[id_deoccupied][2] = Pos;
            this.objectlist[id_deoccupied][3] = Tex;

            this.objectlist[id_deoccupied][4] = true;

            id = id_deoccupied;

            this.deoccupiedList.pop();
        }

        this.UpdateBuffers();
        
        return id;
    }

    // actual deletion, wrapped in function for different cases
    #del(_id){
        this.deoccupiedList.push([_id, this.objectlist[_id][1]])
        this.objectlist[_id][4] = false;
        this.VerticesInScene -= this.objectlist[_id][1];
        this.UpdateBuffers();
    }

    MoveObject(id, vector)
    {
        if(id > this.objectlist.length-1){
            console.log("Trying to move non existent object with id of ", id);
            return;
        }
        if(id < 0){
            console.log("The ID is below 0, this is not right");
            return;
        }
        this.objectlist[id][2][11] += vector.y;
        this.objectlist[id][2][9] += vector.y;
        this.objectlist[id][2][7] += vector.y;
        this.objectlist[id][2][5] += vector.y;
        this.objectlist[id][2][3] += vector.y;
        this.objectlist[id][2][1] += vector.y;

        this.objectlist[id][2][10] += vector.x;
        this.objectlist[id][2][8] += vector.x;
        this.objectlist[id][2][6] += vector.x;
        this.objectlist[id][2][4] += vector.x;
        this.objectlist[id][2][2] += vector.x;
        this.objectlist[id][2][0] += vector.x;

        this.objectlist[id].position.x += vector.x;
        this.objectlist[id].position.y += vector.y;
    }

    DeleteObject(id){
        if(id > this.objectlist.length-1){
            console.log("Trying to remove non existent object with id of ", id);
            return;
        }
        if(id < 0){
            console.log("The ID is below 0, this is not right");
            return;
        }
        if(isNaN(id)){
            console.log("The argument given is not ID. Deleting by name instead.");
            for(let i = 0; i < this.objectlist.length; i++){
                if(this.objectlist[i][5] != id) continue;
                this.#del(i);
                return;
            }
            return;
        }
        this.#del(id);
        
    }

    UpdateBuffers(){
        // buffers [index, tex]
        this.HugeChunkOfObjectsToRender = [[],[]];
        let objectCounter = 0;
        // per each object's ...
        for(let i = 0; i < this.objectlist.length; i++){
            // (if object is not occupied (deleted) do nothing for this object)
            if(this.objectlist[i][4] == false) continue;
            // ... each vertex and texture buffer, send it to huge chunk of objects to render 
            for(let k = 0; k < this.objectlist[i][2].length; k++){
                this.HugeChunkOfObjectsToRender[0][(objectCounter*this.objectlist[i][2].length)+k] = this.objectlist[i][2][k];
            }
            for(let k = 0; k < this.objectlist[i][3].length; k++){
                this.HugeChunkOfObjectsToRender[1][(objectCounter*this.objectlist[i][3].length)+k] = this.objectlist[i][3][k];
            }
            objectCounter += 1;
        };

        /*const vertexArray = new Float32Array(this.HugeChunkOfObjectsToRender[0]);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexArray, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        const texArray = new Float32Array(this.HugeChunkOfObjectsToRender[1]);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, texArray, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);*/
    }

    BindBufferz(){
        const vertexArray = new Float32Array(this.HugeChunkOfObjectsToRender[0]);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, vertexArray, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);

        const texArray = new Float32Array(this.HugeChunkOfObjectsToRender[1]);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.texBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, texArray, this.gl.STATIC_DRAW);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }
    #CameraControlsCheck(deltaTime){
        if(this.KeyPressesObj.w == 1) this.transform[1] -= this.speed * deltaTime;
        if(this.KeyPressesObj.s == 1) this.transform[1] += this.speed * deltaTime;
        if(this.KeyPressesObj.a == 1) this.transform[0] += this.speed * deltaTime;
        if(this.KeyPressesObj.d == 1) this.transform[0] -= this.speed * deltaTime;
    }
    Draw(){
        this.time2 = new Date().getTime();
        const deltaTime = (this.time2-this.time1)/1000;
        this.time1 = this.time2;
        this.gl.clearColor(0.0, 0.5, 0.5, 1);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.viewport(0, 0, canvas.width, canvas.height);
        this.Update();
        // input for camera
        this.#CameraControlsCheck(deltaTime);

        this.gl.uniform2fv(this.uModel, this.transform);
        this.gl.uniform1f(this.uRatio, new Float32Array([this.ratio]));
    
        this.gl.drawArrays(this.gl.TRIANGLES, 0, this.VerticesInScene);
        requestAnimationFrame(this.Draw.bind(this));
    }
    Update(){

    }
    HandleEvent(){
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.tex);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA,this.gl.UNSIGNED_BYTE,
        this.textureData);
        this.gl.generateMipmap(this.gl.TEXTURE_2D);
    }
}