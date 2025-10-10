import { Engine } from "./engine.js"
import _handlemouse, {xMouse, yMouse} from "./mousehandler.js";

const canvas = document.getElementById("canvas");

// Bug: doesnt actually find correct height...
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

const rectpos = canvas.getBoundingClientRect();
let engine = new Engine(canvas);

const ratio = canvas.width/canvas.height;


engine.AddObjectRaw("player", [0.0, 0.0, 0.0,
    0.0, 0.0, 1.0,
    1,    1,   0,]);
_handlemouse();

// await because we get shader files (file IO) from "server"
await engine.Init();
engine.BindBuffers();


const textureData = new Image();
textureData.src = "texture.png";
textureData.addEventListener("load", ()=>{
//    engine.ChangeCurrentTexture(textureData, textureData.width, 200);
    engine.Draw();
});

document.MoveCamera = (vector2) => {
    engine.move_camera(vector2);
    engine.Draw();
}

let pointerid = 0;

engine.AddText("Text my", "text p\narsing\nis hel\nl its \ndiffic\nult");
const beginning = "A".charCodeAt();
document.onmousedown = (e)=>{

    engine.AddText("Text my", String.fromCharCode(pointerid+beginning));
    pointerid++;

    engine.Draw();

};

let touchControls = false;
let touchOrigin = [0,0];
let touchDragged = [0,0];
document.ontouchstart = (e) => {
    const PointCentre = FindPointCentre(e.touches[0].pageX, e.touches[0].pageY, false);
    touchControls = true;
    touchOrigin = PointCentre;
}
document.ontouchmove = (e) =>{
    if(touchControls)
    {
        const pointpos = FindPointCentre(e.touches[0].pageX, e.touches[0].pageY, false);
        touchDragged =  [pointpos[0] - touchOrigin[0], pointpos[1] - touchOrigin[1]];
        const magnitude = Math.sqrt(Math.pow(touchDragged[0], 2)+Math.pow(touchDragged[1], 2));
        if(magnitude > characterSpeed * ar)
        {
            touchDragged[0] = touchDragged[0]/magnitude;
            touchDragged[1] = touchDragged[1]/magnitude;
        }
    }
}
document.ontouchend = (e) =>{
    touchControls = false;
    touchDragged = [0,0];
}

let KeysPressed = {"w": 0, "a": 0, "s": 0, "d": 0};
document.onkeydown = (e)=>{
    if(e.code == "KeyW")  KeysPressed.w = 1;
    if(e.code == "KeyA")  KeysPressed.a = 1;
    if(e.code == "KeyS")  KeysPressed.s = 1;
    if(e.code == "KeyD")  KeysPressed.d = 1;

}
document.onkeyup = (e)=>{
    if(e.code == "KeyW")  KeysPressed.w = 0;
    if(e.code == "KeyA")  KeysPressed.a = 0;
    if(e.code == "KeyS")  KeysPressed.s = 0;
    if(e.code == "KeyD")  KeysPressed.d = 0;
}

// screen ratio issues
// bigger bug found: under bigger/smaller resolution the object spawns slightly lower then needed and camera is calculated tihs way too
const cameraBoundary = ratio > 1 ? [6, 6/ratio] : [6*ratio, 6];

let characterSpeed = 5;

// delta time calculation vraibles
let prevTime = new Date();
let nextTime = new Date();
let ar = new Date();

let shouldDraw = true;
let isRunning = true;

function Update()
{
    nextTime = new Date();
    ar = (nextTime.getTime() - prevTime.getTime()) / 1000;
    prevTime = nextTime;

    if(KeysPressed.w == 1 || KeysPressed.a == 1 ||
        KeysPressed.s == 1 || KeysPressed.d == 1)
    {
        const xAxis = -KeysPressed.a + KeysPressed.d;
        const yAxis = -KeysPressed.s + KeysPressed.w;
        shouldDraw = true;
        engine.ChangeData(0, 2, wtf({x: engine.uniformData[0], y: engine.uniformData[1]}));
        engine.ChangeData(0, 0, engine.uniformData[0] + xAxis * ar * characterSpeed);
        engine.ChangeData(0, 1, engine.uniformData[1] + yAxis * ar * characterSpeed);
    }
    if(touchControls)
    {
        if(touchDragged[0] != 0 || touchDragged[1] != 0)
        {
            engine.ChangeData(0, 0, engine.uniformData[0] + touchDragged[0] * ar * characterSpeed);
            engine.ChangeData(0, 1, engine.uniformData[1] + touchDragged[1] * ar * characterSpeed);
            shouldDraw = true;  
        }
    }

    // temporary code for finding colissions, for now finds collisions between player and all objects in scene and deletes
    if(engine.Scene.GameObjects.length > 1)
        for(let i = 1; i < engine.Scene.GameObjects.length; i++)
        {
            if(engine.CheckCollision(engine.Scene.GameObjects[0], engine.Scene.GameObjects[i]))
            {
                engine.RemoveObject(i);
            }
        }

    // Move camera on player entering the boundaries
    // TODO: differnet screen ratio causes player going outside of camera. why?
    // X right
    if(engine.Scene.GameObjects[0][1][0] >= cameraBoundary[0] + engine.cameraPosition[0])
    {
        engine.move_camera({x:characterSpeed * ar, y:0});
    }
    // X left
    if(engine.Scene.GameObjects[0][1][0] <= -cameraBoundary[0] + engine.cameraPosition[0])
    {
        engine.move_camera({x:-(characterSpeed * ar), y:0});
    }
    // Y up
    if(engine.Scene.GameObjects[0][1][1] >= cameraBoundary[1] + engine.cameraPosition[1])
    {
        engine.move_camera({x:0, y:characterSpeed * ar});
    }
    // Y down
    if(engine.Scene.GameObjects[0][1][1] <= -cameraBoundary[1] + engine.cameraPosition[1])
    {
        engine.move_camera({x:0, y:-(characterSpeed * ar)});
    }

    if(shouldDraw)
    {
        engine.Draw();
        shouldDraw = false;
    } 
    if(isRunning) requestAnimationFrame(Update);
}
Update();

// if user uses touch, probably dont do that
document.onmousemove = () => {
    engine.ChangeData(0, 2, wtf({x: engine.uniformData[0], y: engine.uniformData[1]}));
    shouldDraw = true;
}

function FindPointCentre(x,y, CountCamera = true)
{
    // Magic number is camera zoom multiplied by 2 due to both left right sides
    const magicNumber = 16;
    // in X multiply by ratio if ratio is above 1, in Y divide by ratio if its above 1 for accuracy
    // how does it work? god knows
    return [((x-rectpos.x-canvas.width/2)/canvas.width*magicNumber)* (ratio < 1 ? ratio : 1) + (CountCamera ? engine.cameraPosition[0] : 0), 
            -((y-rectpos.y-canvas.height/2)/canvas.height*magicNumber) / (ratio > 1 ? ratio : 1) + (CountCamera ?  engine.cameraPosition[1] : 0)
    ]
}

let Point = {x: 1.5, y: 1.5};
// finds rotation from mouse to to objectpos
function wtf(objectPos)
{
    const PointCentre = FindPointCentre(xMouse, yMouse);
    Point.x = PointCentre[0];
    Point.y = PointCentre[1];
    const whereToTurn = Math.atan2(Point.y - objectPos.y,Point.x-objectPos.x)
    return whereToTurn*57.2958;
}