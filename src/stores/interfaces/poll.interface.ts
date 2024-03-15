interface IOptions {
    option: string;
    votes: number;
    isCorrect: boolean;
    _id?: string;
    __v?: number;
}

export interface IPoll {
    question: string;
    options: IOptions[];
    isMultiAnswer: boolean;
    answerTimer: number;
    _id?: string;
    __v?: number;
}

export interface IPollInput {
    question: string | Object | Record<string, string>;
    options: Record<string, boolean> | string[] | Record<string, string>[];
    isMultiAnswer: boolean;
    answerTime: number;
}

export interface ICheckAnswer {
    question: string;
    selectedOptions: string[];
    answerTime?: number;
    isMultiAnswer?: boolean;
}
