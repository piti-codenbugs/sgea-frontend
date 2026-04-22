/// <reference types="cypress" />

describe('Inicio de Sesión', () => {

    // antes de cada prueba abre login
    beforeEach(() => {
        cy.visit('/login');
    });

    it('No debe iniciar sesión sin email', () => {

        // intercepta petición al backend
        // cy.intercept('POST', '**/login').as('loginRequest');

        // // llena solo contraseña
        // cy.get('[data-cy=password]').type('123456');

        // // intenta login
        // cy.get('[data-cy=login-btn]').click();

        // // espera respuesta
        // cy.wait('@loginRequest').then((interception) => {
        //     const status = interception.response?.statusCode;
        //     const message = interception.response?.body.message;

        //     expect(status).to.eq(401);
        //     expect(message).to.eq('Credenciales incorrectas');
        // });

    });


    it('No debe iniciar sesión sin contraseña', () => {

        // intercepta petición
        // cy.intercept('POST', '**/login').as('loginRequest');

        // // llena solo email
        // cy.get('[data-cy=email]').type('test@test.com');

        // // intenta login
        // cy.get('[data-cy=login-btn]').click();

        // // espera respuesta
        // cy.wait('@loginRequest').then((interception) => {
        //     const status = interception.response?.statusCode;
        //     const message = interception.response?.body.message;

        //     expect(status).to.eq(401);
        //     expect(message).to.eq('Credenciales incorrectas');
        // });

    });


    it('Debe mostrar error con credenciales incorrectas', () => {

        // intercepta petición
        cy.intercept('POST', '**/login').as('loginRequest');

        // llena formulario
        cy.get('[data-cy=email]').type('fake@test.com');
        cy.get('[data-cy=password]').type('wrongpassword');

        // intenta login
        cy.get('[data-cy=login-btn]').click();

        // espera respuesta
        cy.wait('@loginRequest').then((interception) => {
            const status = interception.response?.statusCode;
            const message = interception.response?.body.message;

            expect(status).to.eq(401);
            expect(message).to.eq('Credenciales incorrectas');
        });

    });


    it('Debe iniciar sesión correctamente como estudiante', () => {

        // intercepta petición
        cy.intercept('POST', '**/login').as('loginRequest');

        // llena formulario
        cy.get('[data-cy=email]').type(Cypress.env('STUDENT_EMAIL'));
        cy.get('[data-cy=password]').type(Cypress.env('STUDENT_PASSWORD'));

        // intenta login
        cy.get('[data-cy=login-btn]').click();

        // espera respuesta
        cy.wait('@loginRequest').then((interception) => {
            const status = interception.response?.statusCode;
            expect(status).to.eq(200);
        });

    });


    it('Debe iniciar sesión como profesor', () => {

        // intercepta petición
        cy.intercept('POST', '**/login').as('loginRequest');

        // llena formulario
        cy.get('[data-cy=email]').type(Cypress.env('PROFESSOR_EMAIL'));
        cy.get('[data-cy=password]').type(Cypress.env('PROFESSOR_PASSWORD'));

        // intenta login
        cy.get('[data-cy=login-btn]').click();

        // espera respuesta
        cy.wait('@loginRequest').then((interception) => {
            const status = interception.response?.statusCode;
            expect(status).to.eq(200);
        });

    });

});