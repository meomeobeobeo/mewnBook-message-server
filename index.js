const io = require('socket.io')(process.env.PORT||8900, {
    cors: {
        origin: 'http://localhost:3000',
    },
})
console.log('build successfully')

// {
//   userId, socketId
// }
let users = []

const addUser = (userId, socketId) => {
    if (userId) {
        !users.some(user => user.userId === userId) &&
            users.push({ userId, socketId })
    }
}
const getUser = (userId) => {
    return users.find(user => user.userId === userId)
}
const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
};


io.on("connection", (socket) => {
    console.log('user connected')
    io.emit("welcome", "Hello this is socket server")
    socket.on("addUser", userId => {
        addUser(userId, socket.id)
        io.emit("getUsers", users)
    })
    // send and get message content 

    socket.on("sendMessage", ({
        senderId,
        receiverId,
        messageData
        // messageData is object of model message


    }) => {
        







        const user = getUser(receiverId)
        io.to(user?.socketId).emit("getMessage", {
            senderId: messageData.senderId,
            textMessage: messageData.textMessage,
            createdAt: messageData.createdAt,
            images :messageData.images,
            messageId : messageData.messageId,
        })




    })

    socket.on("deleteMessage",({
        senderId,

        messageId,
        receiverId,

    }) => {
        const user = getUser(receiverId)
        io.to(user?.socketId).emit("getDeleteMessage", {
            senderId: senderId,
            textMessage: 'message have been deleted',
            createdAt: new Date(),
            images :[],
            messageId : messageId,
        })
        


    })





    //  user disconnect 
    socket.on("disconnect", () => {
        console.log(`a user disconnected!   ${socket.id}`);
        removeUser(socket.id);
        io.emit("getUsers", users);
    });



})  