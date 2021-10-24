/// <reference types="cypress" />

import moment from "moment";

describe('testing component - RealtimeLineChart', () => {
    beforeEach(() => {
        cy.visit('/')
    })

    it('displays realtime chart', () => {
        cy
            .get('[data-test=realtime-line-chart]')
            .should("have.length", 1)
    })

    it('display current time', () => {
        const date = new Date();
        cy
            .get('[data-test=current-time]')
            .should('contain', moment(date).format('HH:mm'))
    })

    it('display Value on hover', () => {
        cy
            .get('[data-test=realtime-line-chart] .u-over')
            .trigger('mousemove', 420, 10)
            .get('.u-value:nth-child(2)')
            .contains(14)
    })


    it('display Time on hover', () => {
        const date = new Date();
        cy
            .get('[data-test=realtime-line-chart] .u-over')
            .trigger('mousemove', 420, 10)
            .get('.u-value:first')
            .contains(moment(date).format('YYYY-MM-DD h:mma'))
    })

    it('display cursor-point in chart', () => {
        cy
            .get('[data-test=realtime-line-chart] .u-over')
            .trigger('mousemove', 420, 10)
            .get('.u-cursor-pt:not(.u-off)')
            .should("have.length", 1)
    })
})

//todo browser-visit tests (in jest as well)
//todo snapshot test