// Insert inside update and have a special timer.Actions function


let time1 = new Date().getTime();
let duration = 2;
let time2 = time1 + duration * 1000;

let ShouldActionsBeCalled = false;

// override in project
function Actions()
{

}
function Update()
{
    if(new Date().getTime() >= time2)
    {
        Actions();
        time1 = time2;
        time2 = time1 + duration * 1000;
    }
}