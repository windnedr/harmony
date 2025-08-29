var harmonyVer = "1.0.0"

const wsUri = "ws://74.197.196.228:8080/";
const output = document.getElementById("output");
const websocket = new WebSocket(wsUri);

var clientName = "Harmony"

var unreads = 0

var username = getCookie("usrnam")

if (username == "" || username == "null"){
  username = prompt("Username (This cannot be changed)")
  document.cookie = "usrnam=" + username
}

var connected = false;
let pingInterval;

function writeToScreen(message) {
  // output.innerHTML += "<p>" + message + "</p>";
  
  var json = JSON.parse(message)
  var div = document.createElement("div")
  div.className = "msgCont"

  if (json.username == "&&HarmonyServer"){
    div.className = "servMsgCont"
    var smsg = document.createElement("p")
    smsg.className = "smsg"
    smsg.innerText = json.message
    div.appendChild(smsg)
  } else {
    var puser = document.createElement("p")
    puser.className = "username"
    puser.innerText = "<"+json.username+"> "
    div.appendChild(puser)

    var pmsg = document.createElement("p")
    pmsg.className = "msg"
    var final = stylizeText(escapeHtml(json.message))
    
    pmsg.innerHTML = final
    div.appendChild(pmsg)

    if (json.username != username){
      var n = new Notification(json.username, {body: json.message})
      document.getElementById("pinger").pause()
      document.getElementById("pinger").currentTime = 0
      document.getElementById("pinger").play()
    }
  }
  console.log(json.date)
  var date = new Date(json.date)
  div.title = date.toLocaleTimeString("en-US")

  var scroll = false
  if( Math.round(output.scrollTop) !== (output.scrollHeight - output.offsetHeight) && !document.hasFocus()){
    div.id = "unread"
    unreads += 1
    document.getElementById("title").innerText = `(${unreads}) ${clientName}`
    document.getElementById("notifBanner").innerText = `${unreads} unread messages.`
    document.getElementById("notifBanner").style = "visibility: visible;"
  } else {
    scroll = true
  }

  output.appendChild(div)
  if (scroll){
    output.scroll({
      top: 1000000,
      left: 0,
      behavior: "smooth"
    })
  }
}

function stylizeText(text){
  var t = text.split(" ")
  var arr = []
  for (let i = 0; i < t.length; i++) {
    const element = t[i];
    var final = element
    // <e:http://example.com/>
    if (element.includes("&lt;e:")){
      console.log(element)
      var url = element.replace("&lt;e:", "").replace("&gt;", "")
      final = `<img class="emoji" src=${url}>`
    }
    // <img:http://example.com>
    if (element.includes("&lt;img:")){
      console.log(element)
      var url = element.replace("&lt;img:", "").replace("&gt;", "")
      final = `<img class="full" src=${url}>`
    }
    arr.push(final)
  }
  var fin = arr.join(' ')
  return fin
}

function testForRead(){
  if (Math.round(output.scrollTop) === (output.scrollHeight - output.offsetHeight)){
    // const elm = document.getElementsByClassName("unread")
    // for (let i = 0; i < elm.length; i++) {
    //   const element = elm[i];
    //   element.className.replace(" unread", "")
    // }
    while (document.getElementById("unread")) {
      document.getElementById("unread").id = ""
    }
    
    unreads = 0
    document.getElementById("title").innerText = `${clientName}`
    document.getElementById("notifBanner").style = "visibility: hidden;"
  }
}

setInterval(testForRead, 500)

function sendMessage(message) {
  var msg = JSON.stringify({
    message: `${message}`, 
    username: `${username}`
  })
  websocket.send(msg);
}

const escapeHtml = unsafe => {
  return unsafe
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

websocket.onopen = (e) => {
  websocket.send("&&j-" + username);
  connected = true
}

websocket.onclose = (e) => {
  var joinmsg = {
    username: "&&HarmonyServer", 
    message: "DISCONNECTED"
  }
  writeToScreen(JSON.stringify(joinmsg))
  connected = false;
};

websocket.onmessage = (e) => {
  writeToScreen(`${e.data}`);
};

websocket.onerror = (e) => {
  var msg = {
    username: "&&HarmonyServer", 
    message: `DISCONNECTED (${e.data})`
  }
  writeToScreen(`${msg}`);
};

function send(){
  sendMessage(document.getElementById("msg-box").value)
  document.getElementById("msg-box").value = ""

  if (Notification.permission === "default"){
    // Notification.requestPermission()
  }
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}

document.body.addEventListener("keyup", (e) => {
  if (e.key == "Enter") {
    send()
  }
})