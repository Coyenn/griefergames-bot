import EventEmitter from "events"
import { viewer } from "prismarine-viewer";
import GrieferGamesBot from "./bot";
import express from "express";
import http from "http";
import socketio from "socket.io";
import path from "path";
import compression from "compression";
import MinecraftData from "minecraft-data";
import { Vec3 } from "vec3";

const WorldView = viewer.WorldView;

export default class GrieferGamesViewer {
    public grieferGamesBot: GrieferGamesBot;
    public viewer: EventEmitter;
    public httpServer: http.Server;
    public io: socketio.Server;
    public sockets: any[];
    public primitives: any;

    constructor(grieferGamesBot: GrieferGamesBot) {
        const viewDistance = 6;
        const port = 3000;
        const bot = grieferGamesBot.bot;
        const app = express();
        const mcData = MinecraftData(bot.version);

        this.grieferGamesBot = grieferGamesBot;
        this.viewer = new EventEmitter();
        this.httpServer = http.createServer(app);
        this.io = new socketio.Server(this.httpServer, { path: '/socket.io' });
        this.sockets = [];
        this.primitives = {};

        app.use(compression())
        app.use('/', express.static(path.join(__dirname, '../node_modules/prismarine-viewer/public')))

        this.grieferGamesBot.bot.on('path_update', (r) => {
            const path = [this.grieferGamesBot.bot.entity.position.offset(0, 0.5, 0)]

            for (const node of r.path) {
                path.push(new Vec3(node.x, node.y + 0.5, node.z));
            }

            this.drawLine('path', path, 0xff00ff);
        })

        this.io.on('connection', (socket) => {
            socket.emit('version', bot.version)
            this.sockets.push(socket)

            const worldView = new WorldView(bot.world, viewDistance, bot.entity.position, socket)

            worldView.init(bot.entity.position)
            worldView.listenToBot(bot)

            for (const id in this.primitives) {
                socket.emit('primitive', this.primitives[id])
            }

            function updateBotPosition() {
                const packet = { pos: bot.entity.position, yaw: bot.entity.yaw, addMesh: true, pitch: bot.entity.pitch };

                socket.emit('position', packet)
                worldView.updatePosition(bot.entity.position)
            }

            bot.on('move', () => {
                updateBotPosition()
            })

            socket.on('disconnect', () => {
                bot.removeListener('move', updateBotPosition)
                worldView.removeListenersFromBot(bot)
                this.sockets.splice(this.sockets.indexOf(socket), 1)
            })
        })

        this.httpServer.listen(port, () => {
            console.log('GrieferGames Viewer running on: ' + port);
        })
    }

    public close() {
        this.httpServer.close();

        for (const socket of this.sockets) {
            socket.disconnect();
        }
    }

    public erase(id: any) {
        delete this.primitives[id]

        for (const socket of this.sockets) {
            socket.emit('primitive', { id })
        }
    }

    public drawBoxGrid(id: any, start: any, end: any, color = 'aqua') {
        this.primitives[id] = { type: 'boxgrid', id, start, end, color }

        for (const socket of this.sockets) {
            socket.emit('primitive', this.primitives[id])
        }
    }

    public drawLine(id: any, points: any, color = 0xff0000) {
        this.primitives[id] = { type: 'line', id, points, color }

        for (const socket of this.sockets) {
            socket.emit('primitive', this.primitives[id])
        }
    }

    public drawPoints(id: any, points: any, color = 0xff0000, size = 5) {
        this.primitives[id] = { type: 'points', id, points, color, size }

        for (const socket of this.sockets) {
            socket.emit('primitive', this.primitives[id])
        }
    }
}
