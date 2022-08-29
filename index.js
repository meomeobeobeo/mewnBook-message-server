import express from 'express';
import morgan from 'morgan'
import { Server } from 'socket.io'
import http from 'http'


const app = express();
app.use(morgan('combined'));


const server = http.createServer(app);
const io = new Server(server, {
    cors: 'https://meo-book-client.vercel.app',
    maxHttpBufferSize: 1e10
})



const options = { /* ... */ };









// {
//   userId, socketId
// }
let users = []
let activeUsers = []
// Case active open when authencation 
const addActiveUser = (userId, socketId) => {
    if (userId) {
        !activeUsers.some(user => user.userId === userId) &&
        activeUsers.push({ userId, socketId })
    }
    else{
        removeActiveUser(socketId)
    }

}
const removeActiveUser = (socketId) => {
    activeUsers = activeUsers.filter((user) => user.socketId !== socketId);
};
const getActiveUser = (userId) => {
    return activeUsers.find(user => user.userId === userId)
}




// case message 
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


io.on("connection", async (socket) => {
    console.log('user connected')
    io.emit("welcome", "Hello this is socket server")
    // when userAction 
    socket.on('addActiveUser',userId =>{
        addActiveUser(userId, socket.id)
        io.emit('getActiveUser' ,activeUsers)   
    })











   /*   ACTION MESSAGE   */

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
        console.log(messageData)








        const user = getUser(receiverId)
        io.to(user?.socketId).emit("getMessage", {
            senderId: messageData.senderId,
            textMessage: messageData.textMessage,
            createdAt: messageData.createdAt,
            images: messageData.images,
            messageId: messageData.messageId,
        })




    })

    socket.on("deleteMessage", ({
        senderId,

        messageId,
        receiverId,

    }) => {
        const user = getUser(receiverId)
        io.to(user?.socketId).emit("getDeleteMessage", {
            senderId: senderId,
            textMessage: 'message have been deleted',
            createdAt: new Date(),
            images: [],
            messageId: messageId,
        })



    })





    //  user disconnect 
    socket.on("disconnect", (reason) => {
        console.log(reason)
        console.log(`a user disconnected!   ${socket.id}`);
        removeUser(socket.id);
        removeActiveUser(socket.id)
        io.emit("getUsers", users);
        io.emit('getActiveUser' ,activeUsers)  
    });



})




app.get('/', (req, res) => {
    res.send('<h1>Hello this is message server!</h1>');
});

server.listen(process.env.PORT || 8900, () => {
    console.log('listening on Port http://localhost:8900');
});