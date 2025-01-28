import { Engine } from "./engine.js"

const canvas = document.getElementById("canvas");
let engine = new Engine(canvas);
// await because we get shader files (file IO) from "server"
await engine.Init();

//engine.AddObject("object", [0,0], 0, 1, [0,1,2,0,4,2]);

engine.BindBuffers();
engine.Draw();

document.MoveCamera = (vector2) => {
    engine.move_camera(vector2);
    engine.Draw();
}