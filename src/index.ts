import { Result, VuError } from "@variables-ultra/core/result"

export * from "./request"
export * from "./response"
export * from "./client"
export * from "./server"
export * from "./stream"

export interface Api {
    name: string
}

export type ApiPromise<T> = Promise<Result<T, VuError>>
export type ApiStream<T> = ReadableStream<Result<T, VuError>>
export type ApiStreamReader<T> = ReadableStreamDefaultReader<Result<T, VuError>>

export type PostMessageFn = (message: any, targetOrigin: string) => void
export type OnMessageFn = (message: any, sourceOrigin: string) => void

export enum MessageType {
    normal = "normal",
    stream = "stream",
    streamControl = "stream-control",
}

export enum MessageSource {
    ui = "ui",
    main = "main",
}

export interface ApiStreamReadResult<T> {
    value?: Result<T, VuError>
    done: boolean
}
