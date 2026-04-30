const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const path = require('path');

let mapState = {}; 

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    socket.emit('init_map', mapState);
    socket.on('paint_pixel', (data) => {
        mapState[data.id] = { color: data.color, owner: data.username };
        io.emit('pixel_updated', data);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});
const users = {}; // В реальности лучше использовать БД, но для начала хватит и этого

io.on('connection', (socket) => {
    
    socket.on('auth_request', (data) => {
        const { user, pass } = data;
        
        if (!users[user]) {
            // Регистрация нового
            users[user] = pass;
            socket.emit('auth_success', { username: user });
        } else {
            // Проверка пароля
            if (users[user] === pass) {
                socket.emit('auth_success', { username: user });
            } else {
                socket.emit('auth_fail', "Неверный пароль для этого ника!");
            }
        }
    });

    // Твои старые обработчики paint_pixel и т.д.
});
