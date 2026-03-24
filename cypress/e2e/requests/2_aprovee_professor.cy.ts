/// <reference types="cypress" />
describe('Aprobar docente', () => {
    Cypress.on('uncaught:exception', (err) => {
        if (err.message.includes('dynamically imported module')) return false;
    });

    let hashId: number;
    let email: string;
    let firstName: string;

    before(() => {
        hashId = Date.now();
        
        email = `profesor_${hashId}@cunoc.edu.gt`;
        firstName = `Profesor_${hashId}`;
    });

    it('Debe registrar un docente correctamente', () => {
        cy.intercept('POST', '**/auth/register-professor').as('registerRequest');

        cy.visit('/register');
        cy.get('[data-cy=selectedRole]').click();
        cy.contains('Profesor').click();
        cy.wait(500);

        cy.get('[data-cy=firstName]').should('be.visible').type(firstName);
        cy.get('[data-cy=lastName]').type('Apellido_Prueba');
        cy.get('[data-cy=email]').type(email);
        cy.get('[data-cy=password]').type('123456');
        cy.get('[data-cy=login-btn]').should('not.be.disabled').click();

        cy.wait('@registerRequest').then((interception) => {
            cy.log('Status:', interception.response?.statusCode.toString());
            cy.log('Body:', JSON.stringify(interception.response?.body));
            expect(interception.response?.statusCode).to.eq(200);
        });

        cy.url().should('include', '/login');
    });

    it('El admin debe aprobar al docente registrado', () => {
        cy.intercept('POST', '**/auth/login').as('loginRequest');
        cy.intercept('GET', '**/professor**').as('getPendientes');
        cy.intercept('PATCH', '**/professor/**/status').as('approveRequest');

        cy.visit('/login');
        cy.get('[data-cy=email]').should('be.visible').type(Cypress.env('ADMIN_EMAIL'));
        cy.get('[data-cy=password]').type(Cypress.env('ADMIN_PASSWORD'));
        cy.get('[data-cy=login-btn]').should('not.be.disabled').click();

        cy.wait('@loginRequest').then((i) => {
            cy.log('Login status:', i.response?.statusCode.toString());
        });

        cy.visit('/admin/professors');
        cy.wait('@getPendientes');

        cy.get('[data-cy=search-input]').should('be.visible').type(firstName);
        cy.get('[data-cy=btn-aprobar]').should('have.length.at.least', 1).first().click();

        cy.wait('@approveRequest').then((interception) => {
            expect(interception.response?.statusCode).to.eq(204);
        });

        cy.contains('Docente aprobado correctamente').should('be.visible');
    });
});