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
myGame.Draw();