import { Result, VuError } from "@variables-ultra/core/result"
import { ApiStream, ApiStreamReadResult, OnMessageFn, PostMessageFn } from "./index"
import { Request } from "./request"
import { Response } from "./response"
import { isNil } from "./utils"

export class IpcClient {
    private executorMap: Map<string, Executor> = new Map<string, Executor>()
    private streamMap: Map<string, Promise<void>> = new Map<string, Promise<void>>()

    onMessage: OnMessageFn = this.onMessageEvent.bind(this)

    constructor(
        public postMessageFn: PostMessageFn,
    ) {
    }

    private postMessage<T>(request: Request<T>): void {
        this.postMessageFn(request, "*")
    }

    async request<T, R>(request: Request<T>): Promise<R> {
        const promise: Promise<R> = new Promise((
            resolve: (result: R) => void,
            reject: (error: VuError) => void,
        ) => {
            this.executorMap.set(request.id, <Executor>{
                resolve: resolve,
                reject: reject,
                request,
                promise: undefined,
            })
            this.postMessage(request)
        }).then((result) => {
            this.executorMap.delete(request.id)
            return result
        }).catch((error) => {
            this.executorMap.delete(request.id)
            throw error
        })
        const executor = this.executorMap.get(request.id)
        if (executor) {
            executor.promise = promise
        }
        return promise
    }

    stream<T, R>(request: Request<T>): ApiStream<R> {
        return new ReadableStream<Result<R, VuError>>({
            start: (controller) => {
                this.streamMap.set(request.id, this.request(request))
            },
            pull: async (controller): Promise<void> => {
                const promise = this.streamMap.get(request.id)
                if (!isNil(promise)) {
                    try {
                        await this.promiseWithTimeout(promise!, 2000)
                    } catch (e) {
                        controller.error(e)
                        this.clearStream(request)
                        return
                    }
                    this.streamMap.delete(request.id)
                }
                const readRequest = Request.readStream(request.id)
                this.request<string, Result<ApiStreamReadResult<R>, VuError>>(readRequest).then((payload) => {
                    payload.when(
                        (result) => {
                            if (result.done) {
                                controller.close()
                                this.clearStream(request)
                            } else {
                                controller.enqueue(result.value)
                            }
                        },
                        (error) => {
                            controller.error(error)
                            this.clearStream(request)
                        },
                    )
                }).catch((error) => {
                    controller.error(error)
                    this.clearStream(request)
                })
            },
            cancel: async () => {
                this.clearStream(request)
                const cancelRequest = Request.cancelStream(request.id)
                await this.request<string, Result<ApiStreamReadResult<R>, VuError>>(cancelRequest)
            },
        })
    }

    async waitAll(): Promise<void> {
        await Promise.all(
            Array.from(this.executorMap.values())
                .map((executor) => executor.promise),
        )
    }

    async shakeHands(): Promise<boolean> {
        const signature = Math.floor(Math.random() * 1000000)
        const result: Result<number, VuError> = await this.request(Request.shakeHands(signature))
        return result.when((result) => result, (error) => {
            console.error("[vu-ipc/client] shakeHands error", error)
            return false
        }) === signature + 1
    }

    private clearStream<T>(request: Request<T>): void {
        if (this.streamMap.has(request.id)) {
            this.streamMap.delete(request.id)
        }
    }

    private promiseWithTimeout(promise: Promise<any>, timeout: number) {
        return Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error("[vu-ipc/client] Operation timed out")), timeout),
            ),
        ])
    }

    private onMessageEvent(message: any, origin: string) {
        const response = message
        if (Response.isResponse(response)) {
            this.handleResponse(response).then().catch()
        } else {
            console.error("[vu-ipc/client] invalid response", response)
        }
    }

    private async handleResponse<T>(response: Response<T>): Promise<void> {
        const executor = this.executorMap.get(response.id)
        if (executor) {
            try {
                const payload = Result.fromJSON(response.payload)
                executor.resolve(payload)
            } catch (e) {
                console.error(`[vu-ipc/client] invalid response: ${e}`)
                executor.reject(new VuError(`[vu-ipc/client] invalid response: ${e}`))
            }
            try {
                const promise = executor.promise
                if (promise) {
                    const _ = await promise
                }
            } catch (e) {
                console.log("try catch")
            }
        }
    }
}

export interface Executor {
    resolve: (value: any) => void
    reject: (reason: VuError) => void
    request: Request<any>
    promise?: Promise<any>
}
