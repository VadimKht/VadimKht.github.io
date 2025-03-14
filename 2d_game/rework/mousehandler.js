// QA:
// Q: Why is this a separate file
// A: i don't know, it's just a choice made in hurry that i never used again, for some reason

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