import Joi from "joi";

export const newPollValidator = Joi.object({
    question: Joi.string().required(),
    options: Joi.object().pattern(Joi.string(), Joi.boolean()).required(),
    answerTime: Joi.number().optional(),
}).custom((value, helper) => {
    const { options } = value;
    const hasMultipleCorrectOptions =
        Object.values(options).filter((option) => option === true).length > 1;

    value.isMultiAnswer = hasMultipleCorrectOptions;

    return value;
});

export const checkPollAnswer = Joi.object({
    question: Joi.string().required(),
    selectedOptions: Joi.array().items(Joi.string()).required(),
    answerTime: Joi.number().optional(),
    isMultiAnswer: Joi.boolean().required(),
});
