// holds all elements for interaction such as window grab and resize!!
// accessed with elementArray[element][read_below]
// [0] the full window [1] the window grabber [2] initial position vector2 object [3] resizing element
// edit: me from future here. wow, this looks garbage. thank you me from the 1 line above, without you i'd take a long time to figure out
// it made me realize why typescript is a thing
let elementArray = [];
let chosenElement = null;

// x and y distance between mouse and window dragger for the proper mouse offset; changed at the moment you grab object
let distancee = {};
// mouse button down state
let isHolding = false;
let isHoldingResize = false;

let posXMouse = 0;
let posYMouse = 0;

function ResetMouse(){
    isHolding = false;
    isHoldingResize = false;
    chosenElement = null;
}
document.addEventListener("mouseup", ResetMouse)
document.addEventListener("touchend", ResetMouse)

function HolderSetEvent(event){
    event.preventDefault();
    isHolding = true;
    let i = 0;
    if(event.type == "touchstart"){
        posXMouse = event.touches[0].pageX;
        posYMouse = event.touches[0].pageY;
    }
    elementArray.forEach((element)=>
    {
        element[0].style.zIndex = 0;
        if(event.target == element[1]){
            element[0].style.zIndex = 1;
            chosenElement = i;
            distancee = {x: elementArray[chosenElement][1].getBoundingClientRect().x - posXMouse + window.scrollX, y: elementArray[chosenElement][1].getBoundingClientRect().y - posYMouse + window.scrollY};
            return;
        }
        i++;
    }) 
}

function ResizeSetEvent(event){
    event.preventDefault();
    isHoldingResize = true;
    
    if(event.type == "touchstart"){
        posXMouse = event.touches[0].pageX;
        posYMouse = event.touches[0].pageY;
    }

    // used for adding element to elementArray array, i is used as index. might be a bad idea
    let i = 0;
    elementArray.forEach((element)=>
    {
        /* makes the chosen element above every other element; 
            also finds what element is chosen and sets its index in elementArray as chosen element; 
            besides that adds initial distance between mouse and the resizable object for purposes of locating it exactly at where you clicked. almost. it doesn't work as intended as it picks opposite from where clicked inside the ball????*/
        element[0].style.zIndex = 0;
        if(event.target == element[3]){
            element[0].style.zIndex = 1;
            chosenElement = i;
            
            // allows mouse to stay in place without instnatly moving. this line of code works by the power of miracle.  
            distancee = {x: posXMouse - elementArray[chosenElement][3].getBoundingClientRect().x - elementArray[chosenElement][3].getBoundingClientRect().width - window.scrollX, 
                y: posYMouse - elementArray[chosenElement][3].getBoundingClientRect().y - elementArray[chosenElement][3].getBoundingClientRect().height + window.scrollY};
            return;
        }       
        i++;
    }) 
}

const FPS = 60;
function InitUpdate()
{
    document.onmousemove = (event) => {
        posXMouse = event.pageX;
        posYMouse = event.pageY;
    };
    document.ontouchmove = (event) =>
    {
        const touches = event.changedTouches;
        posXMouse = touches[0].pageX;
        posYMouse = touches[0].pageY;
    }

    window.setInterval(() => {
        if(chosenElement !== null)
        {
            if(isHolding)
            {
                elementArray[chosenElement][0].style.top = posYMouse + (elementArray[chosenElement][0].getBoundingClientRect().y - elementArray[chosenElement][1].getBoundingClientRect().y) + distancee.y + "px";
                elementArray[chosenElement][0].style.left = posXMouse + distancee.x + "px";
            }   

            if(isHoldingResize)
            {
                elementArray[chosenElement][0].style.height = (posYMouse - distancee.y) - elementArray[chosenElement][0].getBoundingClientRect().y + scrollY + "px";
                elementArray[chosenElement][0].style.width = (posXMouse - distancee.x) - elementArray[chosenElement][0].getBoundingClientRect().x - scrollX + "px";
            }
            
            if(elementArray[chosenElement][0].getBoundingClientRect().y + elementArray[chosenElement][0].offsetHeight <= 0)
            {
                elementArray[chosenElement][0].style.top = 0  + "px";
            }
            if(elementArray[chosenElement][0].getBoundingClientRect().x + elementArray[chosenElement][0].offsetWidth <= 7)
            {
                elementArray[chosenElement][0].style.left = 8 - elementArray[chosenElement][0].clientWidth + "px";
            }
        }
        
    }, 1000 / FPS);
}

function AppendHolder(elementToAppendTo, isCloseable, isResizeable = true, width=600)
{
    if(elementToAppendTo.className == "vWindow"){
        alert("already window");
        return;
    }
    
    // apply necessary styling to our element
    elementToAppendTo.style.position = "absolute";
    elementToAppendTo.style.userSelect = "none";
    elementToAppendTo.className = "vWindow";
    elementToAppendTo.style.width = width + "px";

    // create element for dragging the window
    let holdElement = document.createElement("div");
    holdElement.className = "HoldElement";

    // for reset position button, probably not needed anymore
    let initialPosition = {
        xPos: elementToAppendTo.getBoundingClientRect().x,
        yPos: elementToAppendTo.getBoundingClientRect().y
    }
    if(isCloseable === true)
    {
        // it doesn't seem to remove the element from elementArray
        let closeButton = document.createElement("div");
        closeButton.style.width = 24 + "px";
        closeButton.style.height = 24 + "px";
        closeButton.style.backgroundColor = "black";
        closeButton.style.position = "absolute";

        // my attempt to make the resize fit inside close button if you resize it to 0 height
        closeButton.style.right = "-2px";
        closeButton.style.top = "8px";
        closeButton.addEventListener("mousedown", (event) => closeButton.parentNode.parentNode.remove());
        closeButton.addEventListener("touchend", (event) => closeButton.parentNode.parentNode.remove());
        holdElement.append(closeButton);
    }

    // element for resizing window
    let resizeElement
    if(isResizeable)
    {
        resizeElement = document.createElement("div");
        resizeElement.className = "resizeElement";
        resizeElement.style.width = 20 + "px";
        resizeElement.style.height = 20 + "px";
        resizeElement.style.backgroundColor = "green";
        resizeElement.style.position = "absolute";
        resizeElement.style.bottom = "0px";
        resizeElement.style.right = "0px";
        resizeElement.addEventListener("mousedown", ResizeSetEvent);
        resizeElement.addEventListener("touchstart", ResizeSetEvent);

        elementToAppendTo.append(resizeElement);
    }

    elementArray.push([elementToAppendTo, holdElement, initialPosition, resizeElement]);

    //same as resizing element but for dragging it (for hold element)
    holdElement.addEventListener("mousedown", HolderSetEvent);
    holdElement.addEventListener("touchstart", HolderSetEvent);

    elementToAppendTo.insertBefore(holdElement, elementToAppendTo.firstChild);
}
InitUpdate();