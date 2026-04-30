const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });
const path = require('path');

let mapState = {}; 
let players = {}; 
let socketToUid = {};

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
    io.emit('online_stats', io.engine.clientsCount);
    socket.emit('init_map', mapState);

    socket.on('update_position', (data) => {
        if (!data.uid) return;
        socketToUid[socket.id] = data.uid;
        players[data.uid] = { lat: data.lat, lng: data.lng, color: data.color };
        io.emit('players_nearby', players);
    });

    socket.on('paint_pixel', (data) => {
        mapState[data.id] = { color: data.color, owner: data.uid };
        io.emit('pixel_updated', data);
    });

    socket.on('disconnect', () => {
        const uid = socketToUid[socket.id];
        if (uid) { delete players[uid]; delete socketToUid[socket.id]; }
        io.emit('players_nearby', players);
        io.emit('online_stats', io.engine.clientsCount);
    });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => { console.log(`🚀 RELEASE READY ON PORT ${PORT}`); });
