
// since texture buffer is normalized, it finds position of texture in normalized space

let textureWidthX = 800;
let textureWidthY = 800;

/**
 * Finds X and Y of a texture in normalized texture space,
 * also returns where they end.
 * @param {{x:Number, y:Number}} pos
 * @param {Number} spriteSizePx
 */
function SpriteCoordToTexCoord(pos, spriteSizePx = 16)
{
    const normalizedSpriteSize = {x: (1/textureWidthX)*spriteSizePx, y: (1/textureWidthY)*spriteSizePx};
    const locationX = normalizedSpriteSize.x * pos.x, 
          locationY = normalizedSpriteSize.y * pos.y;
    if(locationX >= 1 || locationY >= 1) console.log("out of bounds");
    return {x: locationX, y: locationY, xEnd: locationX+normalizedSpriteSize.x, yEnd: locationY + normalizedSpriteSize.y}
} 

let currentFrame = 0;
// todo: animations!
// Each call cycle around beginning and ending
// there may be a problem with the fact that current frame is just integer, but i may want to have it as x,y
// because if it overflows x into next y, it won't be right
function GetCurrentAnimationSpriteFrame(frame = currentFrame, animationBeginningSpritePos, animationEndSpritePos, spriteSizePx)
{
    return SpriteCoordToTexCoord(animationBeginningSpritePos.x+currentFrame);
}

function NextFrame(){
    currentFrame += 1;
}