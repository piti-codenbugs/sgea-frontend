/// <reference types="cypress" />
describe('Gestión de Cursos - Administrador', () => {

     Cypress.on('uncaught:exception', (err) => {
        if (err.message.includes('dynamically imported module')) return false;
    });


    beforeEach(() => {
        cy.intercept('GET', '**/api/v1/admin/cursos').as('getCourses')
        cy.visit('/login')
        cy.intercept('POST', '**/login').as('loginRequest')
        cy.get('[data-cy=email]').type(Cypress.env('ADMIN_EMAIL'))
        cy.get('[data-cy=password]').type(Cypress.env('ADMIN_PASSWORD'))
        cy.get('[data-cy=login-btn]').click()
        cy.wait('@loginRequest')
        cy.visit('/admin/courses')
    })

    it('Debe obtener el listado de cursos correctamente', () => {
        cy.wait('@getCourses').then((interception) => {
            const status = interception.response?.statusCode
            const body = interception.response?.body
            expect(status).to.eq(200)
            expect(body).to.be.an('array')
            body.forEach((course: any) => {
                expect(course).to.have.property('code')
                expect(course).to.have.property('name')
                expect(course).to.have.property('careerId')
                expect(course).to.have.property('careerName')
            })
        })
    })

    it('Debe mostrar columnas correctas en la tabla', () => {
        cy.wait('@getCourses')
        cy.contains('Código').should('be.visible')
        cy.contains('Nombre del Curso').should('be.visible')
    })

})