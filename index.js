let root = document.getElementById("root")
let textArea = document.getElementById("contents");
let ABC101 = document.getElementById("ABC101");
let ABC102 = document.getElementById("ABC102");


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

function newWindow()
{
    let size = 36;
    let inputText = document.getElementById("inputText");

    // REALLY bad way to parse text REALLY REALLY bad way REMOVE LATER!!!!!
    let parse = inputText.value.split(' ');
    if(parse[0] + " " + parse[1] + " " + parse[2] + " " + parse[3] == "I want my element");
    {
        if(parse[4] + " " + parse [5] + " " == "to be ")
        {
            if(!isNaN(Number(parse[6])))
            {
                size = Number(parse[6]);
            }
        }

    }
    let newElement = document.createElement("div");
    newElement.innerText = "hello";
    newElement.style.backgroundColor = "darkblue"
    newElement.style.width = size + "px";
    newElement.style.height = size + "px";
    AppendHolder(newElement, true);
    root.appendChild(newElement);
}


ABC101.style.left = window.innerWidth / 4 + "px";
ABC101.style.top = window.innerHeight / 3 + "px";
ABC102.style.left = window.innerWidth / 1.6 + "px";
ABC102.style.top = window.innerHeight / 3 + "px";

AppendHolder(ABC101, false);
AppendHolder(ABC102, true);