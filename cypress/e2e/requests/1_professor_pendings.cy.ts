/// <reference types="cypress" />

describe('Validar que solo se muestren docentes con estado PENDIENTE', () => {

    Cypress.on('uncaught:exception', (err) => {
        if (err.message.includes('dynamically imported module')) {
            return false
        }
    })

    beforeEach(() => {
        cy.intercept('POST', '**/login').as('loginRequest'); 
        cy.visit('/login');
        cy.get('[data-cy=email]').type(Cypress.env('ADMIN_EMAIL'));
        cy.get('[data-cy=password]').type(Cypress.env('ADMIN_PASSWORD'));
        cy.get('[data-cy=login-btn]').click();
        cy.wait('@loginRequest');
        cy.url().should('not.include', '/login');
    });

    it('El endpoint debe responder con status 200 y retornar un arreglo', () => {
        cy.intercept('GET', '**/professor?status=PENDIENTE').as('getPendientes');
        cy.visit('/admin/professors');

        cy.wait('@getPendientes').then((interception) => {
            const status = interception.response?.statusCode;
            const body = interception.response?.body;

            expect(status).to.eq(200);
            expect(body).to.be.an('array'); 
        });
    });

    it('Cada registro debe contener los campos correctos en el JSON', () => {
        cy.intercept('GET', '**/professor?status=PENDIENTE').as('getPendientes');
        cy.visit('/admin/professors');

        cy.wait('@getPendientes').then((interception) => {
            const body: Array<{
                id: number;
                firstName: string;
                lastName: string;
                email: string;
                registrationDate: string;
            }> = interception.response?.body;

            expect(body).to.be.an('array');

            if (body.length > 0) {
                const profesor = body[0];
                expect(profesor).to.have.property('id');
                expect(profesor).to.have.property('firstName');
                expect(profesor).to.have.property('lastName');
                expect(profesor).to.have.property('email');
                expect(profesor).to.have.property('registrationDate');
            }
        });
    });

    it('La tabla debe mostrar las columnas: Nombre Completo, Correo Electrónico, Fecha Registro, Acciones', () => {
        cy.intercept('GET', '**/professor?status=PENDIENTE').as('getPendientes');
        cy.visit('/admin/professors');
        cy.wait('@getPendientes');

        cy.contains('th', 'Nombre Completo').should('be.visible');
        cy.contains('th', 'Correo Electrónico').should('be.visible');
        cy.contains('th', 'Fecha Registro').should('be.visible');
        cy.contains('th', 'Acciones').should('be.visible');
    });

    it('La sección de pendientes debe tener el título: Solicitudes por Aprobar', () => {
        cy.intercept('GET', '**/professor?status=PENDIENTE').as('getPendientes');
        cy.visit('/admin/professors');
        cy.wait('@getPendientes');

        cy.contains('Solicitudes por Aprobar').should('be.visible');
    });

    it('La tabla de pendientes debe mostrar botones de Aprobar y Rechazar por fila', () => {
        cy.intercept('GET', '**/professor?status=PENDIENTE').as('getPendientes');
        cy.visit('/admin/professors');
        cy.wait('@getPendientes');

        cy.get('[data-cy=btn-aprobar]').should('exist');
        cy.get('[data-cy=btn-rechazar]').should('exist');
    });
});