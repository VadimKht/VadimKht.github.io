export class Engine{
    /** @type {HTMLCanvasElement} */
    #canvas;

    /** @type {WebGL2RenderingContext} */
    #gl;

    #shaderProgram;

    vertexBuffer;
    positionsBuffer;
    indexBuffer;
    textureBuffer;

    // buffer arrays for gl compacted into one array for optimization?
    ObjectData = [];
    indexArrayData = [0,1,2,0,4,2];

    // literal temporary texture - for now its just yellow checker.
    tex;

    Scene = {
        GameObjects: []
    };

    verticesInScene = 0;

    cameraPosition = [-1,0, 1,1];

    constructor(canvas){
        this.#canvas = canvas;
        this.#gl = this.#canvas.getContext("webgl2");
        if(this.#gl == false) alert("Unable to make webgl context");
    }
    async #GetFile(URL)
    {
        return await fetch(URL).then(res=>res.text());
    }

    async #InitShaders()
    {
        this.#shaderProgram = this.#gl.createProgram();

        const verShader = this.#gl.createShader(this.#gl.VERTEX_SHADER);
        const fragShader = this.#gl.createShader(this.#gl.FRAGMENT_SHADER);

        const currentPage = document.URL;
        const vertexShaderSource = await this.#GetFile(`${currentPage}/shaders/vertex`);
        const fragmentShaderSource = await this.#GetFile(`${currentPage}/shaders/fragment`);

        this.#gl.shaderSource(verShader, vertexShaderSource);
        this.#gl.compileShader(verShader);
        if(!this.#gl.getShaderParameter(verShader, this.#gl.COMPILE_STATUS)){
            console.log(`error in vertex shader:\n ${this.#gl.getShaderInfoLog(verShader)}`)
        }

        this.#gl.shaderSource(fragShader, fragmentShaderSource);
        this.#gl.compileShader(fragShader);
        if(!this.#gl.getShaderParameter(fragShader, this.#gl.COMPILE_STATUS)){
            console.log(`error in fragment shader:\n ${this.#gl.getShaderInfoLog(fragShader)}`)
        }

        this.#gl.attachShader(this.#shaderProgram, verShader);
        this.#gl.attachShader(this.#shaderProgram, fragShader);
        this.#gl.linkProgram(this.#shaderProgram);
        if (!this.#gl.getProgramParameter(this.#shaderProgram, this.#gl.LINK_STATUS)) {
            console.log("Error linking shader program:");
            console.log(this.#gl.getProgramInfoLog(this.#shaderProgram));
        }
        this.#gl.useProgram(this.#shaderProgram);

    }

    MakeTexture(){
        this.tex = this.#gl.createTexture();
        this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.tex);
        this.#gl.texParameteri ( this.#gl.TEXTURE_2D, this.#gl.TEXTURE_MAG_FILTER, this.#gl.NEAREST ) ;
        this.#gl.texImage2D(this.#gl.TEXTURE_2D, 0, this.#gl.RGBA, 3, 3, 0, this.#gl.RGBA,this.#gl.UNSIGNED_BYTE,
            new Uint8Array([255, 0, 0, 255,        0, 255, 0, 255,       0, 0, 255, 255,
                            255, 255, 0, 255,      0, 255, 255, 255,     255, 0, 255, 255,
                            128, 255, 0, 255,      255, 128, 0, 255,     0, 255, 128, 255
            ]));
            
        this.#gl.generateMipmap(this.#gl.TEXTURE_2D);
    }

    CreateBuffers()
    {
        // index buffer
        this.indexBuffer = this.#gl.createBuffer();

        this.MakeTexture();
        
        // reset
        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, null);
        //this.indexArrayData = [];
    }

    AddObject(name = "Object", position = [0,0], rotation = 0, scale = [0, 0], indexArray = [0,1,2]
    ){

        const obj = {name: name,
                    position: position, 
                    rotationEuler: rotation, 
                    indexArray: indexArray,
                    };
        this.Scene.GameObjects.push(obj);

        this.indexArrayData.push(...obj.indexArray);
        return this.Scene.GameObjects.length-1;
    }

    // simple way as optimized way was very complex and weird to do with my algorithm
    ResetArrays()
    {
        this.vertexArrayData = [];
        this.texArrayData = [];
        this.indexArrayData = [];
        for(let i = 0; i < this.Scene.GameObjects.length; i++)
        {
            this.vertexArrayData.push(...this.Scene.GameObjects[i].vertexArray);
            this.texArrayData.push(...this.Scene.GameObjects[i].texArray);
            this.indexArrayData.push(...this.Scene.GameObjects[i].indexArray);
        }
    }
    // reconsider algo
    RemoveObject(id){  
        if(id == null)
        {
            console.warn("RemoveObject has been called without id"); 
            return;
        } 
        if(isNaN(Number(id)))
        {
            console.error("RemoveObject has been called with incorrect ID");
            return;
        }
        const er = this.Scene.GameObjects.splice(id, 1);

        this.ResetArrays();
    }

    BindBuffers()
    {

        this.#gl.bindBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.#gl.bufferData(
            this.#gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(this.indexArrayData),
            this.#gl.STATIC_DRAW
        );
        
        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, null);
    }

    async Init(){
        await this.#InitShaders();
        this.CreateBuffers();
        this.posloc = this.#gl.getUniformLocation(this.#shaderProgram, "positions");
        this.canvSizeloc = this.#gl.getUniformLocation(this.#shaderProgram, "ratiomatrix");

        this.#gl.uniformMatrix3fv(this.posloc, false, [0.0, 0.0, 0.0,
                                          0.0, 0.0, 2.0,
                                          2,    2,   0,
                                        
                                        4.0, 0.0, 0.0,
                                        1.0, 2.0, 1.0,
                                        2.0, 2.0, 0]);
        const ratio = this.#canvas.width/this.#canvas.height;
        let matrix;
        if(ratio < 1) matrix = [1/ratio, 0.0, 0.0, 1.0];
        else matrix = [1.0, 0.0, 0.0, ratio];
        this.#gl.uniformMatrix2fv(this.canvSizeloc, false, matrix);


    }
    Draw()
    {
        //this.#gl.clearColor(0.0, 0.0, 0.0, 1.0);
        //this.#gl.clear(this.#gl.COLOR_BUFFER_BIT);

        //this.#gl.drawArrays(this.#gl.TRIANGLES, 0, 6);

        //this.#gl.drawArraysInstanced(this.#gl.LINES, 0, 6, 2);
        this.#gl.drawElementsInstanced(this.#gl.TRIANGLES, 6, this.#gl.UNSIGNED_SHORT, 0, 2)
    }
    move_camera(vector2)
    {
        this.cameraPosition[0] += vector2.x;
        this.cameraPosition[1] += vector2.y;
        this.#gl.uniformMatrix2fv(this.positionObject, false, this.cameraPosition);
        //this.#gl.uniform1fv(this.cameraRotationObject, [1.0]);
    }
}