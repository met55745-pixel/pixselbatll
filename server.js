const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const path = require('path');

let mapState = {}; 
const users = {}; 

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    // Отправляем количество людей онлайн
    io.emit('online_stats', io.engine.clientsCount);

    // Авторизация
    socket.on('auth_request', (data) => {
        const { user, pass } = data;
        if (!users[user]) {
            users[user] = pass;
            socket.emit('auth_success', { username: user });
        } else {
            if (users[user] === pass) {
                socket.emit('auth_success', { username: user });
            } else {
                socket.emit('auth_fail', "Неверный пароль!");
            }
        }
    });

    // Инициализация карты для вошедшего
    socket.emit('init_map', mapState);

    // Рисование
    socket.on('paint_pixel', (data) => {
        mapState[data.id] = { color: data.color, owner: data.username };
        io.emit('pixel_updated', data);
    });

    socket.on('disconnect', () => {
        io.emit('online_stats', io.engine.clientsCount);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});
