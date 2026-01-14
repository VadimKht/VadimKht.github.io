import { Engine } from "./engine.js"
import _handlemouse, {xMouse, yMouse} from "./mousehandler.js";
import { gameVariables } from "./gamevariables.js";
import { NetworkConnect, NetworkSendRequest, playerMap } from './network.js'

const canvas = document.getElementById("canvas");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const rectpos = canvas.getBoundingClientRect();
let engine = new Engine(canvas);
let ratio = canvas.width/canvas.height;

export function addobj(name){return engine.AddObject(name)};
export function chobj(obji, index, data){engine.ChangeData(obji, index, data)};

engine.AddObjectRaw("player", [0.0, 0.0, 0.0,
    0.0, 0.0, 1.0,
    1,    1,   0,]);


engine.AddTemporarilyJAN([-1,7], [0,3]);
engine.AddTemporarilyJAN([2,7], [0,0]);
engine.AddTemporarilyJAN([3,9], [0,1])
engine.AddTemporarilyJAN([0, 12], [7,7])
engine.AddTemporarilyJAN([0,10], [0,5])
		let sound = new Audio("munch.mp3");
let music = new Audio("audio.mp3");
let death = new Audio("scream.mp3");
let deadsilence = false;

let aoe = 0;
let AnimationLoopMapDance2 = [[0,3], [1,3],[2,3],[3,3],[4,3],[5,3],[6,3],[7,3],[0,4],[1,4],[2,4],[3,4],[4,4],[5,4],[6,4]]
let aoe2 = 0;
let AnimationLoopMapDance3 = [[0,0], [1,0], [2,0], [3,0], [4,0],[5,0],[6,0],[7,0]];
let aoe3 = 0;
let AnimationLoopMapDance = [[0,1],[1,1],[2,1],[3,1],[4,1],[5,1],[6,1],[7,1],[0,2],[1,2],[2,2],[3,2]]

let aoe4 = [0,0];
let interval;
// [0] animations for beginning
// [1] animations for user interacting
// [2] loop animation after user ate
let CakeAnimations = [ [ [0,5],[1,5],[2,5],[3,5] ], [ [0,6], [1,6], [2,6],[3,6],[4,6] ], [ [0,7],[1,7],[2,7],[3,7],[4,7] ]];

const animation = setInterval(()=>{
	if(aoe >= AnimationLoopMapDance2.length-1) aoe = 0;
	if(aoe2 >= AnimationLoopMapDance3.length-1) aoe2 = 0;
	if(aoe3 >= AnimationLoopMapDance.length-1) aoe3 = 0;
	
	engine.ChangeJANData(0, 3, AnimationLoopMapDance2[aoe][0]);
	engine.ChangeJANData(0, 4, AnimationLoopMapDance2[aoe][1]);
	
	engine.ChangeJANData(1, 3, AnimationLoopMapDance3[aoe2][0]);
	engine.ChangeJANData(1, 4, AnimationLoopMapDance3[aoe2][1]);
	
	engine.ChangeJANData(2, 3, AnimationLoopMapDance[aoe3][0]);
	engine.ChangeJANData(2, 4, AnimationLoopMapDance[aoe3][1]);
	aoe +=1;
	aoe2 += 1;
	aoe3 += 1;
	shouldDraw = true;
},1000/6);

_handlemouse();
/*const myNPC = engine.AddObject("NPC", [5,0],45, [1,1], "circle", [4,3]);
const enemyList = [[0,6],[1,6]];
for(const enemy of enemyList)
{
    engine.AddObject("e",[enemy[0], enemy[1]], 0,[1,1],"circle", [6,2]);
}
*/
// await because we get shader files (file IO) from "server"
await engine.Init();
engine.BindBuffers();

const textureData = new Image();
textureData.src = "texture.png";
textureData.addEventListener("load", ()=>{
//    engine.ChangeCurrentTexture(textureData, textureData.width, 200);
    shouldDraw = true;
});

document.MoveCamera = (vector2) => {
    engine.move_camera(vector2);
    engine.Draw();
}

let pointerid = 0;

engine.SetText(-2,12, "HAPPY\nBIRTHDAY\nJETT", 0.5);
const beginning = "A".charCodeAt();
document.onmousedown = (e)=>{

    //engine.SetText(0,0, String.fromCharCode(pointerid+beginning), 1);
    //pointerid++;
    //engine.AddObject("Bullet", [engine.Scene.GameObjects[0][1][0], engine.Scene.GameObjects[0][1][1]], wtf({x: engine.Scene.GameObjects[0][1][0], y: engine.Scene.GameObjects[0][1][1]}));
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
    if(new Date().getTime()-touchStartTime < 100) KeysTapped.e = 1;
}

let scale = 1;
let KeysPressed = {"w": 0, "a": 0, "s": 0, "d": 0, "e": 0, "esc": 0, "-": 0, "space": 0};
let KeysTapped = {...KeysPressed};
function UpdateCameraBoundary(){
    const padding = {x: 2, y:2}
    cameraBoundary = ratio > 1 ? [engine.cameraPosition[2]-padding.x, engine.cameraPosition[2]/ratio-padding.y] : [engine.cameraPosition[2]*ratio-padding.x, engine.cameraPosition[2]-padding.y];
}

let isDashing = false;
// Should probably make animation system 
let startedDashAt = 0;
let dashDirection = [0,0];
const dashTime = 0.05;
const dashSpeed = 60;
const dashDelay = 4;
// if startedDashAt + dashTime + dashDelay < time now ? do nothing : dash once more and set new startedDashAt

document.onkeydown = (e)=>{
    if(engine.Scene.GameObjects[0][1][1] > 2)
if(music.paused && !deadsilence) music.play();
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
            if(KeysPressed.space == 0) KeysTapped.space = 1;
            KeysPressed.space = 1;
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
        case "Space":
            KeysPressed.space = 0;
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


// sid is just a public known hidden variable which purpose is to distinguish personal actions from other actions through tick.
let uid = localStorage.getItem("uid");
if(!uid) {
	uid = Math.random()*1e17;
	localStorage.setItem("uid", uid);
}

//NetworkConnect("vadiks2003");
//let h = ()=>{
//NetworkSendRequest({op: "transformUpdate", sid: localStorage.getItem("sid"), position:[1,2], rotation: 45, currentState: "IDLE", uid: uid});
//}
//setTimeout(h,1000);


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

    
    if((KeysPressed.w == 1 || KeysPressed.a == 1 ||
        KeysPressed.s == 1 || KeysPressed.d == 1) && !isDashing)
    {
        const xAxis = -KeysPressed.a + KeysPressed.d;
        const yAxis = -KeysPressed.s + KeysPressed.w;
        shouldDraw = true;
        engine.ChangeData(0, 2, wtf({x: engine.uniformData[0], y: engine.uniformData[1]}));
        engine.ChangeData(0, 0, engine.uniformData[0] + xAxis * ar * characterSpeed);
        engine.ChangeData(0, 1, engine.uniformData[1] + yAxis * ar * characterSpeed);
    }
    if(isDashing)
    {
        //engine.ChangeData(0, 2, wtf({x: engine.uniformData[0], y: engine.uniformData[1]}));
        engine.ChangeData(0, 0, engine.uniformData[0] + dashDirection[0] * ar * dashSpeed)
        engine.ChangeData(0, 1, engine.uniformData[1] + dashDirection[1] * ar * dashSpeed)
        if(new Date().getTime()/1000 > startedDashAt+dashTime) isDashing = false;
        shouldDraw = true;
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
// TEMP temp remove later when party is over
    if(KeysTapped.e&&engine.ExistsJan(4))
    {
        const distX = engine.Scene.GameObjects[0][1][0] - 0;
        const distY = engine.Scene.GameObjects[0][1][1] - 10;
	const distance = Math.sqrt((distX * distX) + (distY*distY));
	if(distance <= 1.5) {

		const limit = CakeAnimations[aoe4[0]].length;
		interval = setInterval(()=>{
			const currentFrame = CakeAnimations[aoe4[0]][aoe4[1]];
			engine.ChangeJANData(4,3,currentFrame[0]);
			engine.ChangeJANData(4,4,currentFrame[1]);
			aoe4[1] += 1;	
			if(aoe4[0] == 2 && aoe4[1] >= limit) {aoe4[1] = 0;}
			if(aoe4[0] == 1 && aoe4[1] == limit) {aoe4[0] = 2; aoe4[1] = 0; sound.play();}
			if(aoe4[1] >= limit && aoe4[0] != 2) {aoe4[0] += 1; aoe4[1] = 0;clearInterval(interval)};
		},1000/6)
		if(aoe4[0] == 2 && engine.ExistsJan(4)){clearInterval(interval); sound.play(); death.play(); deadsilence = true; music.pause(); engine.EatJan(4); };
	}
	
    }
    if(KeysTapped.space){
        if(new Date().getTime()/1000 < startedDashAt + dashTime + dashDelay){}
        else{
            isDashing = true;
            startedDashAt = new Date().getTime()/1000;
            dashDirection = AngleToVector(engine.uniformData[2]);
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
    if(KeysTapped.space) KeysTapped.space = 0; 
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

// Finds ingame coordinates - used mainly for mouse click ingame
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


const RADIAN = 57.2958;
// AKA magnitude
function FindLength(x,y)
{
    return Math.sqrt(Math.pow(x,2) + Math.pow(y,2));
}

function Normalize(x,y)
{
    const magnitude = FindLength(x,y);
    return [x/magnitude, y/magnitude];
}

function AngleToVector(rotation){
    return [Math.cos(rotation/RADIAN), Math.sin(rotation/RADIAN)];
}

let Point = {x: 1.5, y: 1.5};
// finds rotation from mouse to to objectpos
function wtf(objectPos)
{
    const PointCentre = FindPointCentre(xMouse, yMouse);
    Point.x = PointCentre[0];
    Point.y = PointCentre[1];
    const whereToTurn = Math.atan2(Point.y - objectPos.y,Point.x-objectPos.x)
    return whereToTurn * RADIAN;
}
