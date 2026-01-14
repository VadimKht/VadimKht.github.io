import {addobj, chobj} from "./index.js" 
const wsUrl = "ws://127.0.0.1:8081";
let ws;
let default_nickname = "custom_username";
let uid;
// On character creation save the players info like object  id after object creation
export let playerMap = [];
export function NetworkConnect(nickname = default_nickname, url = wsUrl) 
{
	ws = new WebSocket(url);
	ws.addEventListener("open", ()=>{
		ws.send(JSON.stringify( { op: "authMe", sid: localStorage.getItem("sid"), nickname: nickname } )); 
	}) 
	ws.addEventListener("error", ()=>{
		console.error("Failed to join websocket server!");
	})
	ws.addEventListener("message", (e)=>{
		const response = JSON.parse(e.data);
		switch(response.op){
			case "AUTH_reg":
				localStorage.setItem("sid", response.session_id);
				break;
			case "PLAYER_joined":
				const id = addobj(response.name);
				playerMap.push({uid: response.uid, name: response.nickname, objectId: id});
				break;
			case "TICK":
				const datas = JSON.parse(response.data);
				for(const item of datas)
				{
					if(item.uid != uid)
					{
						const id = FindPlayerIdByName(item.nickname);
						if(id != undefined){
							chobj(id, 0, item.position[0]);
							chobj(id, 1, item.position[1]);
							chobj(id, 2, item.rotation);
						}
					}
					
				}
				break;
			default:
				break;
		}
	})
	uid = localStorage.getItem("uid");
	return 0;
}
function FindPlayerIdByName(name){
	for(const item in playerMap){
		if(item.name == name) return item.objectId;
	}
}

export function NetworkSendRequest(request)
{
	if(!ws){
		console.error("Trying to send request without websocket connection estabilished");
		return;
	}
	if(ws.readyState !== WebSocket.OPEN){
		console.error("Trying to send request with not open connection. The connection state is:");
		console.error(ws.readyState);
		return;
	}
	let stringreq;
	try{
		stringreq = JSON.stringify(request);
	}
	catch(err){
		console.error(err);
		return;
	}
	ws.send(stringreq);
}

export function NetworkDisconnect(){
	if(!ws) return;
	ws.send(JSON.stringify({"op": "DISCONNECT_manual", sid: localStorage.getItem("sid")}));
	ws.close();
	ws = null;
}
