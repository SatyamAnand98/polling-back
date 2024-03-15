import mongoose from "mongoose";

export const pollOptionsSchema = new mongoose.Schema(
    {
        option: {
            type: String,
            required: true,
        },
        votes: {
            type: Number,
            required: false,
            default: 0,
        },
        isCorrect: {
            type: Boolean,
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

export const pollSchema = new mongoose.Schema(
    {
        question: {
            type: String,
            required: true,
            index: true,
        },
        options: {
            type: [mongoose.Types.ObjectId],
            required: true,
            ref: "PollOptions",
        },
        isMultiAnswer: {
            type: Boolean,
            required: true,
        },
        answerTime: {
            type: Number,
            required: true,
            default: 120,
        },
        votes: {
            type: Number,
            required: false,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);
