const io=require("socket.io-client")
let socket=io.connect("http://localhost:3000")
socket.on("message",(data)=>{
    console.log("received: ",data)
})