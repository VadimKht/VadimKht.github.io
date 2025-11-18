import { Engine } from "./engine.js"
import _handlemouse, {xMouse, yMouse} from "./mousehandler.js";
import { gameVariables } from "./gamevariables.js";

const canvas = document.getElementById("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const rectpos = canvas.getBoundingClientRect();
let engine = new Engine(canvas);

let ratio = canvas.width/canvas.height;

engine.AddObjectRaw("player", [0.0, 0.0, 0.0,
    0.0, 0.0, 1.0,
    1,    1,   0,]);
_handlemouse();
const myNPC = engine.AddObject("NPC", [5,0],45, [1,1], "circle", [4,3]);
const enemyList = [[0,6],[1,6]];
for(const enemy of enemyList)
{
    engine.AddObject("e",[enemy[0], enemy[1]], 0,[1,1],"circle", [6,2]);
}

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

engine.SetText(0,0, "Current problem in code:\nVacant system on\n removing Is BROKEN!", 0.5);
const beginning = "A".charCodeAt();
document.onmousedown = (e)=>{

    //engine.SetText(0,0, String.fromCharCode(pointerid+beginning), 1);
    //pointerid++;
    engine.AddObject("Bullet", [engine.Scene.GameObjects[0][1][0], engine.Scene.GameObjects[0][1][1]], wtf({x: engine.Scene.GameObjects[0][1][0], y: engine.Scene.GameObjects[0][1][1]}));
    shouldDraw = true;
    
};

let touchControls = false;
let touchOrigin = [0,0];
let touchDragged = [0,0];
let touchStartTime = 0;
let collisionObjects = {
    name: "SampleName",
    ref: undefined,

}
document.ontouchstart = (e) => {
    const PointCentre = FindPointCentre(e.touches[0].pageX, e.touches[0].pageY, false);
    touchControls = true;
    touchOrigin = PointCentre;
    touchStartTime = new Date().getTime();
}
document.ontouchmove = (e) =>{
    if(touchControls && new Date().getTime()-touchStartTime > 100)
    {
        const pointpos = FindPointCentre(e.touches[0].pageX, e.touches[0].pageY, false);
        touchDragged =  [pointpos[0] - touchOrigin[0], pointpos[1] - touchOrigin[1]];
        const magnitude = Math.sqrt(Math.pow(touchDragged[0], 2)+Math.pow(touchDragged[1], 2));
        if(magnitude > characterSpeed * ar)
        {
            touchDragged[0] = touchDragged[0]/magnitude;
            touchDragged[1] = touchDragged[1]/magnitude;
        }
        engine.ChangeData(0, 2, Math.atan2(pointpos[1] - touchOrigin[1], pointpos[0] - touchOrigin[0])*57);
    }
}
document.ontouchend = (e) =>{
    touchControls = false;
    touchDragged = [0,0];
    if(new Date().getTime()-touchStartTime < 100) KeysPressed.e = 1;
}

let scale = 1;
let KeysPressed = {"w": 0, "a": 0, "s": 0, "d": 0, "e": 0, "esc": 0, "-": 0};
let KeysTapped = {...KeysPressed};
function UpdateCameraBoundary(){
    const padding = {x: 2, y:2}
    cameraBoundary = ratio > 1 ? [engine.cameraPosition[2]-padding.x, engine.cameraPosition[2]/ratio-padding.y] : [engine.cameraPosition[2]*ratio-padding.x, engine.cameraPosition[2]-padding.y];
}
document.onkeydown = (e)=>{
    switch(e.code)
    {
        case "KeyW":
            KeysPressed.w = 1;
            break;
        case "KeyA":
            KeysPressed.a = 1;
            break;
        case "KeyS":
            KeysPressed.s = 1;
            break;
        case "KeyD":
            KeysPressed.d = 1;
            break;
        case "KeyE":
            if(KeysPressed.e == 0) KeysTapped.e = 1;
            KeysPressed.e = 1;
            break;
        case "ShiftLeft":
            characterSpeed = 10;
            break;
        case "Escape":
            engine.set_camera({x:engine.Scene.GameObjects[0][1][0],y:engine.Scene.GameObjects[0][1][1]});
            engine.SetText(engine.Scene.GameObjects[0][1][0], engine.Scene.GameObjects[0][1][1], "Game stopped.\nReload page\n to resume.")
            shouldDraw = true;
            isRunning = false;
            break;
        case "Minus":
            engine.scale_camera(scale);
            scale++;
            UpdateCameraBoundary();
            shouldDraw = true;
            break;
        case "Space":

            break;
        default:
            //console.log(`Unknown key ${e.code} pressed.`)
            break;
    }
}
document.onkeyup = (e)=>{
    switch(e.code)
    {
        case "KeyW":
            KeysPressed.w = 0;
            break;
        case "KeyA":
            KeysPressed.a = 0;
            break;
        case "KeyS":
            KeysPressed.s = 0;
            break;
        case "KeyD":
            KeysPressed.d = 0;
            break;
        case "KeyE":
            KeysPressed.e = 0;
            break;
        case "ShiftLeft":
            characterSpeed = 5;
            break;
        default:
            break;
    }
}
window.onresize = () =>{
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ratio = canvas.width/canvas.height;
    UpdateCameraBoundary();
    engine.ResizeCallback();
    shouldDraw = true;
}
// screen ratio issues
// bigger bug found: under bigger/smaller resolution the object spawns slightly lower then needed and camera is calculated tihs way too
let cameraBoundary;
UpdateCameraBoundary();

let characterSpeed = 5;

let talkedToNPC = false;

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

    // temporary code for finding colissions, for now finds collisions between player and all objects in scene and deletes by default
    // and in other cases does interaction or remove on interaction key.
    if(KeysTapped.e && engine.Scene.GameObjects.length > 1)
        for(let i = 1; i < engine.Scene.GameObjects.length; i++)
        {
            if(!engine.vacantobjectids.includes(i) && engine.CheckCollision(engine.Scene.GameObjects[0], engine.Scene.GameObjects[i]))
            {
                if(engine.Scene.GameObjects[i] == engine.Scene.GameObjects[myNPC])
                {
                    if(!talkedToNPC) {
                        engine.SetText(6, 1.5, "Hello i'm NPC.\nNew line test\nThe text is weird.\nShould probably\nrewrite whole thing", 0.4)
                        shouldDraw = true;
                        talkedToNPC = true;
                    }
                    continue;
                }
                switch(engine.Scene.GameObjects[i][0]){
                    case "e":
                        engine.RemoveObject(i);
                        shouldDraw = true;
                        break;
                    default:
                        engine.RemoveObject(i);
                        shouldDraw = true;
                        break;
                }
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

    if(KeysTapped.e) KeysTapped.e = 0;

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

function FindPointCentre(x,y, CountCamera = true)
{
    // Magic number is camera zoom multiplied by 2 due to both left right sides
    const magicNumber = engine.cameraPosition[2]*2;
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