import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import http from "http";
import { Socket, Server as SocketIOServer } from "socket.io";
import SocketProcessHandler from "./Controllers/socket.processes";
import mongodbDatabase from "./Database/mongoDB";
import router from "./Routes";
import { SocketCount } from "./logic/socket.count";
dotenv.config();

class Server {
    private app: express.Application;
    private mongodb: typeof mongodbDatabase | undefined;
    private httpServer: http.Server;
    private io: SocketIOServer;

    constructor() {
        this.app = express();
        this.httpServer = http.createServer(this.app);
        this.io = new SocketIOServer(this.httpServer, {
            cors: {
                origin: "http://localhost:3000",
                methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
                credentials: true,
                allowedHeaders: ["Authorization", "Content-Type"],
            },
        });
        this.app.set("socketService", this.io);
        this.middleware();
        this.nullRoute();
        this.handleSIGINT();
        this.connectDB();
        this.routes();
        this.setupSocketIO();
    }

    setupSocketIO() {
        this.io.on("connection", (socket: Socket) => {
            console.log(`🤝 New client connected: ${socket.id}`);
            SocketCount.setVoterCount();

            const SocketHandlerObj = new SocketProcessHandler(this.io, socket);
            SocketHandlerObj.handlePaths();

            socket.on("disconnect", () => {
                console.log(`👋 Client disconnected: ${socket.id}`);
                SocketCount.removeVoter(socket.id);
                SocketCount.decreaseVoterCount();
            });
        });
    }

    middleware() {
        this.app.use(express.json());
        this.app.use(
            cors({
                origin: "http://localhost:3000", // Adjust to your React app's URL
                methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
                credentials: true,
                allowedHeaders: ["Authorization", "Content-Type"],
            })
        );
    }

    connectDB() {
        this.mongodb = mongodbDatabase;
        this.mongodb.connect();
    }

    nullRoute() {
        this.app.get("/", (_, res) => {
            res.send("Hello World");
        });
    }

    routes() {
        this.app.use(router);
    }

    start() {
        try {
            if (!process.env.PORT) throw new Error("Port is not defined");

            this.httpServer.listen(process.env.PORT, () => {
                console.log(
                    `🟢 API Server is running on port ${process.env.PORT}`
                );
                console.log(
                    `🟢 Socket.io Server is running on port ${process.env.PORT}`
                );
            });

            this.handleRestart();
            this.handleExit();
            this.handleSIGINT();
            this.handleUncaughtError();
        } catch (error: any) {
            console.log("🔴 Error in start server: ", error.message);
            this.handleUncaughtError();
        }
    }

    handleRestart() {
        process.on("SIGUSR2", async () => {
            console.error("❌ SIGUSR2 received, shutting down...");
            if (this.mongodb) await this.mongodb.closeConnection();
            process.exit(0);
        });
    }

    handleExit() {
        process.on("exit", async () => {
            console.error("❌ Server is exiting...");
            if (this.mongodb) await this.mongodb.closeConnection();
        });
    }

    handleSIGINT() {
        process.on("SIGINT", async () => {
            console.error("❌ SIGINT received, shutting down...");
            if (this.mongodb) await this.mongodb.closeConnection();
            process.exit(0);
        });
    }

    handleUncaughtError() {
        process.on("uncaughtException", (error) => {
            console.error("❌ There was an uncaught error", error);
            if (this.mongodb) this.mongodb.closeConnection();
            process.exit(1);
        });
    }
}

const server = new Server();
server.start();
