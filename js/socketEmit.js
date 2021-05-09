module.exports.SendLogs = function (io, obj) {
    io.to("debugging").emit("log", obj)
}
module.exports.sendMessage = function (io, UserSocketId, obj) {
    io.sockets.to(UserSocketId).emit("message", obj);
}
