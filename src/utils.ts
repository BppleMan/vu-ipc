export function isNil(value: any): value is null | undefined {
    return value == null // 处理 null 和 undefined
}

export function isArray(value: any): value is any[] {
    return Array.isArray(value)
}

export function isObject(value: any): value is Record<string, any> {
    return !isNil(value) && typeof value === "object" && Array.isArray(value) === false
}

export function isFunction(value: any): value is Function {
    return !isNil(value) && typeof value === "function"
}

export function isPromise(value: any): value is Promise<any> {
    return !isNil(value) && isFunction(value.then)
}

export function isStream(value: any): value is ReadableStream {
    return !isNil(value) && isFunction(value.getReader)
}
