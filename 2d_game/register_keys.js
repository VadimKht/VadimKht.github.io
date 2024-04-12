export function RegisterKeys(keyobj){
    document.addEventListener("keydown", (event) => {
        if (event.key == "a" || event.key == "A" || event.key == "ArrowLeft") {
            keyobj.a = 1;
            return;
        }
        if (event.key == "d" || event.key == "D" || event.key == "ArrowRight") {
            keyobj.d = 1;
            return;
        }
        if (event.key == "w" || event.key == "W" || event.key == "ArrowUp") {
            keyobj.w = 1;
            return;
        }
        if (event.key == "s" || event.key == "s" || event.key == "ArrowDown") {
            keyobj.s = 1;
            return;
        }
      });      
    document.addEventListener("keyup", (event) => {
        if (event.key == "a" || event.key == "A" || event.key == "ArrowLeft") {
            keyobj.a = 0;
            return;
        }
        if (event.key == "d" || event.key == "D" || event.key == "ArrowRight") {
            keyobj.d = 0;
            return;
        }
        if (event.key == "w" || event.key == "W" || event.key == "ArrowUp") {
            keyobj.w = 0;
            return;
        }
        if (event.key == "s" || event.key == "s" || event.key == "ArrowDown") {
            keyobj.s = 0;
            return;
        }
    }); 
}