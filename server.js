const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const path = require('path');

let mapState = {}; 

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    // Рассылаем онлайн всем
    io.emit('online_stats', io.engine.clientsCount);

    // Отправляем карту новому игроку
    socket.emit('init_map', mapState);

    // Логика покраски
    socket.on('paint_pixel', (data) => {
        // data.uid - это зашифрованный ID игрока
        mapState[data.id] = { color: data.color, owner: data.uid };
        io.emit('pixel_updated', data);
    });

    socket.on('disconnect', () => {
        io.emit('online_stats', io.engine.clientsCount);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
    console.log('GeoMetka Server LIVE on port ' + PORT);
});
