import { describe, expect, it } from "@jest/globals"
import { isArray, isFunction, isNil, isObject, isPromise, isStream } from "../utils"

describe("utils", () => {
    describe("isNil", () => {
        it("should return true for null and undefined", () => {
            expect(isNil(null)).toBe(true)
            expect(isNil(undefined)).toBe(true)
        })

        it("should return false for non-null and non-undefined values", () => {
            expect(isNil(0)).toBe(false)
            expect(isNil("")).toBe(false)
            expect(isNil([])).toBe(false)
            expect(isNil({})).toBe(false)
        })
    })

    describe("isArray", () => {
        it("should return true for arrays", () => {
            expect(isArray([])).toBe(true)
            expect(isArray([1, 2, 3])).toBe(true)
        })

        it("should return false for non-arrays", () => {
            expect(isArray({})).toBe(false)
            expect(isArray("string")).toBe(false)
            expect(isArray(123)).toBe(false)
        })
    })

    describe("isObject", () => {
        it("should return true for objects", () => {
            expect(isObject({})).toBe(true)
            expect(isObject({ a: 1 })).toBe(true)
        })

        it("should return false for non-objects", () => {
            expect(isObject(null)).toBe(false)
            expect(isObject([])).toBe(false)
            expect(isObject("string")).toBe(false)
        })
    })

    describe("isFunction", () => {
        it("should return true for functions", () => {
            expect(isFunction(() => {
            })).toBe(true)
            expect(isFunction(function () {
            })).toBe(true)
        })

        it("should return false for non-functions", () => {
            expect(isFunction({})).toBe(false)
            expect(isFunction("string")).toBe(false)
            expect(isFunction(123)).toBe(false)
        })
    })

    describe("isPromise", () => {
        it("should return true for promises", () => {
            expect(isPromise(Promise.resolve())).toBe(true)
        })

        it("should return false for non-promises", () => {
            expect(isPromise({})).toBe(false)
            expect(isPromise("string")).toBe(false)
            expect(isPromise(123)).toBe(false)
        })
    })

    describe("isStream", () => {
        it("should return true for streams", () => {
            const mockStream = {
                getReader: () => {
                },
            }
            expect(isStream(mockStream)).toBe(true)
        })

        it("should return false for non-streams", () => {
            expect(isStream({})).toBe(false)
            expect(isStream("string")).toBe(false)
            expect(isStream(123)).toBe(false)
        })
    })
})
