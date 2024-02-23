// utility funcs for setting cookies comfortably
function getUTCTimeDur(dur_s)
{
    let time = new Date();
    time.setTime(time.getTime()+dur_s*1000);
    time.toUTCString();
    return time;
}

function getCookieValue(str){
  const value = `; ${document.cookie}`;
  const parts = value.split(`; `);
  let res = "";
  parts.forEach((element) => {
    let elemval = element.split('=');
    if(elemval[0] == str){	
      res = elemval[1];
    }
  });
  return res;
}
function setCookie(key, value, expiration_s){
  if(expiration_s == undefined){
    let string = key + "=" + value + ";SameSite=strict";
    document.cookie = string;
    return;
  }
  let string = key + "=" + value + ";expires=" + getUTCTimeDur(expiration_s).toUTCString() + ";SameSite=strict";
  document.cookie = string;
}
