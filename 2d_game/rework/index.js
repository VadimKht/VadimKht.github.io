import { Engine } from "./engine.js"
import _handlemouse, {xMouse, yMouse} from "./mousehandler.js";

const canvas = document.getElementById("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const rectpos = canvas.getBoundingClientRect();
let engine = new Engine(canvas);



engine.AddObjectRaw("player", [0.0, 0.0, 0.0,
    0.0, 0.0, 1.0,
    2,    2,   0,]);
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
document.onmousedown = (e)=>{
    const PointCentre = FindPointCentre(xMouse, yMouse);
    engine.AddObject("click pointer" + pointerid, [PointCentre[0], PointCentre[1]])
    pointerid++;
    engine.Draw();
};


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
let animData = [[1,0], [1,1], [1,2], [1,1]];
let currentId = 0;

let prevTime = new Date();
let nextTime = new Date();
let ar = new Date();
let shouldDraw = true;
let isRunning = true;

function Update()
{
    nextTime = new Date();
    if(KeysPressed.w == 1 || KeysPressed.a == 1 ||
        KeysPressed.s == 1 || KeysPressed.d == 1)
    {
        const xAxis = -KeysPressed.a + KeysPressed.d;
        const yAxis = -KeysPressed.s + KeysPressed.w;
        shouldDraw = true;
        engine.ChangeData(0, 2, wtf({x: engine.uniformData[0], y: engine.uniformData[1]}));
        ar = (nextTime.getTime() - prevTime.getTime())/1000;
        engine.ChangeData(0, 0, engine.uniformData[0] + xAxis * 0.1);
        engine.ChangeData(0, 1, engine.uniformData[1] + yAxis * 0.1);
        if(ar >= 0.5)
        {
            prevTime = new Date();

            engine.ChangeData(0, 3, animData[currentId][1]);
            engine.ChangeData(0, 4, animData[currentId][0]);
            currentId += 1;
            currentId = currentId % 3;
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
    if(shouldDraw)
    {
        engine.Draw();
        shouldDraw = false;
    } 
    if(isRunning) requestAnimationFrame(Update);
}
Update();

document.onmousemove = () => {
    engine.ChangeData(0, 2, wtf({x: engine.uniformData[0], y: engine.uniformData[1]}));
    shouldDraw = true;
}

function FindPointCentre(x,y)
{
    const ratio = canvas.width/canvas.height;
    const magicNumber = 16;
    return [ratio/4*((x-rectpos.x-canvas.width/2)/canvas.width*magicNumber) * canvas.width / canvas.height, 
            ratio/4*-((y-rectpos.y-canvas.height/2)/canvas.height*magicNumber)
    ]
}

let Point = {x: 1.5, y: 1.5};
function wtf(objectPos)
{
    const PointCentre = FindPointCentre(xMouse, yMouse);
    Point.x = PointCentre[0];
    Point.y = PointCentre[1];
    const whereToTurn = Math.atan2(Point.y - objectPos.y,Point.x-objectPos.x)
    return whereToTurn*57.2958;
}