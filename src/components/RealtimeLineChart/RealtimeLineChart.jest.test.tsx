import "../../config/matchMedia.mock";
import * as ReactDOM from "react-dom";
import RealtimeLineChart, {deepCompareEquals, hashCode, intToRGB} from "./index";
import {render} from "@testing-library/react";

/*
* Since the functions parameters have no types given to them I restrict the tests to functions, were I could guess the type
* easily out of context.
* In these cases I added the types using the typescript notation.
*
* For the sake of future development I highly suggest that the types should be added in the near future to make/keep the
* functions maintainable.
* */

//trying to emulate how cypress does things: https://youtu.be/r9HdJ8P6GQI?t=2201

test("converts string to java hashcode", () => {
    expect(
        hashCode("H2CH_Temp")
    ).toBe(1438309220)
})

describe("converts integer to rgb", () => {
    it("given normal sized int, return correct hashcode", () => {
        expect(
            intToRGB(1438309220)
        ).toBe("BADB64")
    })

    it("given over sized int, return correct hashcode", () => {
        expect(
            intToRGB(1438309220000000000)
        ).toBe("44E800")
    })

    it("given under sized int, return correct hashcode", () => {
        expect(
            intToRGB(143)
        ).toBe("00008F")
    })

    it("given a string as an argument, throw error", () => {
        expect(
            intToRGB("456u789fh")
        ).toThrowError();
    })

})

describe("check if two values are equal", () => {
    it("given 1 and 2 as arguments, return false", () => {
        expect(
            deepCompareEquals(1, 2)
        ).toBe(false)
    })

    it("given 1 and 1 as arguments, return true", () => {
        expect(
            deepCompareEquals(1, 1)
        ).toBe(true)
    })

    it("given 'Hallo' and 'Hallo' as arguments, return true", () => {
        expect(
            deepCompareEquals("Hallo", "Hallo")
        ).toBe(true)
    })

    it("given 'Hallo' and 'hallo' as arguments, return false", () => {
        expect(
            deepCompareEquals("Hallo", "hallo")
        ).toBe(false)
    })

    it("given two equal objects as arguments, return true", () => {
        expect(
            deepCompareEquals({"sex": "male", "age": 21}, {"sex": "male", "age": 21})
        ).toBe(true)
    })

})

test("renders without crashing", () => {
    const container = document.createElement('div');
    const chart = <RealtimeLineChart
        lines={[{
            dataKey: 'H2CH_Temp',
            name: 'H2CH_Temp',
            unit: 'irgendwas'
        }]}
        scale={'linear'}
        currentValues={{"H2CH_Temp": 14}}
        height={200}
        width={500}
        initValues={[]}
        showLegend={true}
    />;
    document.body.appendChild(container);
    ReactDOM.render(chart, container);

    expect(container.childElementCount).toBe(1);
    expect(container.contains(chart)).toBe(true);
    //todo not sure if that is working
    expect(chart.data[1]).toBe(14);
});

