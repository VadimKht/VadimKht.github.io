// holds all elements for interaction!!
let elementArray = [];
let chosenElement = null;

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
                elementArray[chosenElement][0].style.top = posYMouse + (elementArray[chosenElement][0].getBoundingClientRect().y - elementArray[chosenElement][1].getBoundingClientRect().y)-15 + "px";
                elementArray[chosenElement][0].style.left = posXMouse + (elementArray[chosenElement][0].getBoundingClientRect().x - elementArray[chosenElement][1].getBoundingClientRect().x)-150 +"px";
            }
            
            if(elementArray[chosenElement][0].getBoundingClientRect().y + elementArray[chosenElement][0].clientHeight <= 1)
            {
                elementArray[chosenElement][0].style.top = 2 - elementArray[chosenElement][0].clientHeight + "px";
            }
        }
        
    }, 1000 / 60);
}

function AppendHolder(elementToAppendTo)
{
    elementToAppendTo.style.position = "absolute";
    elementToAppendTo.style.userSelect = "none";
    let holdElement = document.createElement("div");
    holdElement.className = "HoldElement";
    elementArray.push([elementToAppendTo, holdElement]);
    holdElement.addEventListener("mousedown", (event) =>
    {
        isHolding = true;
        let i = 0;
        elementArray.forEach((element)=>
        {
            if(event.target == element[1]){
                
                chosenElement = i;
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