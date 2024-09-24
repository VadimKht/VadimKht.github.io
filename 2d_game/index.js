import { MyGame } from './gl.js'
import { RegisterKeys } from "./register_keys.js";

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
canvas.width = 1000;
canvas.height = 800;
 /** @type {WebGLRenderingContext} */
const gl = canvas.getContext("webgl");

if(gl == false) alert("gl didnt work woh-woh");


let KeyPressesObj = {
    w: 0,
    a: 0,
    s: 0,
    d: 0
};

RegisterKeys(KeyPressesObj);
const myGame = new MyGame(canvas, gl, KeyPressesObj);
myGame.init();

let i = 0;
let k = 0;

let xMouse = 0;
let yMouse = 0;
const rectpos = canvas.getBoundingClientRect();
document.addEventListener('mousemove', onMouseUpdate, false);
function onMouseUpdate(e) {
    xMouse = e.pageX;
    yMouse = e.pageY;
}  
//document.addEventListener('mousedown', (e)=>{
//    myGame.AddObject(((xMouse-rectpos.x-250)/500*6)-myGame.transform[0], -((yMouse-rectpos.y-250)/500*6)-myGame.transform[1]);
//}, false);


// use objectlist[id][6] instead
function GetObjectCenter(posLeftUpX, posRightUpX, posLeftUpY, posBottomLeftY)
{
    const xCenter = posLeftUpX + ((posRightUpX - posLeftUpX)/2);
    const yCenter = posLeftUpY - ((posLeftUpY - posBottomLeftY)/2);
    return {x: xCenter, y: yCenter};
}

let speedLimiter = 0.1; 

// todo: path algorithm
const Point = {x: 1.5, y: 1.5};
let normalizedX;
let normalizedY;
myGame.ratio = canvas.height/canvas.width;
myGame.AddObject(0,0);
// bind bufferz was introduced when i tried to add 10 000 objects and it took around 10 seconds to just make scene appear
// it used to be in addobject function in the end, now its its own function, but now i think of putting it inside draw loop function
myGame.BindBufferz();
myGame.Draw();
myGame.Update = ()=>{
    const objectPos = myGame.objectlist[0] ? 
    {x: myGame.objectlist[0].position.x, 
    y: myGame.objectlist[0].position.y}:{};
    // finds cursor position in the game considering camera move and scale (scale is 3, we have left n right so its number 6)
    const PointCentre = {x: (((xMouse-rectpos.x-canvas.width/2)/canvas.width*6) * canvas.width / canvas.height -myGame.transform[0]), 
        y: -((yMouse-rectpos.y-canvas.height/2)/canvas.height*6) - myGame.transform[1]}
    Point.x = PointCentre.x;
    Point.y = PointCentre.y;
    const v = Math.sqrt(Math.pow(Point.x-objectPos.x, 2) + Math.pow(Point.y-objectPos.y, 2));
    normalizedX = (Point.x - objectPos.x)/v;
    normalizedY = (Point.y - objectPos.y)/v;
    
    if(Math.abs(objectPos.x - Point.x) > normalizedX*speedLimiter && Math.abs(objectPos.y - Point.y) > normalizedY*speedLimiter)
        myGame.MoveObject(0, {x: normalizedX * speedLimiter, y: normalizedY * speedLimiter});
    myGame.UpdateBuffers();
    myGame.BindBufferz();
}