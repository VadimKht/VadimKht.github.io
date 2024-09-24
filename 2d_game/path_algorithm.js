// todo:
// there is always gonna be normalized AI movement vector. an object will be moving to the current point.
// plan A: make several path patterns and send them to an array of path vectors, once object reaches 
// (avoid walking into walls by checking collisions later)

let MovementVector = {x: 0, y: 0};

/**
 * posA is object that you want to figure out position towards posB, and
 * returns normalized positon towards it i guess
 * @param {{x:Number, y: Number}} posA 
 * @param {{x:Number, y: Number}} posB 
 */
function GetNormalizedPositionToGoal(posA, posB)
{
    // in a situation where it attempts to get to the non existent goal, dont move
    // should really be avoidable inside goal algorithm though.
    if(isNaN(posA.x) || isNaN(posA.y) || isNaN(posB.x) || isNaN(posB.y) || posA == undefined || posA == undefined) return ({x: 0, y: 0});

    // otherwise returns infinity 
    if(posA.x == posB.x && posB.y == posB.y) return {x: 0, y: 0}
    const length = Math.sqrt(Math.pow(posB.x-posA.x,2) + Math.pow(posB.y-posA.y,2));
    return {x:posB.x/length , y: posB.y/length}
}

// i am hungry and it looks like i shouldn't be making these
let Goals = [];
function AddGoal(pos)
{
    Goals.push({x: pos.x, y: pos.y})
}
function RemoveCurrentGoal()
{
    Goals.shift();
    // probably update movement vector
}
function RemoveGoal(id)
{
    Goals.splice(id, 1);
    // probably update movement vector
}
function GetCurrentGoal()
{
    return Goals[0];
}
// by default moves current goal
function MoveGoalspos(vector2, id = 0)
{
    Goals[id].x += vector2.x;
    Goals[id].y += vector2.y;
}

// teleports instead of moving
function TeleportGoalspos(vector2, id = 0)
{
    Goals[id].x = vector2.x;
    Goals[id].y = vector2.y;
}
/**
 * Change movement vector for objPos to move towards it
 * @param {{x:Number, y:Number}} objPos 
 */
function UpdateMovementVector(objPos){
    if(Goals[0])
    {
        MovementVector = GetNormalizedPositionToGoal(objPos, GetCurrentGoal());
    }
}