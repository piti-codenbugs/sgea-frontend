/// <reference types="cypress" />

describe('Aprobar docente y validar inicio de sesión', () => {

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
        cy.get('[data-cy=selectedRole]').click();
        cy.contains('Profesor').click();

        cy.get('[data-cy=firstName]').type(firstName);
        cy.get('[data-cy=lastName]').type('Apellido_Prueba');
        cy.get('[data-cy=email]').type(email);
        cy.get('[data-cy=password]').type('123456');
        cy.get('[data-cy=login-btn]').click();

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

        cy.get('[data-cy=search-input]').type(firstName);

        cy.get('[data-cy=btn-aprobar]').first().click();

        cy.wait('@approveRequest').then((interception) => {
            expect(interception.response?.statusCode).to.eq(204);
        });

        cy.contains('Docente aprobado correctamente').should('be.visible');
    });

    it('El docente aprobado debe poder iniciar sesión', () => {
        cy.intercept('POST', '**/login').as('loginDocente');

        cy.visit('/login');
        cy.get('[data-cy=email]').type(email);
        cy.get('[data-cy=password]').type('123456');
        cy.get('[data-cy=login-btn]').click();

        cy.wait('@loginDocente').then((interception) => {
            expect(interception.response?.statusCode).to.eq(200);
        });

        cy.url().should('not.include', '/login');
    });
});