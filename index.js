let textArea = document.getElementById("contents");
let ABC101 = document.getElementById("ABC101");
let ABC102 = document.getElementById("ABC102");

// mouse button down state
let isHolding = false;

let posXMouse = 0;
let posYMouse = 0;

// window bananager.js function
InitUpdate();

function onclicked()
{
    elementArray.forEach((element)=>{
        element[0].style.top = element[2].yPos + "px";
        element[0].style.left = element[2].xPos + "px";
        element[0].style.zIndex = 0;
    })
}

document.addEventListener("mouseup", ()=>{
    isHolding = false;
    chosenElement = null;
})


ABC101.style.left = window.innerWidth / 4 + "px";
ABC101.style.top = window.innerHeight / 3 + "px";
ABC102.style.left = window.innerWidth / 1.6 + "px";
ABC102.style.top = window.innerHeight / 3 + "px";

AppendHolder(ABC101);
AppendHolder(ABC102);