const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const path = require('path');

let mapState = {}; 
let players = {}; // Храним позиции всех игроков

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    io.emit('online_stats', io.engine.clientsCount);
    socket.emit('init_map', mapState);

    // Принимаем позицию игрока и рассылаем всем
    socket.on('update_position', (data) => {
        players[data.uid] = { lat: data.lat, lng: data.lng, color: data.color };
        io.emit('players_nearby', players);
    });

    socket.on('paint_pixel', (data) => {
        mapState[data.id] = { color: data.color, owner: data.uid };
        io.emit('pixel_updated', data);
    });

    socket.on('disconnect', () => {
        // Удаляем игрока из списка при выходе
        // (Для простоты оставим, пока не обновится онлайн)
        io.emit('online_stats', io.engine.clientsCount);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => { console.log('Server running on ' + PORT); });
