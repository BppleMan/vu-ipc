import { Result, VuError } from "@variables-ultra/core/result"
import { ApiPromise, ApiStream } from "../../.."
import { IpcTestApi, NormalWithParams } from "../api"

export class IpcTestApiServer extends IpcTestApi {
    async normal(): ApiPromise<string> {
        return Result.ok(IpcTestApi.NormalReturn)
    }

    async normalWithParams(
        param1: string,
        param2: number,
        param3: string | undefined,
        param4: boolean,
        param5: string[],
        param6: number[],
        param7: Map<number, string>,
        param8: Set<string>,
        param9: { [key: string]: string },
        param10?: string,
    ): ApiPromise<NormalWithParams> {
        return Result.ok({
            param1,
            param2,
            param3,
            param4,
            param5,
            param6,
            param7,
            param8,
            param9,
            param10,
        })
    }

    async normalReturnError(): ApiPromise<void> {
        return Result.error(IpcTestApi.NormalReturnError)
    }

    stream(): ApiStream<string> {
        let count: number = 0
        return new ReadableStream<Result<string, VuError>>({
            start: (controller) => {
                count = 0
            },
            pull: (controller) => {
                if (count < 10) {
                    controller.enqueue(Result.ok(`stream count: ${count}`))
                    count += 1
                } else {
                    controller.close()
                }
            },
        })
    }

    streamReturnError(): ApiStream<string> {
        let count: number = 0
        return new ReadableStream<Result<string, VuError>>({
            start: (controller) => {
                count = 0
            },
            pull: (controller) => {
                if (count < 10) {
                    if (isOdd(count)) {
                        controller.enqueue(Result.ok(`stream count: ${count}`))
                    } else {
                        controller.enqueue(Result.error(new VuError(`stream count: ${count} is even`)))
                    }
                    count += 1
                } else {
                    controller.close()
                }
            },
        })
    }

    streamThrowError(): ApiStream<string> {
        let count: number = 0
        return new ReadableStream<Result<string, VuError>>({
            start: (controller) => {
                count = 0
            },
            pull: (controller) => {
                if (count < 10) {
                    if (isOdd(count)) {
                        controller.enqueue(Result.ok(`stream count: ${count}`))
                    } else {
                        throw new VuError(`stream count: ${count} is even`)
                    }
                    count += 1
                } else {
                    controller.close()
                }
            },
        })
    }
}

// n will be a signed integer
function isOdd(n: number): boolean {
    return n % 2 !== 0
}
