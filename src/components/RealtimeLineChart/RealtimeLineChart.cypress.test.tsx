/// <reference types="cypress" />

import {deepCompareEquals, hashCode} from "./index";

describe("testing functions with cypress", () => {
    context('RealtimeLineChart functions', () => {
        it('check if two values are equal', () => {
            expect(
                deepCompareEquals(1, 2)
            ).to.eq(true)

            expect(
                deepCompareEquals(1, 1)
            ).to.eq(true)

            expect(
                deepCompareEquals("Hallo", "Hallo")
            ).to.eq(true)

            expect(
                deepCompareEquals("Hallo", "hallo")
            ).to.eq(false)

            expect(
                deepCompareEquals({"sex": "male", "age": 21}, {"sex": "male", "age": 21})
            ).to.eq(true)
        })
    })
})