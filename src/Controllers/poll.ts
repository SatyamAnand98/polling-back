import { Request, Response } from "express";
import { PollHelper } from "../Helpers/poll";
import { newPollValidator } from "../Validators/poll.validator";
import { EHTTP_STATUS } from "../stores/enums/httpStatusCodes";
import { IPollInput } from "../stores/interfaces/poll.interface";
import {
    IErrorResponse,
    ISuccessResponse,
} from "../stores/interfaces/response.interface";
import { SocketCount } from "../logic/socket.count";

export class Poll {
    static async handleUser(req: Request, res: Response) {
        try {
            const { name, socketId } = req.body;
            SocketCount.addVoter(socketId, name);

            return res.status(EHTTP_STATUS.OK).json({
                success: true,
                message: "Added user to the list",
            });
        } catch (error) {
            console.error(`Error in ${Poll.handleUser.name} - ${error}`);
            return res.status(EHTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: "Internal Server Error",
            });
        }
    }
    static async createPoll(req: Request, res: Response): Promise<void> {
        try {
            const socketService = req.app.get("socketService");
            const data = await newPollValidator.validateAsync(req.body);

            const helperResponse: IPollInput = await PollHelper.createPoll(
                data
            );
            const responseObj: ISuccessResponse = {
                message: "Data has been created successfully.",
                data: helperResponse,
                meta: {
                    error: false,
                    statusCode: EHTTP_STATUS.CREATED,
                },
            };
            if (socketService) {
                socketService.emit("poll", data);
            } else {
                console.error("Socket Service is not defined.");
            }

            res.status(EHTTP_STATUS.CREATED).json(responseObj);
        } catch (err: any) {
            console.log(`Error in ${Poll.createPoll.name} - ${err}`);
            const responseObj: IErrorResponse = {
                message: err.message,
                meta: {
                    error: true,
                    statusCode: EHTTP_STATUS.INTERNAL_SERVER_ERROR,
                },
            };
            res.status(
                err.statusCode ?? EHTTP_STATUS.INTERNAL_SERVER_ERROR
            ).send(responseObj);
        }
    }

    static async checkAnswer(req: Request, res: Response): Promise<void> {
        try {
            const socketService = req.app.get("socketService");
            const data = req.body;

            const response = await PollHelper.checkAnswer(data);
            const responseObj: ISuccessResponse = {
                message: "The answer was checked.",
                data: response,
                meta: {
                    error: false,
                    statusCode: EHTTP_STATUS.OK,
                },
            };

            if (socketService) {
                socketService.emit("checkAnswer", data);
            } else {
                console.error("Socket Service is not defined.");
            }

            res.status(EHTTP_STATUS.OK).json(responseObj);
        } catch (err: any) {
            console.log(`Error in ${Poll.checkAnswer.name} - ${err}`);
            const responseObj: IErrorResponse = {
                message: err.message,
                meta: {
                    error: true,
                    statusCode: EHTTP_STATUS.INTERNAL_SERVER_ERROR,
                },
            };
            res.status(
                err.statusCode ?? EHTTP_STATUS.INTERNAL_SERVER_ERROR
            ).send(responseObj);
        }
    }
}
