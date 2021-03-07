const io=require("socket.io-client")
console.log("client here")
let socket=io.connect("mamsteam.fr/app/socket.io")
socket.on("message",(data)=>{
    console.log("received: ",data)
})
socket.on("connect", () => {
    console.log(socket.id); // "G5p5..."
  });
  socket.on("error", (er) => {
    console.log(er); // "G5p5..."
  });