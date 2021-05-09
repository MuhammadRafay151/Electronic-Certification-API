module.exports = class Socket {
    constructor(io, SocketMap) {

        if (!Socket._instance) {
            if (io === null || SocketMap === null) {
                return null
            }
            Socket._instance = this;
            this.io = io
            this.SocketMap = SocketMap
        }
        return Socket._instance;
    }
    emitToSocketId(SocketId, Event, obj) {
        this.io.sockets.to(SocketId).emit(Event, obj);
    }
    emitToUserId(UserId, Event, obj) {
        //find user obj in map if found than emit to its socket id
        let SocketId = this.SocketMap[UserId]
        if (SocketId)
            this.io.sockets.to(SocketId).emit(Event, obj);
    }
}
