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

    atlasTextureBuffer
    atlasTexture;
    textTextures = [];

    rectcount = 0;

    // objects data (read shaders/vertex "positions" uniform comment)
    uniformData = [];
    //  same as uniformData, but UI will be drawn in separate call, so basically data for UI.
    uniformUIData = [];

    tex;

    Scene = {
        GameObjects: []
    };

    verticesInScene = 0;

    cameraPosition = [0, 0];

    collisionPositions = [];

    customframebuffer;

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
        this.textShaderProgram = this.#gl.createProgram();

        const verShader = this.#gl.createShader(this.#gl.VERTEX_SHADER);
        const verTextShader = this.#gl.createShader(this.#gl.VERTEX_SHADER);
        const fragShader = this.#gl.createShader(this.#gl.FRAGMENT_SHADER);

        const currentPage = document.URL;
        const vertexShaderSource = await this.#GetFile(`${currentPage}/shaders/vertex`);
        const vertexTextShaderSource = await this.#GetFile(`${currentPage}/shaders/texturevertex`);
        const fragmentShaderSource = await this.#GetFile(`${currentPage}/shaders/fragment`);

        this.#gl.shaderSource(verShader, vertexShaderSource);
        this.#gl.compileShader(verShader);
        if(!this.#gl.getShaderParameter(verShader, this.#gl.COMPILE_STATUS)){
            console.log(`error in vertex shader:\n ${this.#gl.getShaderInfoLog(verShader)}`)
        }

        this.#gl.shaderSource(verTextShader, vertexTextShaderSource);
        this.#gl.compileShader(verTextShader);
        if(!this.#gl.getShaderParameter(verTextShader, this.#gl.COMPILE_STATUS)){
            console.log(`error in vertex shader:\n ${this.#gl.getShaderInfoLog(verTextShader)}`)
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

        this.#gl.attachShader(this.textShaderProgram, verTextShader);
        this.#gl.attachShader(this.textShaderProgram, fragShader);
        this.#gl.linkProgram(this.textShaderProgram);
        if (!this.#gl.getProgramParameter(this.textShaderProgram, this.#gl.LINK_STATUS)) {
            console.log("Error linking shader program:");
            console.log(this.#gl.getProgramInfoLog(this.textShaderProgram));
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
        this.#gl.texImage2D(this.#gl.TEXTURE_2D, 0, this.#gl.RGBA,1024, 256, 0, this.#gl.RGBA,this.#gl.UNSIGNED_BYTE,
            null/*new Uint8Array([255, 0, 0, 255,        0, 255, 0, 255,       0, 0, 255, 255,
                            255, 255, 0, 255,      0, 255, 255, 255,     255, 0, 255, 255,
                            128, 255, 0, 255,      255, 128, 0, 255,     0, 255, 128, 255
            ])*/);
        this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_MIN_FILTER, this.#gl.LINEAR);
        this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_WRAP_S, this.#gl.CLAMP_TO_EDGE);
        this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_WRAP_T, this.#gl.CLAMP_TO_EDGE);
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
    textToIndex = new Map([
        ["A",[0,0]],
        ["B",[1,0]],
        ["C",[2,0]],
        ["D",[3,0]],
        ["E",[4,0]],
        ["F",[5,0]],
        ["G",[6,0]],
        ["H",[7,0]],
        ["I",[8,0]],
        ["J",[9,0]],
        ["K",[10,0]],
        ["L",[11,0]],
        ["M",[0,1]],
        ["N",[1,1]],
        ["O",[2,1]],
        ["P",[3,1]],
        ["Q",[4,1]],
        ["R",[5,1]],
        ["S",[6,1]],
        ["T",[7,1]],
        ["U",[8,1]],
        ["V",[9,1]],
        ["W",[10,1]],
        ["X",[11,1]],
        ["Y",[0,2]],
        ["Z",[1,2]],
        ["a",[2,2]],
        ["b",[3,2]],
        ["c",[4,2]],
        ["d",[5,2]],
        ["e",[6,2]],
        ["f",[7,2]],
        ["g",[8,2]],
        ["h",[9,2]],
        ["i",[10,2]],
        ["j",[11,2]],
        ["k",[0,3]],
        ["l",[1,3]],
        ["m",[2,3]],
        ["n",[3,3]],
        ["o",[4,3]],
        ["p",[5,3]],
        ["q",[6,3]],
        ["r",[7,3]],
        ["s",[8,3]],
        ["t",[9,3]],
        ["u",[10,3]],
        ["v",[11,3]],
        ["w",[0,4]],
        ["x",[1,4]],
        ["y",[2,4]],
        ["z",[3,4]],
        [".",[4,4]],
        ["!",[5,4]],
        ["?",[6,4]],
        ["#",[7,4]],
        ["$",[8,4]],
        ["%",[9,4]],
        ["^",[10,4]],
        ["&",[11,4]],
        [" ", [0,5]],
        ["\n","Down"]
    ])
    // temporarily just change current text letter
    // hardcoded size/4, 4 is ratio of texture to not stretch letters
    // QUESTION: why is singular letter more messed that string of letters?
    AddText(name = "TextObject", letter = "a", size = 1/6){
        if(letter.length == 1)
        {
            let texindex = this.textToIndex.get(letter);
            if(texindex == undefined) texindex = [11,11];

            this.textData = [0,0, 0, 
                        ...texindex, 1, 
                        size/4, size, 0];
            return;
        }
        else if(letter.length > 1)
        {
            this.textData = [];
            let x = -1+(1/6);
            let y = -0.8;
            for(let i = 0; i < letter.length; i++)
            {
                let curLetter = this.textToIndex.get(letter[i]);
                if(curLetter == undefined) curLetter = [11,11];
                // \n
                if(curLetter == "Down")
                {
                    x = -1+(1/6);
                    y += 0.4;
                    continue;
                }
                this.textData.push(...[x,y,0,
                                    ...curLetter,1,
                                    size/4,size,0
                ])
                x += 0.05;
            }
        }
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
        this.#gl.bindTexture(this.#gl.TEXTURE_2D, null);
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
        this.texposloc = this.#gl.getUniformLocation(this.textShaderProgram, "positions");
        this.canvSizeloc = this.#gl.getUniformLocation(this.shaderProgram, "ratiomatrix");
        this.cameraPosLoc = this.#gl.getUniformLocation(this.shaderProgram, "cameraPosition");
        this.normalizedSpriteSize = this.#gl.getUniformLocation(this.shaderProgram, "spriteNormalized");
        
        this.atlasTextureBuffer = this.#gl.createTexture();
        this.atlasTexture = await new Image();
        this.atlasTexture.onload = ()=>{
            this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.atlasTextureBuffer);
            this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_WRAP_S, this.#gl.CLAMP_TO_EDGE);
            this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_WRAP_T, this.#gl.CLAMP_TO_EDGE);
            this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_MIN_FILTER, this.#gl.LINEAR);
            this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_MAG_FILTER, this.#gl.LINEAR);
            this.#gl.texImage2D(this.#gl.TEXTURE_2D, 0, this.#gl.RGBA, this.#gl.RGBA, this.#gl.UNSIGNED_BYTE, this.atlasTexture);
            this.#gl.bindTexture(this.#gl.TEXTURE_2D, null);
        };
                
        this.atlasTexture.src = "AlphabetTex.png"


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
        this.#gl.uniform1f(this.normalizedSpriteSize, 1/12);
        this.#gl.uniform2fv(this.cameraPosLoc, this.cameraPosition);

        // create custom frame buffer and attach this.tex to it, and then bind default framebuffer instead.
        this.customframebuffer = this.#gl.createFramebuffer();
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, this.customframebuffer);
        this.#gl.framebufferTexture2D(this.#gl.FRAMEBUFFER, this.#gl.COLOR_ATTACHMENT0, this.#gl.TEXTURE_2D, this.tex, 0);
        //this.#gl.clearColor(0, 0, 1, 1); 
        //this.#gl.clear(this.#gl.COLOR_BUFFER_BIT | this.#gl.DEPTH_BUFFER_BIT);
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
        this.#gl.enable(this.#gl.BLEND);
        this.#gl.blendFunc(this.#gl.SRC_ALPHA, this.#gl.ONE_MINUS_SRC_ALPHA);
    }
    Draw()
    {
        // Draw text onto framebuffer (later will be text texture generator) using shader program that doesnt
        // count in for camera and aspect ratio 
        this.#gl.useProgram(this.textShaderProgram);
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, this.customframebuffer);
        this.#gl.viewport(0,0,1024,256);
        this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.atlasTextureBuffer);
        // Fill with le transparency =)
        this.#gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.#gl.clear(this.#gl.COLOR_BUFFER_BIT);
        this.#gl.uniformMatrix3fv(this.texposloc, false, this.textData);
        this.#gl.drawElementsInstanced(this.#gl.TRIANGLES, 6, this.#gl.UNSIGNED_SHORT, 0, this.textData.length/9);

        //this.#gl.clearColor(0.0, 0.0, 0.0, 1.0);
        //this.#gl.clear(this.#gl.COLOR_BUFFER_BIT);
        //this.#gl.drawArrays(this.#gl.TRIANGLES, 0, 6);
        //this.#gl.drawArraysInstanced(this.#gl.TRIANGLES, 0, 6, this.rectcount);

        // Use main shader program and write into main framebuffer
        this.#gl.useProgram(this.shaderProgram);
        
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
        this.#gl.viewport(0,0, this.#canvas.width,this.#canvas.height);

        // render one texture
        this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.atlasTextureBuffer);
        this.#gl.uniform1f(this.normalizedSpriteSize, 1/12);
        this.rectcount = this.Scene.GameObjects.length;
        this.#gl.uniformMatrix3fv(this.posloc, false, this.uniformData);
        this.#gl.drawElementsInstanced(this.#gl.TRIANGLES, 6, this.#gl.UNSIGNED_SHORT, 0, this.rectcount);

        // render framebuffered texture
        this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.tex);
        this.#gl.uniform1f(this.normalizedSpriteSize, 1);
        this.#gl.uniformMatrix3fv(this.posloc, false, [0,-1,0,0,0,1,12,3,0]);
        this.#gl.drawElementsInstanced(this.#gl.TRIANGLES, 6, this.#gl.UNSIGNED_SHORT, 0, 1);

        this.#gl.bindTexture(this.#gl.TEXTURE_2D, null);
        // This manual way of handling textures and shaderprograms on top of that isn't cool
    }

    // use AlphabetTex.png texture to type text
    // TODO: 
    WrieText(text,x=0,y=0,scale=64, maxX=this.#gl.width)
    {
        // output text rectangle size
        const RectXSize = maxX;
        const RectYSize = Math.ceil(text.length*scale/maxX);

        // New texture 
    }
    move_camera(vector2)
    {
        this.cameraPosition[0] += vector2.x;
        this.cameraPosition[1] += vector2.y;
        this.#gl.uniform2fv(this.cameraPosLoc, this.cameraPosition);
    }
}