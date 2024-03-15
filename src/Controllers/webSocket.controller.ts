import { PollHelper } from "../Helpers/poll";
import { newPollValidator } from "../Validators/poll.validator";
import { EHTTP_STATUS } from "../stores/enums/httpStatusCodes";
import { ICheckAnswer, IPollInput } from "../stores/interfaces/poll.interface";
import { ISuccessResponse } from "../stores/interfaces/response.interface";

export class WebSocketController {
    static async previousPolls(count: number) {
        try {
            const response = await PollHelper.previousPolls(count);
            const responseObj: ISuccessResponse = {
                message: "Previous polls have been fetched.",
                data: response,
                meta: {
                    error: false,
                },
            };
            return responseObj;
        } catch (error) {
            console.error(
                `Error in ${WebSocketController.previousPolls.name} - ${error}`
            );
            throw error;
        }
    }
    static async createPoll(data: IPollInput) {
        try {
            const pollData = await newPollValidator.validateAsync(data);
            let helperResponse: IPollInput = await PollHelper.createPoll(
                pollData
            );
            const responseObj: ISuccessResponse = {
                message: "Data has been created successfully.",
                data: helperResponse,
                meta: {
                    error: false,
                    statusCode: EHTTP_STATUS.CREATED,
                },
            };
            return responseObj;
        } catch (err) {
            console.log(
                `Error in ${WebSocketController.createPoll.name} - ${err}`
            );
            throw err;
        }
    }

    static async checkAnswer(data: ICheckAnswer) {
        try {
            const response = await PollHelper.checkAnswer(data);
            const responseObj = {
                message: "The answer was checked.",
                data: response,
                meta: {
                    error: false,
                },
            };

            const pollResults = await PollHelper.pollResult(data.question);
            return { responseObj, pollResults };
        } catch (error) {
            console.error(
                `Error in ${WebSocketController.checkAnswer.name} - ${error}`
            );
            throw error;
        }
    }

    static async pollResult(questionId: string) {
        try {
            const response = await PollHelper.pollResult(questionId);
            const responseObj: ISuccessResponse = {
                message: "Poll result has been fetched.",
                data: response,
                meta: {
                    error: false,
                },
            };
            return responseObj;
        } catch (e) {
            console.error(
                `Error in ${WebSocketController.pollResult.name} - ${e}`
            );
            throw e;
        }
    }
}
