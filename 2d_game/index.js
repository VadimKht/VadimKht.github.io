import { MyGame } from './gl.js'
import { RegisterKeys } from "./register_keys.js";

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("canvas");
canvas.width = 500;
canvas.height = 500;
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

myGame.AddObject(0,0);
// bind bufferz was introduced when i tried to add 10 000 objects and it took around 10 seconds to just make scene appear
// it used to be in addobject function in the end, now its its own function, but now i think of putting it inside draw loop function
myGame.BindBufferz();
myGame.Draw();
myGame.Update = ()=>{
    // goofball way to implement gravity-like movement on my goofball engine (it pulls every vertex by y coordinate down)
    const speed = 0.01;
    myGame.objectlist[0][2][11] -= speed;
    myGame.objectlist[0][2][9] -= speed;
    myGame.objectlist[0][2][7] -= speed;
    myGame.objectlist[0][2][5] -= speed;
    myGame.objectlist[0][2][3] -= speed;
    myGame.objectlist[0][2][1] -= speed;
    myGame.UpdateBuffers();
    myGame.BindBufferz();
}