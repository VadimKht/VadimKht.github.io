// holds all elements for interaction!!
// [0] the full window [1] the window grabber [2] initial position vector2 object [3] resizing thing
let elementArray = [];
let chosenElement = null;

// x and y distance between mouse and window dragger for the proper mouse offset; changed at the moment you grab object
let distancee = {};
// mouse button down state
let isHolding = false;
let isHoldingResize = false;

let posXMouse = 0;
let posYMouse = 0;

document.addEventListener("mouseup", ()=>{
    isHolding = false;
    isHoldingResize = false;
    chosenElement = null;
})

function InitUpdate()
{
    document.onmousemove = (event) => {
        posXMouse = event.pageX;
        posYMouse = event.pageY;
    };

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
                elementArray[chosenElement][0].style.height = (posYMouse - distancee.y) - elementArray[chosenElement][0].getBoundingClientRect().y + "px";
                elementArray[chosenElement][0].style.width = (posXMouse - distancee.x) - elementArray[chosenElement][0].getBoundingClientRect().x + "px";
            }
            
            if(elementArray[chosenElement][0].getBoundingClientRect().y <= 0)
            {
                elementArray[chosenElement][0].style.top = 0  + "px";
            }
            if(elementArray[chosenElement][0].getBoundingClientRect().x + elementArray[chosenElement][0].offsetWidth <= 7)
            {
                elementArray[chosenElement][0].style.left = 8 - elementArray[chosenElement][0].clientWidth + "px";
            }
        }
        
    }, 1000 / 60);
}

function SetResizeable()
{

}

function AppendHolder(elementToAppendTo, isCloseable, isResizeable = true)
{
    elementToAppendTo.style.position = "absolute";
    elementToAppendTo.style.userSelect = "none";
    let holdElement = document.createElement("div");
    holdElement.className = "HoldElement";

    
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
        closeButton.style.margin = "12px"
        closeButton.addEventListener("mousedown", (event) => closeButton.parentNode.parentNode.remove());
        holdElement.style.display = "flex";
        holdElement.style.justifyContent = "end";
        holdElement.style.alignItems = "center";
        holdElement.append(closeButton);
    }

    let resizeElement
    if(isResizeable)
    {
        let resizeElementContainer = document.createElement("div");
        resizeElementContainer.style.position = "absolute";
        resizeElementContainer.style.bottom = "0";
        resizeElementContainer.style.right = "0";
        resizeElement = document.createElement("div");
        resizeElement.className = "resizeElement";
        resizeElement.style.width = 20 + "px";
        resizeElement.style.height = 20 + "px";
        resizeElement.style.backgroundColor = "green";
        resizeElement.addEventListener("mousedown", (event) =>
        {
            isHoldingResize = true;
            let i = 0;
            elementArray.forEach((element)=>
            {
                element[0].style.zIndex = 0;
                if(event.target == element[3]){
                    element[0].style.zIndex = 1;
                    chosenElement = i;
                    distancee = {x: elementArray[chosenElement][3].getBoundingClientRect().x - posXMouse + window.scrollX, y: elementArray[chosenElement][3].getBoundingClientRect().y - posYMouse + window.scrollY};
                    return;
                }
                i++;
            }) 
        })
        resizeElementContainer.append(resizeElement);
        elementToAppendTo.append(resizeElementContainer);
    }

    elementArray.push([elementToAppendTo, holdElement, initialPosition, resizeElement]);
    holdElement.addEventListener("mousedown", (event) =>
    {
        isHolding = true;
        let i = 0;
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
    });
    

    elementToAppendTo.insertBefore(holdElement, elementToAppendTo.firstChild);
}



// i plan to have each window as a velement type object
class velement{

    constructor(posX, posY)
    {
        
    }

    // returns array of X and Y!!!!
    calculateHolderPosCenter()
    {
        let Vector2 = [];
        Vector2[0] = this.positionOfEntireBar.x - this.positionOfHolderBar.x;
        Vector1[1] = this.positionOfEntireBar.y - this.positionOfHolderBar.y;
        return Vector2;
    }

}