import { Engine } from "./engine.js"
import _handlemouse, {xMouse, yMouse} from "./mousehandler.js";

const canvas = document.getElementById("canvas");
let engine = new Engine(canvas);
// await because we get shader files (file IO) from "server"


engine.AddObjectRaw("object", [0.0, 0.0, 0.0,
    0.0, 0.0, 1.0,
    2,    2,   0,]);



engine.AddObject("object", [2.0, 2.0], 0);
engine.AddObject("object", [4.0, 2.0], 0);

engine.AddObject("object", [2.0, 4.0], 0);
engine.AddObject("coobe", [2.0, 0], 45);
    //engine.RemoveObject(1);
_handlemouse();

await engine.Init();
engine.BindBuffers();
const rectpos = canvas.getBoundingClientRect();

const textureData = new Image();
textureData.src = "texture.png";
textureData.addEventListener("load", ()=>{
    engine.ChangeCurrentTexture(textureData);
    engine.Draw();
});
engine.RemoveObject(engine.FindObjects("coobe")[0].id);

document.MoveCamera = (vector2) => {
    engine.move_camera(vector2);
    engine.Draw();
}

document.onmousedown = (e)=>{
    const PointCentre = {x: (((xMouse-rectpos.x-canvas.width/2)/canvas.width*16) * canvas.width / canvas.height), 
        y: -((yMouse-rectpos.y-canvas.height/2)/canvas.height*16)}
    engine.AddObject("click pointer", [PointCentre.x, PointCentre.y])
    engine.Draw();
};

let prevTime = new Date();
let nextTime = new Date();
let ar = new Date();

let isKeyDown = false;
document.onkeydown = (e)=>{
    if(e.code == "KeyD")  isKeyDown = true;
}
document.onkeyup = (e)=>{
    if(e.code == "KeyD")  isKeyDown = false;
}
let animData = [[1,0], [1,1], [1,2], [1,1]];
let currentId = 0;
setInterval(() => {
    if(isKeyDown)
    {

        nextTime = new Date();
        ar = (nextTime.getTime() - prevTime.getTime())/1000;

        if(ar >= 0.16)
        {
            prevTime = new Date();
            engine.ChangeData(0, 0, engine.uniformData[0] + 0.1);

            engine.ChangeData(0, 3, animData[currentId][1]);
            engine.ChangeData(0, 4, animData[currentId][0]);
            currentId += 1;
            currentId = currentId % 3;
            engine.ChangeData(0, 2, wtf({x: engine.uniformData[0], y: engine.uniformData[1]}));
            engine.Draw();
        }

    }
}, 66);
let Point = {x: 1.5, y: 1.5};
function wtf(objectPos)
{
    // finds cursor position in the game considering camera move and scale (scale is 3, we have left n right so its number 6)
    const PointCentre = {x: (((xMouse-rectpos.x-canvas.width/2)/canvas.width*16) * canvas.width / canvas.height), 
        y: -((yMouse-rectpos.y-canvas.height/2)/canvas.height*16)}
    Point.x = PointCentre.x;
    Point.y = PointCentre.y;
    // const v = Math.sqrt(Math.pow(Point.x-objectPos.x, 2) + Math.pow(Point.y-objectPos.y, 2));
    // const whereToTurn = Math.asin((Point.y-objectPos.y)/v)
    const whereToTurn = Math.atan2(Point.y - objectPos.y,Point.x-objectPos.x)
    return whereToTurn*57.2958;
}