import "reflect-metadata"
import { afterAll, beforeAll, describe, expect, test } from "@jest/globals"
import { Result, VuError } from "@variables-ultra/core/result"
import { container } from "tsyringe"
import { IpcClient, IpcServer, OnMessageFn } from ".."
import { NormalWithParams } from "./mock/api"
import { IpcTestApiClient } from "./mock/client"
import { IpcTestApiServer } from "./mock/server"


beforeAll(async () => {
    let channel: OnMessageFn
    const ipcClient = new IpcClient((message, targetOrigin) => {
        channel(message, targetOrigin)
    })
    const ipcServer = new IpcServer((message, targetOrigin) => {
        ipcClient.onMessage(message, targetOrigin)
    })
    channel = ipcServer.onMessage.bind(ipcServer)

    const ipcTestApi = new IpcTestApiServer()
    ipcServer.addApi(ipcTestApi)

    container.register(IpcClient, { useValue: ipcClient })
})

afterAll(async () => {

})

describe("normal", () => {
    test("normal", async () => {
        const apiClient = container.resolve(IpcTestApiClient)
        const normal = await apiClient.normal()
        expect(normal).toEqual(Result.ok(IpcTestApiServer.NormalReturn))
    })
})

describe("normal with params", () => {
    test("normal with params - 1", async () => {
        const apiClient = container.resolve(IpcTestApiClient)
        const expected: NormalWithParams = {
            param1: "param1",
            param2: 0,
            param3: "param3",
            param4: true,
            param5: ["param5-1", "param5-2"],
            param6: [1, 2],
            param7: new Map<number, string>([
                [1, "param7-1"],
                [2, "param7-2"],
            ]),
            param8: new Set<string>(["param8-1", "param8-2"]),
            param9: {
                "param9-1": "param9-1",
                "param9-2": "param9-2",
            },
        }
        const normal = await apiClient.normalWithParams(
            expected.param1,
            expected.param2,
            expected.param3,
            expected.param4,
            expected.param5,
            expected.param6,
            expected.param7,
            expected.param8,
            expected.param9,
        )
        expect(normal).toEqual(Result.ok(expected))
    })

    test("normal with params - 2", async () => {
        const apiClient = container.resolve(IpcTestApiClient)
        const expected: NormalWithParams = {
            param1: "param1",
            param2: 0,
            param3: undefined,
            param4: false,
            param5: ["param5-1", "param5-2"],
            param6: [1, 2],
            param7: new Map<number, string>([
                [1, "param7-1"],
                [2, "param7-2"],
            ]),
            param8: new Set<string>(["param8-1", "param8-2"]),
            param9: {
                "param9-1": "param9-1",
                "param9-2": "param9-2",
            },
            param10: undefined,
        }
        const normal = await apiClient.normalWithParams(
            expected.param1,
            expected.param2,
            expected.param3,
            expected.param4,
            expected.param5,
            expected.param6,
            expected.param7,
            expected.param8,
            expected.param9,
        )
        expect(normal).toEqual(Result.ok(expected))
    })
})

describe("normal return error", () => {
    test("normal return error", async () => {
        const apiClient = container.resolve(IpcTestApiClient)
        const normal = await apiClient.normalReturnError()
        expect(normal).toEqual(Result.error(IpcTestApiServer.NormalReturnError))
    })
})

describe("stream", () => {
    test("stream", async () => {
        const apiClient = container.resolve(IpcTestApiClient)
        const stream = apiClient.stream()
        const reader = stream.getReader()
        let { value, done } = await reader.read()
        let count = 0
        while (!done) {
            expect(value).toEqual(Result.ok(`stream count: ${count}`))
            count += 1
            ;({ value, done } = await reader.read())
        }
        expect(count).toBe(10)
        const ipcClient = container.resolve(IpcClient)
        expect(ipcClient["streamMap"].size).toBe(0)
        await ipcClient.waitAll()
        expect(ipcClient["executorMap"].size).toBe(0)
    })

    test("stream cancel", async () => {
        const apiClient = container.resolve(IpcTestApiClient)
        const stream = apiClient.stream()
        const reader = stream.getReader()
        let { value, done } = await reader.read()
        let count = 0
        while (!done) {
            expect(value).toEqual(Result.ok(`stream count: ${count}`))
            count += 1
            if (count === 5) {
                await reader.cancel()
            }
            ;({ value, done } = await reader.read())
        }
        expect(count).toBe(5)
        const ipcClient = container.resolve(IpcClient)
        expect(ipcClient["streamMap"].size).toBe(0)
    })
})

describe("stream with error", () => {
    test("stream return error", async () => {
        const apiClient = container.resolve(IpcTestApiClient)
        const stream = apiClient.streamReturnError()
        const reader = stream.getReader()
        let { value, done } = await reader.read()
        let count = 0
        while (!done) {
            if (count % 2 !== 0) {
                expect(value).toEqual(Result.ok(`stream count: ${count}`))
            } else {
                expect(value).toEqual(Result.error(new VuError(`stream count: ${count} is even`)))
            }
            count += 1
            ;({ value, done } = await reader.read())
        }
        expect(count).toBe(10)
        const ipcClient = container.resolve(IpcClient)
        expect(ipcClient["streamMap"].size).toBe(0)
    })

    test("stream throw error", async () => {
        const apiClient = container.resolve(IpcTestApiClient)
        const stream = apiClient.streamThrowError()
        const reader = stream.getReader()
        await expect(reader.read()).rejects.toThrow()
        const ipcClient = container.resolve(IpcClient)
        expect(ipcClient["streamMap"].size).toBe(0)
    })
})
