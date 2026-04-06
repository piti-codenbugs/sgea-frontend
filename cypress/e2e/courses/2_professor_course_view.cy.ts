/// <reference types="cypress" />

describe('Gestión de Cursos - Asignación a Docentes', () => {

    Cypress.on('uncaught:exception', (err) => {
        if (err.message.includes('dynamically imported module')) return false;
    });

    beforeEach(() => {
        cy.visit('/login')

        cy.intercept('POST', '**/login').as('loginRequest')

        // Ajusta esta ruta si tu backend usa otra para docentes aprobados
        cy.intercept('GET', '**/api/v1/professor?status=APROBADO').as('getApprovedProfessors')

        cy.intercept('GET', '**/api/v1/course-assignment/assignments').as('getAssignments')

        cy.intercept('POST', '**/api/v1/course-assignment/assignments', {
            statusCode: 200,
            body: [
                {
                    id: 999,
                    professorName: 'Docente Prueba',
                    courseName: 'Área Matemática Básica 1',
                    courseCode: 3000,
                    assignmentDate: '2026-04-05T12:00:00',
                    period: '2026-01'
                }
            ]
        }).as('postAssignments')

        cy.intercept('DELETE', '**/api/v1/course-assignment/assignments/*').as('deleteAssignment')

        cy.intercept('GET', '**/api/v1/admin/cursos').as('getCourses')

        cy.get('[data-cy=email]').type(Cypress.env('ADMIN_EMAIL'))
        cy.get('[data-cy=password]').type(Cypress.env('ADMIN_PASSWORD'))
        cy.get('[data-cy=login-btn]').click()

        cy.wait('@loginRequest')

        cy.visit('/admin/professors-courses')

        cy.wait('@getApprovedProfessors')
        cy.wait('@getAssignments')
        cy.wait('@getCourses')
    })

    it('Debe cargar correctamente docentes, asignaciones y cursos', () => {
        cy.get('@getApprovedProfessors').then((interception: any) => {
            expect(interception.response?.statusCode).to.eq(200)
            expect(interception.response?.body).to.be.an('array')
        })

        cy.get('@getAssignments').then((interception: any) => {
            expect(interception.response?.statusCode).to.eq(200)
            expect(interception.response?.body).to.be.an('array')
        })

        cy.get('@getCourses').then((interception: any) => {
            expect(interception.response?.statusCode).to.eq(200)
            expect(interception.response?.body).to.be.an('array')
        })
    })

    it('Debe mostrar la vista de control de asignaciones', () => {
        cy.contains('Control de Asignaciones').should('be.visible')
        cy.contains('Gestiona la carga académica de los docentes').should('be.visible')

        cy.get('[data-cy=assignments-search-input]').should('exist')
        cy.get('[data-cy=assignment-professor-select]').should('exist')
        cy.get('[data-cy=assignment-courses-select]').should('exist')
        cy.get('[data-cy=assignment-period-input]').should('exist')
        cy.get('[data-cy=assignment-save-button]').should('exist')
        cy.get('[data-cy=professors-assignments-table]').should('exist')
    })

    it('Debe mostrar error si intenta guardar sin seleccionar docente', () => {
        cy.get('[data-cy=assignment-save-button]').click()

        cy.get('[data-cy=assignment-error-alert]')
            .should('be.visible')
            .and('contain', 'Debe seleccionar un docente.')
    })

    it('Debe permitir buscar un docente', () => {
        cy.get('[data-cy=assignments-search-input]').type('Docente')
        cy.get('[data-cy=professors-assignments-table]').should('contain.text', 'Docente')
    })

    it('Debe abrir el diálogo para gestionar cursos de un docente', () => {
        cy.get('[data-cy=manage-professor-courses-button]').first().click()

        cy.get('[data-cy=assign-dialog]').should('be.visible')
        cy.contains('Asignar Cursos').should('be.visible')
    })

    it('Debe permitir cerrar el diálogo de asignación', () => {
        cy.get('[data-cy=manage-professor-courses-button]').first().click()
        cy.get('[data-cy=assign-dialog]').should('be.visible')

        cy.get('[data-cy=assign-dialog-close-button]').click()
        cy.get('[data-cy=assign-dialog]').should('not.exist')
    })

    it('Debe permitir buscar cursos dentro del diálogo', () => {
        cy.get('[data-cy=manage-professor-courses-button]').first().click()
        cy.get('[data-cy=assign-dialog]').should('be.visible')

        cy.get('[data-cy=assign-dialog-search-input]').type('Matemática')
        cy.get('[data-cy=assign-dialog-courses-table]').should('contain.text', 'Matemática')
    })

    it('Debe mostrar la tabla de cursos dentro del diálogo', () => {
        cy.get('[data-cy=manage-professor-courses-button]').first().click()

        cy.get('[data-cy=assign-dialog]').should('be.visible')
        cy.get('[data-cy=assign-dialog-courses-table]').should('be.visible')

        cy.get('[data-cy=assign-dialog-courses-table]').within(() => {
            cy.contains('Curso').should('exist')
            cy.contains('Código').should('exist')
        })
    })

    it('Debe crear una asignación al guardar cursos', () => {
        cy.intercept('POST', '**/api/v1/course-assignment/assignments', {
            statusCode: 200,
            body: [
                {
                    id: 999,
                    professorName: 'Docente Prueba',
                    courseName: 'Área Matemática Básica 1',
                    courseCode: 3000,
                    assignmentDate: '2026-04-05T12:00:00',
                    period: '2026-01'
                }
            ]
        }).as('postAssignments')

        cy.get('[data-cy=assignment-professor-select]').click()
        cy.get('.v-overlay-container .v-list-item').contains('Docente').click()

        cy.get('[data-cy=assignment-courses-select]').click()
        cy.get('.v-overlay-container .v-list-item').contains('Matemática').click()
        cy.get('body').click(0, 0)

        cy.get('[data-cy=assignment-save-button]').click()

        cy.wait('@postAssignments').then((interception: any) => {
            expect(interception.request.method).to.eq('POST')
            expect(interception.response?.statusCode).to.be.oneOf([200, 201])

            expect(interception.request.body).to.have.property('professorId')
            expect(interception.request.body).to.have.property('courseCodes')
            expect(interception.request.body).to.have.property('period')

            expect(interception.request.body.courseCodes).to.be.an('array')
            expect(interception.request.body.courseCodes.length).to.be.greaterThan(0)
        })
    })
})