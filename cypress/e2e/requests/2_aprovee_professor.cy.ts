/// <reference types="cypress" />
describe('Aprobar docente', () => {

    Cypress.on('uncaught:exception', (err) => {
        if (err.message.includes('dynamically imported module')) {
            return false
        }
    })

    let hashId: number;
    let email: string;
    let firstName: string;

    before(() => {
        hashId = Date.now();
        email = `Profesor_${hashId}@test.com`;
        firstName = `Profesor_${hashId}`;
    });


    it('Debe registrar un docente correctamente', () => {
        cy.intercept('POST', '**/register-professor').as('registerRequest');
        cy.visit('/register');
        cy.get('[data-cy=selectedRole]').should('be.visible').click();
        cy.contains('Profesor').should('be.visible').click();
        
        cy.get('[data-cy=firstName]').type(firstName);
        cy.get('[data-cy=lastName]').type('Apellido_Prueba');
        cy.get('[data-cy=email]').type(email);
        cy.get('[data-cy=password]').type('123456');
        cy.get('[data-cy=login-btn]').click();
        cy.wait(5000); 

        cy.wait('@registerRequest').then((interception) => {
            expect(interception.response?.statusCode).to.eq(200);
        });
    });


    it('El admin debe aprobar al docente registrado', () => {
        cy.intercept('POST', '**/login').as('loginRequest');
        cy.intercept('GET', '**/professor?status=PENDIENTE').as('getPendientes');
        cy.intercept('PATCH', '**/professor/**/status').as('approveRequest');

        cy.visit('/login');
        cy.get('[data-cy=email]').type(Cypress.env('PROFESSOR_EMAIL'));
        cy.get('[data-cy=password]').type(Cypress.env('PROFESSOR_PASSWORD'));
        cy.get('[data-cy=login-btn]').click();
        cy.wait('@loginRequest');

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