/// <reference types="cypress" />

describe("testing functions with cypress", () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/')
    })
        it('displays realtime chart', () => {
            cy
                .get(".realtime-line-chart ")
                .should("have.length", 1)
        })
        it('display current time', ()=>{
            const date = new Date();
            cy
                .get(".time-bar")
                .should("contain", date.getHours() + ":" + date.getMinutes())
        })
})


export {}

//todo browser-visit tests (in jest as well)
//todo snapshot test