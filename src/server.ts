import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());

io.on("connection", (socket: Socket) => {
    console.log("✅ A user connected");

    socket.on("poll", (data: any) => {
        console.log("Received poll data:", data);

        io.emit("poll", data);
    });

    socket.on("pollResult", (data: any) => {
        console.log("Received poll result:", data);

        // @ts-ignore
        const existingVotes = socket.handshake.session.votes || {};
        let votes = Object.assign({}, existingVotes, data);

        // @ts-ignore
        socket.handshake.session = { votes };
        socket.broadcast.emit("pollResult", data);
    });

    socket.on("disconnect", () => {
        console.log("❌ A user disconnected");
    });
});

if (process.env.WEBSOCKET_PORT === undefined) {
    console.log("WEBSOCKET_PORT is not defined in the .env file");
    process.exit(1);
}

server.listen(parseInt(process.env.WEBSOCKET_PORT), () => {
    console.log(
        `🟢 WebSocket server is running on port ${process.env.WEBSOCKET_PORT}`
    );
});
