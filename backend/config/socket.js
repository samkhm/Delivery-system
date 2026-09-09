const { Server } = require('socket.io')
const socketAuth = require('../middleware/socketAuth')

let io = null;

const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_ORIGIN,
            methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
            credentials: true
        }
    });

    io.use(socketAuth);

    io.on("connection", (socket) => {        

        const role = socket.user.role
        const  userId = socket.user.id

        socket.join(`user:${userId}`)

        if (role === "retailer"){
            socket.join("retailer");            
        }

        if (role === "dispatcher"){
            socket.join("dispatcher")
        }

        if (role === "rider"){
            socket.join("rider")
        }
    })    

    return io;
};

const getIO = () => {
    if (!io){
        throw new Error("Socket.Io has not been initialized")
    }

    return io;
}

module.exports = {
    initializeSocket,
    getIO
}