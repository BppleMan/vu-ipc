import { autoInjectable, registry } from "tsyringe"
import { ApiPromise, ApiStream, IpcClient, Request } from "../../.."
import { IpcTestApi, NormalWithParams } from "../api"

@autoInjectable()
@registry()
export class IpcTestApiClient extends IpcTestApi {
    constructor(
        private ipcClient: IpcClient,
    ) {
        super()
    }

    async normal(): ApiPromise<string> {
        return this.ipcClient.request(Request.request(this.name, this.normal.name, []))
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
        const data = [
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
        ]
        return this.ipcClient.request(Request.request(this.name, this.normalWithParams.name, data))
    }

    async normalReturnError(): ApiPromise<void> {
        return this.ipcClient.request(Request.request(this.name, this.normalReturnError.name, []))
    }

    stream(): ApiStream<string> {
        return this.ipcClient.stream(Request.stream(this.name, this.stream.name, []))
    }

    streamReturnError(): ApiStream<string> {
        return this.ipcClient.stream(Request.stream(this.name, this.streamReturnError.name, []))
    }

    streamThrowError(): ApiStream<string> {
        return this.ipcClient.stream(Request.stream(this.name, this.streamThrowError.name, []))
    }
}
