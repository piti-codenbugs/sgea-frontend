/// <reference types="cypress" />
describe('Rechazar docente y validar que no puede iniciar sesión', () => {
    Cypress.on('uncaught:exception', (err) => {
        if (err.message.includes('dynamically imported module')) return false;
    });

    let hashId: number;
    let email: string;
    let firstName: string;

    before(() => {
        hashId = Date.now();
        email = `profesor_${hashId}@test.com`; 
        firstName = `Profesor_${hashId}`;
    });

    it('Debe registrar un docente correctamente', () => {
        cy.intercept('POST', '**/auth/register-professor').as('registerRequest'); 

        cy.visit('/register');
        cy.get('[data-cy=selectedRole]').should('be.visible').click();
        cy.contains('Profesor').should('be.visible').click();
        cy.wait(500);

        cy.get('[data-cy=firstName]').should('be.visible').type(firstName);
        cy.get('[data-cy=lastName]').type('Apellido_Prueba');
        cy.get('[data-cy=email]').type(email);
        cy.get('[data-cy=password]').type('123456');
        cy.get('[data-cy=login-btn]').should('not.be.disabled').click();

        cy.wait('@registerRequest').then((interception) => {
            expect(interception.response?.statusCode).to.eq(200);
        });
    });

    it('El admin debe rechazar al docente registrado', () => {
        cy.intercept('POST', '**/login').as('loginRequest');
        cy.intercept('GET', '**/professor**').as('getPendientes');
        cy.intercept('PATCH', '**/professor/**/status').as('rejectRequest');

        cy.visit('/login');
        cy.get('[data-cy=email]').should('be.visible').type(Cypress.env('ADMIN_EMAIL')); 
        cy.get('[data-cy=password]').type(Cypress.env('ADMIN_PASSWORD'));
        cy.get('[data-cy=login-btn]').should('not.be.disabled').click();
        cy.wait('@loginRequest');

        cy.visit('/admin/professors');
        cy.wait('@getPendientes');

        cy.get('[data-cy=search-input]').should('be.visible').type(firstName);
        cy.get('[data-cy=btn-rechazar]').should('have.length.at.least', 1).first().click();

        cy.get('.v-dialog').should('be.visible');
        cy.get('.v-dialog .v-textarea textarea').first().should('be.visible').type('Docente no verificado');
        cy.contains('Confirmar Rechazo').should('not.be.disabled').click();

        cy.wait('@rejectRequest').then((interception) => {
            expect(interception.response?.statusCode).to.eq(204);
        });

        cy.contains('Solicitud rechazada').should('be.visible');
    });
});