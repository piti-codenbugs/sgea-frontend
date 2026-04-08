/// <reference types="cypress" />

describe('Equivalencias - Profesor', () => {

    Cypress.on('uncaught:exception', (err) => {
        if (
            err.message.includes('dynamically imported module') ||
            err.message.includes('Failed to fetch dynamically imported module') ||
            err.message.includes('error loading dynamically imported module')
        ) {
            return false
        }
    })

    const pendingRequest = {
        id: 6,
        destinationCourseCode: 3003,
        destinationCourseName: 'Área Social Humanistica 1',
        studentId: 5,
        studentFullName: 'Herberth Reyes',
        professorId: 3,
        professorFullName: 'Docente Prueba',
        status: 'PENDIENTE',
        comment: null,
        programUrl: 'https://example.com/program.pdf',
        courseCertificateUrl: 'https://example.com/certificate.pdf',
        signedProgramUrl: null,
        originCourseCode: '102',
        year: 2022,
        semester: 1,
        section: 'E',
        createdAt: '2026-04-03T12:51:51.410696',
        resolutionDate: null
    }

    const privateProgram = {
        id: 1,
        courseCode: '102',
        courseName: null,
        professorId: 3,
        professorName: 'Docente Prueba',
        year: 2022,
        semester: 1,
        section: 'E',
        programUrl: 'https://example.com/private-program.pdf',
        createdAt: '2026-04-03T04:37:46.473597'
    }

    beforeEach(() => {
        cy.visit('/login')

        cy.intercept('POST', '**/api/v1/auth/login').as('loginRequest')

        cy.intercept('GET', '**/api/v1/equivalencias/professor/pending', {
            statusCode: 200,
            body: [pendingRequest]
        }).as('getPending')

        cy.intercept('GET', '**/api/v1/equivalencias/professor/6', {
            statusCode: 200,
            body: pendingRequest
        }).as('getDetail')

        cy.intercept('GET', '**/api/v1/equivalencias/professor/private-programs*', {
            statusCode: 200,
            body: [privateProgram]
        }).as('getPrivatePrograms')

        cy.intercept('PATCH', '**/api/v1/equivalencias/professor/6/reject', {
            statusCode: 200,
            body: {
                ...pendingRequest,
                status: 'RECHAZADO',
                comment: 'Motivo de prueba',
                resolutionDate: '2026-04-05T17:29:29.984024083'
            }
        }).as('rejectRequest')

        cy.intercept('PATCH', '**/api/v1/equivalencias/professor/6/approve', {
            statusCode: 200,
            body: {
                ...pendingRequest,
                status: 'ACEPTADO',
                signedProgramUrl: 'https://example.com/signed-program.pdf',
                resolutionDate: '2026-04-05T17:34:44.658960137'
            }
        }).as('approveRequest')

        cy.get('[data-cy=email]').type(Cypress.env('PROFESSOR_EMAIL'))
        cy.get('[data-cy=password]').type(Cypress.env('PROFESSOR_PASSWORD'))
        cy.get('[data-cy=login-btn]').click()

        cy.wait('@loginRequest')
        cy.visit('/professor/equivalencies/pending')

        cy.wait('@getPending', { timeout: 10000 }).then((interception: any) => {
            expect(interception.response?.statusCode).to.eq(200)
            expect(interception.response?.body).to.be.an('array')
            expect(interception.response?.body.length).to.be.greaterThan(0)
        })
    })

    it('Debe mostrar solicitudes pendientes', () => {
        cy.get('[data-cy=pending-equivalencies-table]').should('exist')
        cy.get('[data-cy=view-equivalency-button]').should('have.length.at.least', 1)
    })

    it('Debe abrir el detalle de una solicitud', () => {
        cy.get('[data-cy=view-equivalency-button]').should('have.length.at.least', 1)
        cy.get('[data-cy=view-equivalency-button]').first().click()

        cy.wait('@getDetail')
        cy.get('[data-cy=equivalency-review-card]').should('exist')
    })

    it('Debe mostrar error al rechazar sin comentario', () => {
        cy.get('[data-cy=view-equivalency-button]').first().click()
        cy.wait('@getDetail')

        cy.get('[data-cy=reject-button]').click()
        cy.get('[data-cy=confirm-reject-button]').click()

        cy.contains('Debes ingresar un motivo de rechazo').should('be.visible')
    })

    it('Debe rechazar una solicitud correctamente', () => {
        cy.get('[data-cy=view-equivalency-button]').first().click()
        cy.wait('@getDetail')

        cy.get('[data-cy=reject-button]').click()
        cy.get('[data-cy=reject-comment-input]').type('Motivo de prueba')

        cy.get('[data-cy=confirm-reject-button]').click()

        cy.wait('@rejectRequest').then((interception: any) => {
            expect(interception.response?.statusCode).to.eq(200)
            expect(interception.response?.body.status).to.eq('RECHAZADO')
        })

        cy.get('[data-cy=review-success-alert]').should('exist')
    })

    it('Debe cargar programas privados al aprobar', () => {
        cy.get('[data-cy=view-equivalency-button]').first().click()
        cy.wait('@getDetail')

        cy.get('[data-cy=approve-button]').click()
        cy.wait('@getPrivatePrograms')

        cy.get('[data-cy=private-programs-table]').should('exist')
    })

    it('Debe aprobar una solicitud usando programa privado', () => {
        cy.get('[data-cy=view-equivalency-button]').first().click()
        cy.wait('@getDetail')

        cy.get('[data-cy=approve-button]').click()
        cy.wait('@getPrivatePrograms')

        cy.get('[data-cy^=select-program-]').first().click()
        cy.get('[data-cy=confirm-approve-button]').click()

        cy.wait('@approveRequest').then((interception: any) => {
            expect(interception.response?.statusCode).to.eq(200)
            expect(interception.response?.body.status).to.eq('ACEPTADO')
        })

        cy.get('[data-cy=review-success-alert]').should('exist')
    })
})