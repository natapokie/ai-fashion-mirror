import { Server, Socket } from "socket.io";
import { CameraService } from "../services/cameraService";

export class SocketManager {

    io: Server;
    sockets: Map<string, Socket>;
    cameraService: CameraService;

    constructor(io: Server) {
        this.io = io;
        // keep track of all clients connections
        this.sockets = new Map();

        this.cameraService = new CameraService();

        this.initSocketEvents();
    }

    initSocketEvents() {
        console.log('initSocketEvent')
        this.io.on('connection', (socket: Socket) => {
            console.log(`Socket ${socket.id} connected.`);
            
            // on connect, add socket to map
            this.sockets.set(socket.id, socket);

            // register events
            this.registerEvents(socket);

            socket.on('disconnect', () => {
                // on disconnect remove socket from Map
                console.log(`Socket ${socket.id} disconnected.`);
                this.sockets.delete(socket.id)
            });
        });
    }

    registerEvents(socket: Socket) {
        console.log('Register socket events')
        // handle all socket events
        socket.on("take_photo", async () => {
            const data = await this.cameraService.takePhoto(socket);

            console.log('Received data', data)

            // emit event to all connected sockets
            if (data?.apiResponse) {
                console.log('Recived API Response')
                this.io.emit("api_response", JSON.stringify(data.apiResponse));
            }

            if (data?.encodedImg) {
                console.log('Received encoded Img')
                this.io.emit("send_photo", data.encodedImg);
            }
        });
    }

    addSocket(socket: Socket) {
        this.sockets.set(socket.id, socket);

        socket.on('disconnect', () => {
            console.log(`Socket ${socket.id} disconnected.`);
            this.sockets.delete(socket.id)
        });
    }



}