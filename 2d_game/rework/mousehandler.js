export let xMouse = 0;
export let yMouse = 0;

function onMouseUpdate(e) {
    xMouse = e.pageX;
    yMouse = e.pageY;
};
export default function _handlemouse()
{
    const rectpos = canvas.getBoundingClientRect();
    document.addEventListener('mousemove', onMouseUpdate, false);
  
}