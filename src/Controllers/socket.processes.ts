import { Server as SocketIOServer, Socket } from "socket.io";
import {
    IErrorResponse,
    ISuccessResponse,
} from "../stores/interfaces/response.interface";
import { IPollInput } from "../stores/interfaces/poll.interface";
import { WebSocketController } from "./webSocket.controller";
import { EHTTP_STATUS } from "../stores/enums/httpStatusCodes";
import { SocketCount } from "../logic/socket.count";

class SocketProcessHandler {
    private io: SocketIOServer;
    private socket: Socket;

    constructor(io: SocketIOServer, socket: Socket) {
        this.io = io;
        this.socket = socket;
    }

    handlePaths() {
        this.socket.on("poll", async (data: IPollInput) => {
            try {
                const response: ISuccessResponse =
                    await WebSocketController.createPoll(data);
                this.socket.broadcast.emit("poll", response);
            } catch (error: any) {
                this.handleError("Error in poll event:", error);
            }
        });

        this.socket.on("isTeacher", (data: boolean) => {
            if (data) {
                SocketCount.decreaseVoterCount();
            }
        });

        this.socket.on("previousPolls", async (count: number) => {
            try {
                const response = await WebSocketController.previousPolls(count);
                console.log("Previous Polls:", response);
                this.socket.emit("previousPolls", response);
            } catch (err) {
                this.handleError("Error in previousPolls event:", err);
            }
        });

        this.socket.on("checkAnswer", async (data: any) => {
            try {
                const { responseObj, pollResults } =
                    await WebSocketController.checkAnswer(data);

                this.socket.emit("checkAnswer", {
                    responseObj,
                    pollResults,
                });
                this.socket.broadcast.emit("pollResult", pollResults);
            } catch (error: any) {
                this.handleError("Error in checkAnswer event:", error);
            }
        });
    }

    handleError(message: string, error: any) {
        const response: IErrorResponse = {
            message: error.message,
            meta: {
                error: true,
                statusCode: EHTTP_STATUS.INTERNAL_SERVER_ERROR,
            },
        };
        console.error(message, error);
        this.io.emit("error", response);
    }
}

export default SocketProcessHandler;
