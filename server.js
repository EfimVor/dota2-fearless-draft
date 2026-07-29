const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 8080;
const HOST = process.env.HOST || '0.0.0.0';

const rooms = new Map();

function generateRoomCode() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

function getOrCreateRoom(code) {
    if (!rooms.has(code)) {
        rooms.set(code, {
            code,
            state: null,
            players: new Set(),
            captains: { radiant: null, dire: null },
            createdAt: Date.now()
        });
    }
    return rooms.get(code);
}

function broadcastToRoom(room, message, excludeWs = null) {
    const data = JSON.stringify(message);
    for (const ws of room.players) {
        if (ws !== excludeWs && ws.readyState === 1) {
            ws.send(data);
        }
    }
}

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

function serveStaticFile(res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(data);
    });
}

const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname;

    if (req.method === 'POST' && pathname === '/api/create-room') {
        const code = generateRoomCode();
        getOrCreateRoom(code);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ roomCode: code }));
        return;
    }

    if (req.method === 'GET' && pathname.startsWith('/api/room/')) {
        const code = pathname.split('/').pop();
        const room = rooms.get(code);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            exists: !!room,
            playerCount: room ? room.players.size : 0,
            hasRadiantCaptain: room ? !!room.captains.radiant : false,
            hasDireCaptain: room ? !!room.captains.dire : false
        }));
        return;
    }

    if (req.method === 'GET' && pathname === '/api/status') {
        const roomList = [];
        for (const [code, room] of rooms) {
            roomList.push({
                code,
                playerCount: room.players.size,
                radiantCaptain: room.captains.radiant,
                direCaptain: room.captains.dire
            });
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ rooms: roomList, totalRooms: rooms.size }));
        return;
    }

    let filePath = path.join(__dirname, pathname === '/' ? 'index.html' : pathname);
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            serveStaticFile(res, path.join(__dirname, 'index.html'));
        } else {
            serveStaticFile(res, filePath);
        }
    });
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws, req) => {
    const clientIp = req.socket.remoteAddress;
    console.log(`Новое соединение: ${clientIp}`);

    let currentRoom = null;

    ws.on('message', (rawData) => {
        let msg;
        try {
            msg = JSON.parse(rawData.toString());
        } catch (e) {
            ws.send(JSON.stringify({ type: 'ERROR', message: 'Неверный JSON' }));
            return;
        }

        switch (msg.type) {
            case 'CREATE_ROOM': {
                const code = generateRoomCode();
                const room = getOrCreateRoom(code);
                if (currentRoom) currentRoom.players.delete(ws);
                currentRoom = room;
                room.players.add(ws);
                ws.send(JSON.stringify({
                    type: 'ROOM_CREATED',
                    roomCode: code,
                    playerCount: room.players.size,
                    captains: room.captains,
                    state: room.state
                }));
                console.log(`Комната создана: ${code} (игроков: ${room.players.size})`);
                break;
            }

            case 'JOIN_ROOM': {
                const code = msg.roomCode;
                if (!code || !rooms.has(code)) {
                    ws.send(JSON.stringify({ type: 'ERROR', message: 'Комната не найдена' }));
                    return;
                }
                const room = rooms.get(code);
                if (currentRoom) {
                    currentRoom.players.delete(ws);
                    broadcastToRoom(currentRoom, { type: 'PLAYER_LEFT', playerCount: currentRoom.players.size }, ws);
                }
                currentRoom = room;
                room.players.add(ws);
                ws.send(JSON.stringify({
                    type: 'ROOM_JOINED',
                    roomCode: code,
                    playerCount: room.players.size,
                    captains: room.captains,
                    state: room.state
                }));
                broadcastToRoom(room, { type: 'PLAYER_JOINED', playerCount: room.players.size }, ws);
                console.log(`Игрок подключился к комнате ${code} (игроков: ${room.players.size})`);
                break;
            }

            case 'CLAIM_CAPTAIN': {
                if (!currentRoom) { ws.send(JSON.stringify({ type: 'ERROR', message: 'Вы не в комнате' })); return; }
                const { team, name } = msg;
                if (currentRoom.captains[team]) {
                    ws.send(JSON.stringify({ type: 'ERROR', message: `Капитан ${team} уже выбран` }));
                    return;
                }
                currentRoom.captains[team] = name;
                broadcastToRoom(currentRoom, { type: 'CAPTAIN_CLAIMED', team, name, captains: currentRoom.captains });
                break;
            }

            case 'LEAVE_CAPTAIN': {
                if (!currentRoom) return;
                const { team } = msg;
                currentRoom.captains[team] = null;
                broadcastToRoom(currentRoom, { type: 'CAPTAIN_LEFT', team, captains: currentRoom.captains });
                break;
            }

            case 'SYNC_STATE': {
                if (!currentRoom) return;
                currentRoom.state = msg.state;
                const stateMsg = { type: 'STATE_SYNC', state: msg.state, captains: currentRoom.captains };
                for (const w of currentRoom.players) {
                    if (w.readyState === 1) w.send(JSON.stringify(stateMsg));
                }
                break;
            }

            case 'TIMER_SYNC': {
                if (!currentRoom) return;
                broadcastToRoom(currentRoom, {
                    type: 'TIMER_TICK',
                    timerData: msg.timerData
                }, ws);
                break;
            }

            case 'GAME_ACTION': {
                if (!currentRoom) return;
                if (msg.action && msg.action.type === 'new_series' && msg.action.serializedState) {
                    currentRoom.state = msg.action.serializedState;
                }
                broadcastToRoom(currentRoom, { type: 'GAME_ACTION', action: msg.action, captains: currentRoom.captains }, ws);
                break;
            }

            default:
                ws.send(JSON.stringify({ type: 'ERROR', message: 'Неизвестный тип сообщения' }));
        }
    });

    ws.on('close', () => {
        if (currentRoom) {
            currentRoom.players.delete(ws);
            broadcastToRoom(currentRoom, { type: 'PLAYER_LEFT', playerCount: currentRoom.players.size }, ws);
        }
    });

    ws.on('error', (err) => console.error('WebSocket ошибка:', err.message));
});

setInterval(() => {
    const now = Date.now();
    for (const [code, room] of rooms) {
        let hasActive = false;
        for (const ws of room.players) {
            if (ws.readyState === 1) { hasActive = true; break; }
        }
        if (!hasActive && now - room.createdAt > 30 * 60 * 1000) {
            rooms.delete(code);
            console.log(`Комната ${code} удалена (неактивна 30 мин)`);
        }
    }
}, 10 * 60 * 1000);

server.listen(PORT, HOST, () => {
    console.log(`\n⚔️  Dota 2 Fearless Draft Server запущен на http://${HOST}:${PORT}\n`);
});
