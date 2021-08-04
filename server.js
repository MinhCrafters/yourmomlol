const path = require('path');
const http = require('http');
const app = express();
const server = http.createServer(app);
const express = require('express');
const socketio = require('socket.io')(server);
const moment = require('moment');

function formatMessage(username, text) {
    const date1 = new Date();
    const date = date1.toLocaleString();
    const month = ('0' + date.getMonth()).slice(0, 2);
    const day = ('0' + date.getDate()).slice(-2);
    const year = date.getFullYear();
    const hour = ('0' + date.getHours()).slice(-2);
    const mins = ('0' + date.getMinutes()).slice(-2);
    const dateString = `${hour}:${mins} - ${day}/${month}/${year}`;
    return {
        username,
        text,
        time: dateString
    };
}

const users = [];

// Join user to chat
function userJoin(id, username, room) {
    const user = { id, username, room };

    users.push(user);

    return user;
}

// Get current user
function getCurrentUser(id) {
    return users.find(user => user.id === id);
}

// User leaves chat
function userLeave(id) {
    const index = users.findIndex(user => user.id === id);

    if (index !== -1) {
        return users.splice(index, 1)[0];
    }
}

// Get room users
function getRoomUsers(room) {
    return users.filter(user => user.room === room);
}

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Chatcord Bot';

// Run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        // Welcome current user
        socket.emit('message', formatMessage(botName, `Welcome to Chatcord, ${user.username}!`));

        // Broadcast when a user connects
        socket.broadcast
            .to(user.room)
            .emit(
                'message',
                formatMessage(botName, `${user.username} has joined the room`)
            );

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // Listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);

        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit(
                'message',
                formatMessage(botName, `${user.username} has left the room`)
            );

            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));