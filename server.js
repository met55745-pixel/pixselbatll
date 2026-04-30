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
