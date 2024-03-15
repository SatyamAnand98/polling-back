export interface ISuccessResponse {
    message: string;
    data: object | object[] | string | boolean;
    meta: {
        error: boolean;
        statusCode?: number;
    };
}

export interface IErrorResponse {
    message: string;
    meta: {
        error: boolean;
        statusCode?: number;
    };
}
