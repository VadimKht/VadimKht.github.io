export class Engine{
    /** @type {HTMLCanvasElement} */
    #canvas;

    /** @type {WebGL2RenderingContext} */
    #gl;

    shaderProgram;

    vertexBuffer;
    positionsBuffer;
    indexBuffer;
    textureBuffer;

    rectcount = 0;

    // objects data (read shaders/vertex "positions" uniform comment)
    uniformData = [];
    //  same as uniformData, but UI will be drawn in separate call, so basically data for UI.
    uniformUIData = [];

    // literal temporary texture - for now its just yellow checker.
    // edit: i dont know what it is now because yellow checker is gone
    tex;

    Scene = {
        GameObjects: []
    };

    verticesInScene = 0;

    cameraPosition = [0, 0];

    collisionPositions = [];

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
        this.shaderProgram = this.#gl.createProgram();

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

        this.#gl.attachShader(this.shaderProgram, verShader);
        this.#gl.attachShader(this.shaderProgram, fragShader);
        this.#gl.linkProgram(this.shaderProgram);
        if (!this.#gl.getProgramParameter(this.shaderProgram, this.#gl.LINK_STATUS)) {
            console.log("Error linking shader program:");
            console.log(this.#gl.getProgramInfoLog(this.shaderProgram));
        }
        this.#gl.useProgram(this.shaderProgram);

    }

    CheckCollision(obj1, obj2){
        const x1 = obj1[1][0];
        const y1 = obj1[1][1];
        const x2 = obj2[1][0];
        const y2 = obj2[1][1];

        if(obj1[2].shape == "circle" || obj2[2].shape == "circle")
        {
            const cathetusX = x2-x1;
            const cathetusY = y2-y1;
            const len = Math.sqrt(Math.pow(cathetusX,2)+Math.pow(cathetusY,2));
            // if distance is small return true
            if(len <= obj1[2].size/2 + obj2[2].size/2)
            {
                return true;
            } 
            return false;
        }
        // incorrect behaivor, to change later. the code may be better than actual circle & circle code above
        if(obj1[2].shape == "circle" || obj2[2].shape == "rectangle")
        {
            const distX = x2-x1;
            const distY = y2-y1;
            const distance = Math.sqrt((distX * distX) + (distY*distY));
            if(distance <= obj1[2].size)
            {
                return true;
            }
            return false;
        }
    }
    // makes texture itself and binds to texture buffer
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

    AddObject(name = "Object", position = [0,0], rotation = 0, scale = [1, 1], shape="circle", texindex = [0,0], texScale = 1,
    ){

        const obj = [...position, rotation, 
                    ...texindex, texScale, 
                    ...scale, 0.0];
        const coliderdata = {
            shape: shape,
            // size depending on X for no reason, subject to change
            size: scale[0],
            active: true
        }
        const MetaData = [name, obj, coliderdata];
        this.Scene.GameObjects.push(MetaData);

        this.uniformData.push(...obj);
        return this.Scene.GameObjects.length-1;
    }   
    AddObjectRaw(name = "Object", data
    ){
        if(data.length != 9){
            alert("addobject with data is not done right");
            return
        }
        const coliderdata = {
            shape: "circle",
            // size depending on X for no reason, subject to change
            size: data[6],
            active: true
        }
        const obj = [...data];
        const MetaData = [name, obj, coliderdata]
        this.Scene.GameObjects.push(MetaData);

        this.uniformData.push(...obj);
        return this.Scene.GameObjects.length-1;
    }
    FindObjects(name){
        let results = [];
        for(let i = 0; i < this.Scene.GameObjects.length; i++)
        {
            if(this.Scene.GameObjects[i][0] == name) results.push({Element: this.Scene.GameObjects[i], id: i});
        }
        return results; 
    }
    ChangeCurrentTexture(rawImageData, width, spritesize)
    {
        //??
        this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.tex);
        this.#gl.texImage2D(this.#gl.TEXTURE_2D, 0, this.#gl.RGBA, this.#gl.RGBA,this.#gl.UNSIGNED_BYTE,
            rawImageData);
        this.#gl.generateMipmap(this.#gl.TEXTURE_2D);
        this.#gl.uniform1f(this.normalizedSpriteSize, spritesize/width)
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
        this.uniformData.splice(id*9, 9);

    }
    // change object uniformData by index,by specifying id, its index, and data you want to fill
    ChangeData(id, index, data){
        this.uniformData[id*9+index] = data;
        this.Scene.GameObjects[id][1][index] = data;
    }
    // in case i ever want to do ChangeData from other script without changing 1 by one?
    // warning: must consider manually also changing this.Scene.Gameobjects
    GetIndexOfId(id, index){
        return id*9+index;
    }
    BindBuffers()
    {
        this.indexArrayData = [0, 1, 2, 
                               0, 4, 2
        ];
        this.#gl.bindBuffer(this.#gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.#gl.bufferData(
            this.#gl.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(this.indexArrayData),
            this.#gl.STATIC_DRAW
        );

        // set no null just in case
        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, null);
    }

    async Init(){
        await this.#InitShaders();
        this.CreateBuffers();
        this.posloc = this.#gl.getUniformLocation(this.shaderProgram, "positions");
        this.canvSizeloc = this.#gl.getUniformLocation(this.shaderProgram, "ratiomatrix");
        this.cameraPosLoc = this.#gl.getUniformLocation(this.shaderProgram, "cameraPosition");
        this.normalizedSpriteSize = this.#gl.getUniformLocation(this.shaderProgram, "spriteNormalized")

        /*[0.0, 0.0, 0.0,
                                          0.0, 0.0, 2.0,
                                          2,    2,   0,
                                        
                                        4.0, 0.0, 0.0,
                                        1.0, 2.0, 1.0,
                                        2.0, 2.0, 0]*/
        this.#gl.uniformMatrix3fv(this.posloc, false, this.uniformData);

        // ratio things are done for proper calculation with positive and negative w/h ratios
        const ratio = this.#canvas.width/this.#canvas.height;
        let matrix;
        if(ratio < 1) matrix = [1/ratio, 0.0, 0.0, 1.0];
        else matrix = [1.0, 0.0, 0.0, ratio];
        this.#gl.uniformMatrix2fv(this.canvSizeloc, false, matrix);
        this.#gl.uniform1f(this.normalizedSpriteSize, 1/3);
        this.#gl.uniform2fv(this.cameraPosLoc, this.cameraPosition);
    }
    Draw()
    {
        this.#gl.uniformMatrix3fv(this.posloc, false, this.uniformData);
        this.rectcount = this.Scene.GameObjects.length;
        //this.#gl.clearColor(0.0, 0.0, 0.0, 1.0);
        //this.#gl.clear(this.#gl.COLOR_BUFFER_BIT);

        //this.#gl.drawArrays(this.#gl.TRIANGLES, 0, 6);

        //this.#gl.drawArraysInstanced(this.#gl.TRIANGLES, 0, 6, this.rectcount);
        this.#gl.drawElementsInstanced(this.#gl.TRIANGLES, 6, this.#gl.UNSIGNED_SHORT, 0, this.rectcount);

        // todo: ui render.
        // should have font atlas for texture and switch texture before draw
        // alternativtly, you can change the array to see vertex shaders "positions" uniform data change.
        // defienition of these numbers is inside shaders/vertex directory (short: pos,rot,texdatasame,scale)
        this.#gl.uniformMatrix3fv(this.posloc, false, [2,2,0, 1,2,1, 1,1, 0]);
        this.#gl.drawElementsInstanced(this.#gl.TRIANGLES, 6, this.#gl.UNSIGNED_SHORT, 0, 1);
    }
    move_camera(vector2)
    {
        this.cameraPosition[0] += vector2.x;
        this.cameraPosition[1] += vector2.y;
        this.#gl.uniform2fv(this.cameraPosLoc, this.cameraPosition);
    }
}