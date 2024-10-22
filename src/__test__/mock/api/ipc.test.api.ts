import { VuError } from "@variables-ultra/core/result"
import { Api, ApiPromise, ApiStream } from "../../.."

export interface NormalWithParams {
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
}

export abstract class IpcTestApi implements Api {
    name: string = IpcTestApi.name

    static readonly NormalReturn: string = "This is a normal return"

    static readonly NormalReturnError: VuError = new VuError("NormalReturnError")

    abstract normal(): ApiPromise<string>

    abstract normalWithParams(
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
    ): ApiPromise<NormalWithParams>

    abstract normalReturnError(): ApiPromise<void>

    abstract stream(): ApiStream<string>

    abstract streamReturnError(): ApiStream<string>

    abstract streamThrowError(): ApiStream<string>
}
