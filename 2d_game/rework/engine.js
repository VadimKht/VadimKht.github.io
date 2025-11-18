export class Engine{
    /** @type {HTMLCanvasElement} */
    #canvas;

    /** @type {WebGL2RenderingContext} */
    #gl;

    shaderProgram;

    indexBuffer;

    // Texture buffers. Possibly should turn these to arrays if quantity gets too big
    textureBuffer;
    atlasTextureBuffer
    tex;

    textureTexture;
    atlasTexture;
    textPositions = [{
        name: "Helloworld",
        position: [0,0],
        text: "t",
        size: [256,256],
        ratio: [1,1],

        // data for all LETTERS
        uniformdata: this.textData,

        // Vacant is for future, when textures are created through function, instead of always making
        // new ones all time, if there is one "deleted", it will become not vacant, and can be refilled with new texture
        // todo: it may make more sense to make it "DELETEDFLAG" to reverse conditional,
        // because with "vacant" system we have to manually fill the field,
        // and with having it as flag such as "deleted" it'd be as easy to do as 
        // if(texture[i].DELFLAG) {
        // createObject[i]; texture[i].DELFLAG = false; // or undefined
        // }
        // don't forget though, that this is raw javascript. It's not blueprint(type), its just initial fill example
        // MAY also be good idea to instead have special set of indices of "vacant" objects instead of having a whole field
        // this way if there is too many text textures it's O(1) instead of O(x)
        // although the problem is - indices may change if i plan to ever limit texture array or cut it down, if there is too
        // many texts on screen, there will be too many texts in the array, and
        // i'd probably want to make the array smaller when they're gone for sake of freer memory
        // perhaps a code that once in a while just pops texture from array if the set of vacant ones contains length-1
        // (sort set, start counting from last (biggest one), if there is numbers in a row, pop that much of array)
        // This whole text is TO BE DELETED once i implement AddText() RemoveText() and change SetText() to fit the rest
        vacant: true
    },]

    // objects data (read shaders/vertex "positions" uniform comment)
    uniformData = [];

    Scene = {
        GameObjects: []
    };
    // After deleting object it will have [3] set to vacant and added to vacantids for quicker search
    vacantobjectids = [];
    cameraPosition = [0, 0, 8];
    customframebuffer;

    constructor(canvas){
        this.#canvas = canvas;
        this.#gl = this.#canvas.getContext("webgl2", {antialias: false});
        if(this.#gl == false) alert("Unable to make webgl2 context.");
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
        // REMINDER: in 3D graphics everything is made out of 3d triangles - balls and rectangles are too
    }
    MakeTexture(textureBuffer, textureData = null, x=512,y=512){
        this.#gl.bindTexture(this.#gl.TEXTURE_2D, textureBuffer);
        this.#gl.texParameteri ( this.#gl.TEXTURE_2D, this.#gl.TEXTURE_MAG_FILTER, this.#gl.NEAREST ) ;
        if(textureData instanceof Image)
             this.#gl.texImage2D(this.#gl.TEXTURE_2D, 0, this.#gl.RGBA, this.#gl.RGBA, this.#gl.UNSIGNED_BYTE, textureData);
        else
        {
            textureData == null ? {} : textureData = new Uint8Array(textureData);
            this.#gl.texImage2D(this.#gl.TEXTURE_2D, 0, this.#gl.RGBA,x, y, 0, this.#gl.RGBA,this.#gl.UNSIGNED_BYTE, textureData);
        }
        this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_MIN_FILTER, this.#gl.LINEAR);
        this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_WRAP_S, this.#gl.CLAMP_TO_EDGE);
        this.#gl.texParameteri(this.#gl.TEXTURE_2D, this.#gl.TEXTURE_WRAP_T, this.#gl.CLAMP_TO_EDGE);
        this.#gl.bindTexture(this.#gl.TEXTURE_2D, null);
    }

    CreateBuffers()
    {
        // index buffer
        this.indexBuffer = this.#gl.createBuffer();        
        // reset
        this.#gl.bindBuffer(this.#gl.ARRAY_BUFFER, null);
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
        const MetaData = [name, obj, coliderdata, false];
        if(this.vacantobjectids.length > 0)
        {
            const id = this.vacantobjectids.pop();
            this.Scene.GameObjects[id] = MetaData;
            // console.debug(`Found vacant object at ${id}, swappintg the data !`);

            for(let i = 0; i < 9; i++)
            {
                this.uniformData[id*9+i] = obj[i];
            }
            return id;
        }
        else{
            this.Scene.GameObjects.push(MetaData);
            this.uniformData.push(...obj);
            return this.Scene.GameObjects.length-1;
        }
    }   

    AddObjectRaw(name = "Object", data)
    {
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
        const MetaData = [name, obj, coliderdata, false]
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
    SetText(x,y, letter = "a", size = 1){
        if(letter.length <= 1)
        {
            let texindex = this.textToIndex.get(letter);
            if(texindex == undefined) texindex = [11,11];

            this.MakeTexture(this.tex, null, 256,256);
            this.textData = [0,0, 0, 
                        ...texindex, 1, 
                        1, 1, 0];
            this.textPositions[0] = {
                name: "Helloworld",
                position: [x,y],
                text: letter,
                size: [256,256],
                ratio: [size,size],
                uniformdata: this.textData
            }
        }
        else if(letter.length > 1)
        {
            // Biggest line is width of the whole text, new lines is height of whole text.
            const ParseData = {
                newLines: 0,
                biggestLine: 0,
                currentLineSize: 0
            }
            for(let i = 0; i < letter.length; i++)
            {
                const curLetter = letter[i];
                if(curLetter == "\n" || i == letter.length-1)
                {
                    ParseData.newLines += 1;
                    letter.length == i ? ParseData.currentLineSize += 1 : {};
                    if(ParseData.currentLineSize > ParseData.biggestLine)
                        ParseData.biggestLine = ParseData.currentLineSize;
                    ParseData.currentLineSize = 0;
                    continue;
                }
                ParseData.currentLineSize += 1;
            }
        
            this.textData = [];
            let xLet = -1+(1/(ParseData.biggestLine+1));
            // for some reason if i set 0 with new lines the bottom part will half-disappepar,
            // however if i set -0.5 it will work fine but without new lines, the text is slightly towards the top...
            // similar thing occurs to X for some reason
            let yLet = ParseData.newLines <= 1 ? 0 : -1+(1/ParseData.newLines);

            const SizeTotal=[ParseData.biggestLine*256, ParseData.newLines*256]
            this.MakeTexture(this.tex, null, SizeTotal[0], SizeTotal[1]) ;
            for(let i = 0; i < letter.length; i++)
            {
                if(letter[i] == '\n')
                {
                    xLet = -1+(1/(ParseData.biggestLine+1));
                    yLet += 1/(ParseData.newLines)*2;
                    continue;
                }
                let curLetter = this.textToIndex.get(letter[i]);
                if(curLetter == undefined) curLetter = [11,11];

                this.textData.push(...[xLet,yLet,0,
                                    ...curLetter,1,
                                    1/ParseData.biggestLine, 1/ParseData.newLines,0
                ])
                xLet += 1/(ParseData.biggestLine+1)*2;
            }
            this.textPositions[0] = {
                name: "Helloworld",
                position: [x,y],
                text: letter,
                size: [SizeTotal[0], SizeTotal[1]],
                ratio: [ParseData.biggestLine*size, ParseData.newLines*size],
                uniformdata: this.textData
            }
        }
        this.DrawTextFrameBuffer();
    }
    ResizeCallback()
    {
        const ratio = this.#canvas.width/this.#canvas.height;
        let matrix;
        // transform matrix for objects to fit the aspect
        // [1/ratio, 0]  or  [1,   0  ]
        // [  0,     1]      [0, ratio]
        // depending on whether its horizontal or vertical screen (<1 or >1)
        if(ratio < 1) matrix = [1/ratio, 0.0, 0.0, 1.0];
        else matrix = [1.0, 0.0, 0.0, ratio];
        this.#gl.uniformMatrix2fv(this.canvSizeloc, false, matrix);
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
        this.Scene.GameObjects[id] = 0;
        this.uniformData.fill(0, id*9, id*9+9);
        this.vacantobjectids.push(id);

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
            this.MakeTexture(this.atlasTextureBuffer, this.atlasTexture)
            this.DrawTextFrameBuffer();
        };

        this.tex = this.#gl.createTexture();
        this.MakeTexture(this.tex,null,512,512);
        this.textureBuffer = this.#gl.createTexture();
        this.MakeTexture(this.textureBuffer, [255,0,0,255, 0,255,0,255, 255,0,255,255, 0,255,255,255], 2,2);

        this.atlasTexture.src = "AlphabetTex.png"


        // Further detail in shaders/vertex at positions uniform.
        this.#gl.uniformMatrix3fv(this.posloc, false, this.uniformData);

        // ratio things are done for proper calculation with positive and negative w/h ratios
        const ratio = this.#canvas.width/this.#canvas.height;
        let matrix;
        // transform matrix for objects to fit the aspect
        // [1/ratio, 0]  or  [1,   0  ]
        // [  0,     1]      [0, ratio]
        // depending on whether its horizontal or vertical screen (<1 or >1)
        if(ratio < 1) matrix = [1/ratio, 0.0, 0.0, 1.0];
        else matrix = [1.0, 0.0, 0.0, ratio];
        this.#gl.uniformMatrix2fv(this.canvSizeloc, false, matrix);
        this.#gl.uniform1f(this.normalizedSpriteSize, 1/12);
        this.#gl.uniform3fv(this.cameraPosLoc, this.cameraPosition);

        this.#gl.enable(this.#gl.BLEND);
        this.#gl.blendFunc(this.#gl.SRC_ALPHA, this.#gl.ONE_MINUS_SRC_ALPHA);

        // create custom frame buffer and attach this.tex to it, and then bind default framebuffer instead.
        this.customframebuffer = this.#gl.createFramebuffer();
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, this.customframebuffer);
        // IMPORTANT: frambuffertexture applies texture on thix.tex
        this.#gl.framebufferTexture2D(this.#gl.FRAMEBUFFER, this.#gl.COLOR_ATTACHMENT0, this.#gl.TEXTURE_2D, this.tex, 0);
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
    }
    Draw()
    {
        // Use main shader program and write into main framebuffer
        this.#gl.useProgram(this.shaderProgram);
        
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
        this.#gl.viewport(0,0, this.#canvas.width,this.#canvas.height);

        // render one texture
        this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.textureBuffer);
        this.#gl.uniform1f(this.normalizedSpriteSize, 1/2);
        const rectcount = this.Scene.GameObjects.length;
        this.#gl.uniformMatrix3fv(this.posloc, false, this.uniformData);
        this.#gl.drawElementsInstanced(this.#gl.TRIANGLES, 6, this.#gl.UNSIGNED_SHORT, 0, rectcount);

        this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.tex);
        this.#gl.uniform1f(this.normalizedSpriteSize, 1);
        this.#gl.uniformMatrix3fv(this.posloc, false, [this.textPositions[0].position[0], this.textPositions[0].position[1], 0,
                                                        0,0,1,
                                                        this.textPositions[0].ratio[0],this.textPositions[0].ratio[1],0]);
        this.#gl.drawElementsInstanced(this.#gl.TRIANGLES, 6, this.#gl.UNSIGNED_SHORT, 0, 1);

        this.#gl.bindTexture(this.#gl.TEXTURE_2D, null);
        // This manual way of handling textures and shaderprograms on top of that isn't cool
    }

    // Draw text into framebuffer
    DrawTextFrameBuffer()
    {
        // Draw text onto framebuffer (later will be text texture generator) using shader program that doesnt
        // count in for camera and aspect ratio 
        this.#gl.useProgram(this.textShaderProgram);
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, this.customframebuffer);
        this.#gl.viewport(0,0,this.textPositions[0].size[0],this.textPositions[0].size[1]);
        this.#gl.bindTexture(this.#gl.TEXTURE_2D, this.atlasTextureBuffer);
        // Fill with the transparency 
        this.#gl.clearColor(0.0, 0.0, 0.0, 0.0);
        this.#gl.clear(this.#gl.COLOR_BUFFER_BIT);
        this.#gl.uniformMatrix3fv(this.texposloc, false, this.textData);
        this.#gl.drawElementsInstanced(this.#gl.TRIANGLES, 6, this.#gl.UNSIGNED_SHORT, 0, this.textData.length/9);
                this.#gl.useProgram(this.shaderProgram);
        this.#gl.bindTexture(this.#gl.TEXTURE_2D, null);
        this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
    }
    scale_camera(float)
    {
        this.cameraPosition[2] = float;
        this.#gl.uniform3fv(this.cameraPosLoc, this.cameraPosition);
    }
    set_camera(vector2)
    {
        this.cameraPosition[0] = vector2.x;
        this.cameraPosition[1] = vector2.y;
        this.#gl.uniform3fv(this.cameraPosLoc, this.cameraPosition);
    }
    move_camera(vector2)
    {
        this.cameraPosition[0] += vector2.x;
        this.cameraPosition[1] += vector2.y;
        this.#gl.uniform3fv(this.cameraPosLoc, this.cameraPosition);
    }
}