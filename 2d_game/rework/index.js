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
let button1 = FindPointCentre(0, canvas.height, false);
let button2 = FindPointCentre(canvas.width, canvas.height, false);
// temporary
document.onmousedown = (e)=>{
    const PointCentre = FindPointCentre(xMouse, yMouse);
    // temporary check for colission to avoid creating object inside buttons
    if(PointCentre[0] > button1[0] && PointCentre[0] < button1[0] + 4 && 
        PointCentre[1] > button1[1] && PointCentre[1] < button1[1] + 2) return;
    if(PointCentre[0] > button2[0] - 4 && PointCentre[0] < button2[0] && 
        PointCentre[1] > button2[1] && PointCentre[1] < button2[1] + 2) return
    
    engine.AddObject("click pointer" + pointerid, [PointCentre[0], PointCentre[1]], 0, [1,1], "circle")
    pointerid++;

    engine.Draw();

};
document.ontouchstart = (e) => {
    const PointCentre = FindPointCentre(e.touches[0].pageX, e.touches[0].pageY, false);
    if(PointCentre[0] > button1[0] && PointCentre[0] < button1[0] + 4 && 
        PointCentre[1] > button1[1] && PointCentre[1] < button1[1] + 2) KeysPressed.a = 1;
    if(PointCentre[0] > button2[0] - 4 && PointCentre[0] < button2[0] && 
        PointCentre[1] > button2[1] && PointCentre[1] < button2[1] + 2) KeysPressed.d = 1;
}
document.ontouchend = (e) =>{
    // TODO: reset only on certain touches lol
    // idea: i can have 
    KeysPressed.a = 0; KeysPressed.d = 0;
}
engine.AddObject("button", [button1[0]+2, button1[1]+1], 0, [4,2])
engine.AddObject("button", [button2[0]-2, button2[1]+1], 0, [4,2])

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
// animation data, not used temporarily?
let animData = [[1,0], [1,1], [1,2], [1,1]];
let currentId = 0;

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
function wtf(objectPos)
{
    const PointCentre = FindPointCentre(xMouse, yMouse);
    Point.x = PointCentre[0];
    Point.y = PointCentre[1];
    const whereToTurn = Math.atan2(Point.y - objectPos.y,Point.x-objectPos.x)
    return whereToTurn*57.2958;
}