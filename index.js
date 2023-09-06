let textArea = document.getElementById("contents");
let ABC101 = document.getElementById("ABC101");
let messageslist = ["hello", "hi", "stop clicking", "stop", "no really stop"];
let indexarr = 0;
function onclicked()
{
    if(indexarr  >= messageslist.length-1) indexarr = 0;
    textArea.textContent = messageslist[indexarr];
    indexarr++;
}

let isHolding = false;
let holdElement = document.createElement("div");
holdElement.className = "HoldElement";
holdElement.addEventListener("mousedown", (event) =>
{
    isHolding = true;
});
holdElement.addEventListener("mouseup", (event) =>
{
    isHolding = false;
});
ABC101.clientTop = "100px";

let posXMouse = 0;
let posYMouse = 0;
document.onmousemove = (event) => {
    posXMouse = event.x;
    posYMouse = event.y;
};

window.setInterval(() => {
    if(isHolding)
    {
        ABC101.style.top = posYMouse + (ABC101.getBoundingClientRect().y - holdElement.getBoundingClientRect().y)-15 + "px";
        ABC101.style.left = posXMouse + (ABC101.getBoundingClientRect().x - holdElement.getBoundingClientRect().x)-150 +"px";
    }
}, 1000 / 60);

ABC101.append(holdElement);