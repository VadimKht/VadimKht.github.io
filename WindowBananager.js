// holds all elements for interaction!!
// [0] the full window [1] the window grabber [2] initial position vector2 object
let elementArray = [];
let chosenElement = null;

// x and y distance between mouse and window dragger for the proper mouse offset; changed at the moment you grab object first time
let distancee = {};
function InitUpdate()
{
    document.onmousemove = (event) => {
        posXMouse = event.x;
        posYMouse = event.y;
    };

    window.setInterval(() => {
        if(chosenElement !== null)
        {
            if(isHolding)
            {
                elementArray[chosenElement][0].style.top = posYMouse + (elementArray[chosenElement][0].getBoundingClientRect().y - elementArray[chosenElement][1].getBoundingClientRect().y) + distancee.y + "px";
                elementArray[chosenElement][0].style.left = posXMouse + distancee.x + "px";
            }   
            
            if(elementArray[chosenElement][0].getBoundingClientRect().y + elementArray[chosenElement][0].clientHeight <= 7)
            {
                elementArray[chosenElement][0].style.top = 8 - elementArray[chosenElement][0].clientHeight + "px";
            }
            if(elementArray[chosenElement][0].getBoundingClientRect().x + elementArray[chosenElement][0].clientWidth <= 7)
            {
                elementArray[chosenElement][0].style.left = 8 - elementArray[chosenElement][0].clientWidth + "px";
            }
        }
        
    }, 1000 / 60);
}

function AppendHolder(elementToAppendTo)
{
    elementToAppendTo.style.position = "absolute";
    elementToAppendTo.style.userSelect = "none";
    elementToAppendTo.style.whiteSpace = "nowrap";
    let holdElement = document.createElement("div");
    holdElement.className = "HoldElement";
    let initialPosition = {
        xPos: elementToAppendTo.getBoundingClientRect().x,
        yPos: elementToAppendTo.getBoundingClientRect().y
    }
    elementArray.push([elementToAppendTo, holdElement, initialPosition]);
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
                distancee = {x: elementArray[chosenElement][1].getBoundingClientRect().x - posXMouse, y: elementArray[chosenElement][1].getBoundingClientRect().y - posYMouse};
                return;
            }
            i++;
        }) 
    });
    elementToAppendTo.append(holdElement);
    return holdElement;
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