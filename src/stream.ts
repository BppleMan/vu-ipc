import { Result, VuError } from "@variables-ultra/core/result"
import { Api, ApiPromise, ApiStreamReader, ApiStreamReadResult } from "./index"
import { Request } from "./request"

export const IpcStreamName = "IpcStream"

export class IpcStream implements Api {
    name: string = IpcStreamName

    private readerMap: Map<string, ApiStreamReader<any>> = new Map<string, ApiStreamReader<any>>()

    start<T>(request: Request<T>, stream: ReadableStream): Result<void, VuError> {
        const reader = stream.getReader()
        this.readerMap.set(request.id, reader)
        return Result.ok(undefined)
    }

    async read<T>(id: string): ApiPromise<ApiStreamReadResult<T>> {
        const reader = this.readerMap.get(id)
        if (!reader) {
            return Result.error(new VuError("stream not found"))
        }
        return new Promise((resolve, reject) => {
            try {
                reader.read().then(({ value, done }) => {
                    resolve(Result.ok({ value, done }))
                }).catch((e) => {
                    if (e instanceof VuError) {
                        reject(e)
                    } else {
                        reject(new VuError(`${e}`))
                    }
                })
            } catch (e) {
                if (e instanceof VuError) {
                    reject(e)
                } else {
                    reject(new VuError(`${e}`))
                }
            }
        })
    }

    async cancel(id: string): ApiPromise<void> {
        const reader = this.readerMap.get(id)
        if (!reader) {
            return Result.error(new VuError("stream not found"))
        }
        return new Promise((resolve, reject) => {
            try {
                reader.cancel().then(() => {
                    resolve(Result.ok(undefined))
                }).catch((e) => {
                    if (e instanceof VuError) {
                        reject(e)
                    } else {
                        reject(new VuError(`${e}`))
                    }
                })
            } catch (e) {
                if (e instanceof VuError) {
                    reject(e)
                } else {
                    reject(new VuError(`${e}`))
                }
            }
        })
    }
}
