/// <reference types="cypress" />
describe('Gestión de Cursos - Administrador', () => {

    beforeEach(() => {
        cy.intercept('GET', '**/api/v1/admin/cursos').as('getCourses')
        cy.visit('/login')
        cy.intercept('POST', '**/login').as('loginRequest')
        cy.get('[data-cy=email]').type(Cypress.env('PROFESSOR_EMAIL'))
        cy.get('[data-cy=password]').type(Cypress.env('PROFESSOR_PASSWORD'))
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
                expect(course).to.have.property('professorId')
                expect(course).to.have.property('professorName')
            })
        })
    })

    it('Debe mostrar la tabla de cursos en pantalla', () => {
        cy.wait('@getCourses')
        cy.get('[data-cy=courses-table]').should('exist')
    })

    it('Debe mostrar columnas correctas en la tabla', () => {
        cy.wait('@getCourses')
        cy.contains('Código').should('be.visible')
        cy.contains('Nombre del Curso').should('be.visible')
        cy.contains('Semestre').should('be.visible')
        cy.contains('Docente Asignado').should('be.visible')
    })

    it('Debe filtrar cursos por nombre', () => {
        cy.wait('@getCourses')
        cy.get('[data-cy=search-input]').type('Matemática')
        cy.contains('Área Matemática Básica 1').should('be.visible')
    })
})