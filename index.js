import {InitUpdate, AppendHolder} from "./WindowBananager";

let textArea = document.getElementById("contents");
let ABC101 = document.getElementById("ABC101");
let ABC102 = document.getElementById("ABC102");
let messageslist = ["hello", "hi", "stop clicking", "stop", "no really stop"];
let indexarr = 0;

// mouse button down state
let isHolding = false;

let posXMouse = 0;
let posYMouse = 0;

// window bananager.js function
InitUpdate();

function onclicked()
{
    if(indexarr  >= messageslist.length-1) indexarr = 0;
    textArea.textContent = messageslist[indexarr];
    indexarr++;
}

document.addEventListener("mouseup", ()=>{
    isHolding = false;
    chosenElement = null;
})



AppendHolder(ABC101);
AppendHolder(ABC102);