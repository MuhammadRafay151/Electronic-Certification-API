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
        let User = this.SocketMap[UserId]
        if (User)
            this.io.sockets.to(User.socket.id).emit(Event, obj);
    }
    emitToRoom(RoomId, Event, obj) {
        this.io.sockets.to(RoomId).emit(Event, obj);
    }

}
