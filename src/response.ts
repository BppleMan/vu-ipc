import { Result, VuError } from "@variables-ultra/core/result"
import { MessageSource, MessageType, Request } from "./index"
import { isNil } from "./utils"

export class Response<T> {
    constructor(
        public type: MessageType,
        public source: MessageSource,
        public id: string,
        public payload: Result<T, VuError>,
    ) {
    }

    static isResponse<T>(response: any): response is Response<T> {
        if (!response) {
            return false
        }
        if (typeof response !== "object") {
            return false
        }
        if (response instanceof Response) {
            return true
        }
        return !(!response.type || !response.source || !response.id || isNil(response.payload))
    }

    static fromRequest<T, R>(request: Request<T>, payload: Result<R, VuError>): Response<R> {
        return new Response<R>(
            MessageType.normal,
            MessageSource.main,
            request.id,
            payload,
        )
    }

    static fromError<R>(request: Request<R>, error: VuError): Response<void> {
        return new Response(
            MessageType.normal,
            MessageSource.main,
            request.id,
            Result.error(error),
        )
    }
}
