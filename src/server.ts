import { Result, VuError } from "@variables-ultra/core/result"
import { Api, PostMessageFn } from "./index"
import { Request } from "./request"
import { Response } from "./response"
import { IpcStream } from "./stream"
import { isFunction, isPromise, isStream } from "./utils"

export class IpcServer {
    private ipcStream: IpcStream = new IpcStream()
    private readonly apiMap: Map<string, Api> = new Map<string, Api>([
        [this.ipcStream.name, this.ipcStream],
    ])

    onMessage = this.onMessageEvent.bind(this)

    constructor(
        public postMessageFn: PostMessageFn,
        apiMap?: Map<string, Api>,
    ) {
        this.apiMap = apiMap ?? this.apiMap
    }

    addApi<T extends Api>(api: T) {
        if (this.apiMap.has(api.name)) {
            throw new Error(`api ${api.name} already exists`)
        } else {
            this.apiMap.set(api.name, api)
        }
    }

    private postMessage<T>(response: Response<T>): void {
        this.postMessageFn(response, "*")
    }

    private onMessageEvent(message: any, origin: string) {
        if (Request.isRequest(message)) {
            const request: Request<any> = Request.fromJSON(message)
            this.handleRequest(request).then((response) => {
                if (Response.isResponse(response)) {
                    response.payload = response.payload.toJSON()
                    this.postMessage(response)
                } else {
                    console.error("[vu-ipc/server] onMessageEvent invalid response", response)
                }
            }).catch((error) => {
                if (Response.isResponse(error)) {
                    error.payload = error.payload.toJSON()
                    this.postMessage(error)
                } else {
                    console.error("[vu-ipc/server] onMessageEvent invalid error", error)
                }
                throw error
            })
        } else {
            console.error("[vu-ipc/server] onMessageEvent invalid request", message)
        }
    }

    private async handleRequest<T, R>(request: Request<T>): Promise<Response<R>> {
        try {
            if (Request.isShakeHands(request)) {
                const result: Result<any, VuError> = this.shakeHands(request.payload[0])
                return Response.fromRequest<number, R>(request, result)
            }
            const api = this.apiMap.get(request.api)
            if (!api) {
                return Promise.reject(Response.fromError(request, new VuError(`api ${request.api} not found`)))
            }

            const handler = getHandlerByRequest(api, request)
            if (!isFunction(handler)) {
                return Promise.reject(Response.fromError(request, new VuError(`handler ${request.handler} not found or not a function`)))
            }

            const result = handler.call(api, ...request.payload)
            let responseResult: Result<any, VuError>
            if (isPromise(result)) {
                try {
                    responseResult = await result
                } catch (e) {
                    responseResult = Result.error(new VuError(`${e}`))
                }
            } else if (isStream(result)) {
                try {
                    responseResult = this.ipcStream.start(request, result)
                } catch (e) {
                    responseResult = Result.error(new VuError(`${e}`))
                }
            } else {
                return Promise.reject(Response.fromError(request, new VuError("invalid result")))
            }
            return Response.fromRequest(request, responseResult)
        } catch (e) {
            if (e instanceof VuError) {
                return Promise.reject(Response.fromError(request, e))
            } else {
                return Promise.reject(Response.fromError(request, new VuError(`${e}`)))
            }
        }
    }

    private shakeHands(signature: number): Result<number, VuError> {
        return Result.ok(signature + 1)
    }
}

function getHandlerByRequest<T>(api: Api, request: Request<T>): Function | undefined | null {
    let object: any = api
    let handler: Function | undefined = Object.getOwnPropertyDescriptor(api, request.handler)?.value
    while (object && !isFunction(handler)) {
        object = Object.getPrototypeOf(object)
        handler = Object.getOwnPropertyDescriptor(object, request.handler)?.value
    }
    return handler
}
