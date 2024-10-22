import { v4 as uuidV4 } from "uuid"
import { MessageSource, MessageType } from "./index"
import { IpcStreamName } from "./stream"
import { isArray } from "./utils"

const ShakeHandsApi = "ShakeHands"

export class Request<T> {
    id: string

    constructor(
        public type: MessageType,
        public source: MessageSource,
        public api: string,
        public handler: string,
        public payload: T[],
        id?: string,
    ) {
        this.id = id ?? uuidV4()
    }

    static fromJSON<T>(json: Request<T>): Request<T> {
        return new Request(
            json.type,
            json.source,
            json.api,
            json.handler,
            json.payload,
            json.id,
        )
    }

    static isRequest<T>(request: any): request is Request<T> {
        if (!request) {
            return false
        }
        if (typeof request !== "object") {
            return false
        }
        if (request instanceof Request) {
            return true
        }
        return !(!request.type || !request.source || !request.api || !request.handler || !isArray(request.payload))
    }

    static shakeHands(signature: number): Request<number> {
        return new Request(
            MessageType.normal,
            MessageSource.ui,
            ShakeHandsApi,
            ShakeHandsApi,
            [signature],
        )
    }

    static isShakeHands(request: Request<any>): request is Request<number> {
        return request.api === ShakeHandsApi && request.handler === ShakeHandsApi
    }

    static request<T>(api: string, handler: string, data: T[]): Request<T> {
        return new Request(
            MessageType.normal,
            MessageSource.ui,
            api,
            handler,
            data,
        )
    }

    static stream<T>(api: string, handler: string, data: T[]): Request<T> {
        return new Request(
            MessageType.stream,
            MessageSource.ui,
            api,
            handler,
            data,
        )
    }

    static readStream(id: string): Request<string> {
        return new Request(
            MessageType.stream,
            MessageSource.ui,
            IpcStreamName,
            "read",
            [id],
        )
    }

    static cancelStream(id: string): Request<string> {
        return new Request(
            MessageType.stream,
            MessageSource.ui,
            IpcStreamName,
            "cancel",
            [id],
        )
    }
}
