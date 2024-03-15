import {
    pollModel,
    pollOptionsModel,
} from "../Database/store/models/poll.model";
import { SocketCount } from "../logic/socket.count";
import { ICheckAnswer, IPollInput } from "../stores/interfaces/poll.interface";

export class PollHelper {
    static async previousPolls(count: number) {
        try {
            const questions = await pollModel
                .find({})
                .sort({ createdAt: -1 })
                .limit(count)
                .populate({
                    path: "options",
                    model: "PollOptions",
                });

            const response = questions.map((question: any) => {
                const options = question.options.map((option: any) => {
                    return {
                        option: option.option,
                        votes: option.votes,
                    };
                });

                return {
                    question: question.question,
                    options,
                };
            });
            return response;
        } catch (error) {
            console.error(
                `Error in Helper ${PollHelper.previousPolls.name} - ${error}`
            );
            throw error;
        }
    }
    static async createPoll(data: IPollInput): Promise<IPollInput> {
        try {
            const previousQuestions: any = await pollModel
                .findOne({})
                .sort({ createdAt: -1 });
            if (previousQuestions) {
                if (
                    previousQuestions.votes < SocketCount.getVoterCount() &&
                    new Date(
                        (previousQuestions.answerTime + 1) * 1000 +
                            previousQuestions.createdAt.getTime()
                    ).toISOString() > new Date().toISOString()
                ) {
                    throw new Error("All sockets have not voted yet.");
                }
            }
            const pollOptions = data.options;
            const optionsArray = Object.keys(pollOptions).map((key: string) => {
                return new pollOptionsModel({
                    option: key,
                    // @ts-ignore
                    isCorrect: pollOptions[key] as boolean,
                });
            });

            const optionArray_ids = optionsArray.map((option) => {
                return {
                    [option.option]: option._id.toString(),
                };
            });

            const poll = new pollModel({
                question: data.question,
                options: optionsArray.map((option) => option._id),
                isMultiAnswer: data.isMultiAnswer,
                answerTime: data.answerTime,
            });

            data.question = {
                [data.question.toString()]: poll._id.toString(),
            };
            data.options = optionArray_ids;

            const session = await pollModel.startSession();
            session.startTransaction();

            try {
                await poll.save({ session });
                await pollOptionsModel.insertMany(optionsArray, {
                    session,
                });
                await session.commitTransaction();
            } catch (error) {
                await session.abortTransaction();
                throw error;
            } finally {
                session.endSession();
            }

            return data;
        } catch (error) {
            console.error(
                `Error in Helper ${PollHelper.createPoll.name} - ${error}`
            );
            throw error;
        }
    }

    static async checkAnswer(data: ICheckAnswer) {
        try {
            let selectedOptions: any[] = [];
            const question: any = await pollModel
                .findByIdAndUpdate(data.question, {
                    $inc: { votes: 1 },
                })
                .populate({
                    path: "options",
                    model: "PollOptions",
                });

            if (!question) {
                throw new Error("Question not found.");
            }

            if (question.answerTime) {
                if (
                    new Date(
                        question.answerTime * 1000 +
                            question.createdAt.getTime()
                    ).toISOString() < new Date().toISOString()
                ) {
                    throw new Error("The answer window has closed.");
                }
            }
            selectedOptions = await question.options.filter((option: any) => {
                return option._id.toString() === data.selectedOptions[0];
            });

            if (question.isMultiAnswer && data.selectedOptions.length > 1) {
                selectedOptions = await question.options.filter(
                    (option: any) => {
                        return data.selectedOptions.some(
                            (selectedOption: any) => {
                                return selectedOption === option._id.toString();
                            }
                        );
                    }
                );
            }

            if (!selectedOptions.length) {
                throw new Error("Option not found.");
            }

            await pollOptionsModel.updateMany(
                { _id: { $in: data.selectedOptions } },
                { $inc: { votes: 1 } }
            );

            if (!question || !selectedOptions) {
                throw new Error("Missing field");
            }

            const correctOptions = question.options.filter((option: any) => {
                return option.isCorrect;
            });

            let isCorrect = false;
            if (question.isMultiAnswer) {
                isCorrect = correctOptions.every((option: any) => {
                    isCorrect = selectedOptions.some((selectedOption: any) => {
                        return (
                            selectedOption._id.toString() ===
                            option._id.toString()
                        );
                    });
                });
            } else {
                isCorrect = selectedOptions.some((selectedOption: any) => {
                    return (
                        selectedOption._id.toString() ===
                        correctOptions[0]._id.toString()
                    );
                });
            }

            return {
                answer: isCorrect ? true : false,
            };
        } catch (error) {
            console.error(
                `Error in Helper ${PollHelper.checkAnswer.name} - ${error}`
            );
            throw error;
        }
    }

    static async pollResult(questionId: string) {
        try {
            const question: any = await pollModel
                .findById(questionId)
                .populate({
                    path: "options",
                    model: "PollOptions",
                });

            if (!question) {
                throw new Error("Question not found.");
            }

            const options = question.options.map((option: any) => {
                return {
                    option: option.option,
                    votes: option.votes,
                };
            });

            return {
                question: question.question,
                options,
            };
        } catch (error) {
            console.error(
                `Error in Helper ${PollHelper.pollResult.name} - ${error}`
            );
            throw error;
        }
    }
}
