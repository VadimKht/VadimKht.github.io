let root = document.getElementById("root")
let textArea = document.getElementById("contents");
let ABC101 = document.getElementById("ABC101");
let ABC102 = document.getElementById("ABC102");

// window manager.js function
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
    let contents = "hello";
    let isResizeable = true;
    let inputText = document.getElementById("inputText");

    // parse parameters for making new windows
    let parse = inputText.value.split(' ');
    console.log(parse);
    if(parse[0] == "size");
    {
        if(!isNaN(Number(parse[1])))
        {
            size = Number(parse[1]);
            if(parse[2] == "text"){
                contents = parse[3];
            }
        }
    }
    if(parse.find((element) => element == "noresize")) isResizeable = false;

    let newElement = document.createElement("div");
    newElement.innerText = contents;
    newElement.style.backgroundColor = "darkblue"
    newElement.style.width = size + "px";
    newElement.style.height = size + "px";
    AppendHolder(newElement, true, isRezieable = isResizeable);
    root.appendChild(newElement);
}


ABC101.style.left = window.innerWidth / 4 + "px";
ABC101.style.top = window.innerHeight / 3 + "px";
ABC102.style.left = window.innerWidth / 1.6 + "px";
ABC102.style.top = window.innerHeight / 3 + "px";

AppendHolder(ABC101, false);
AppendHolder(ABC102, true);