/// <reference types="cypress" />
describe('Registro de Estudiante', () => {

    let carnet: string;
    let email: string;
    let firstName: string;

    // Se ejecuta una sola vez para todo el describe
    before(() => {

        carnet = Date.now().toString().slice(-9);
        email = `Prueba_Estudiante_${carnet}@test.com`;
        firstName = `Prueba_Estudiante_${carnet}`;

    });

    // Antes de cada prueba se abre la página de registro
    beforeEach(() => {
        cy.visit('/register');
    });

    it('No debe registrar estudiante sin nombre', () => {

        // intercepta la petición al backend
        cy.intercept('POST', '**/register-student').as('registerRequest');

        // Llena los campos excepto firstName
        cy.get('[data-cy=lastName]').type('Apellido_Prueba');
        cy.get('[data-cy=email]').type(email);
        cy.get('[data-cy=carnet]').type(carnet);
        cy.get('[data-cy=password]').type('123456');

        // Intenta registrar
        cy.get('[data-cy=login-btn]').click();

        // Espera la respuesta y revisa el status code
        cy.wait('@registerRequest').then((interception) => {
            const status = interception.response?.statusCode;
            const message = interception.response?.body.firstName;

            expect(status).to.eq(400);
            expect(message).to.eq('El nombre es obligatorio');
        });
    });

    it('No debe registrar estudiante sin apellido', () => {

        // intercepta la petición al backend
        cy.intercept('POST', '**/register-student').as('registerRequest');

        // Llena los campos excepto lastName
        cy.get('[data-cy=firstName]').type(firstName);
        cy.get('[data-cy=email]').type(email);
        cy.get('[data-cy=carnet]').type(carnet);
        cy.get('[data-cy=password]').type('123456');

        // Intenta registrar
        cy.get('[data-cy=login-btn]').click();

        // Espera la respuesta y revisa el status code
        cy.wait('@registerRequest').then((interception) => {
            const status = interception.response?.statusCode;
            const message = interception.response?.body.lastName;

            expect(status).to.eq(400);
            expect(message).to.eq('El apellido es obligatorio');
        });
    });

    it('No debe registrar estudiante sin email', () => {

        // intercepta la petición al backend
        cy.intercept('POST', '**/register-student').as('registerRequest');

        // Llena los campos excepto carnet
        cy.get('[data-cy=firstName]').type(firstName);
        cy.get('[data-cy=lastName]').type('Apellido_Prueba');
        cy.get('[data-cy=carnet]').type(carnet);
        cy.get('[data-cy=password]').type('123456');

        // Intenta registrar
        cy.get('[data-cy=login-btn]').click();

        // Espera la respuesta y revisa el status code
        cy.wait('@registerRequest').then((interception) => {
            const status = interception.response?.statusCode;
            const message = interception.response?.body.email;

            expect(status).to.eq(400);
            expect(message).to.eq('El email es obligatorio');
        })
    })

    it('Debe registrar un estudiante correctamente', () => {

        // intercepta la petición al backend
        cy.intercept('POST', '**/register-student').as('registerRequest');

        // Se asegura que el rol sea estudiante
        cy.get('[data-cy=selectedRole]').click();
        cy.contains('Estudiante').click();

        // Llena los campos del formulario
        cy.get('[data-cy=firstName]').type(firstName);
        cy.get('[data-cy=lastName]').type('Apellido_Prueba');
        cy.get('[data-cy=email]').type(email);
        cy.get('[data-cy=carnet]').type(carnet);
        cy.get('[data-cy=password]').type('123456');

        // Envía el formulario
        cy.get('[data-cy=login-btn]').click();

        // Espera la respuesta y revisa el status code
        cy.wait('@registerRequest').then((interception) => {
            const status = interception.response?.statusCode;

            expect(status).to.eq(200);
        });

        // Verifica que redirige al login después del registro
        cy.url().should('include', '/login');

    });


    // intenta crear el mismo usuario que se creo en la anterior prueba
    it('Debe mostrar error si el email ya está registrado', () => {

        // intercepta la petición al backend
        cy.intercept('POST', '**/register-student').as('registerRequest');

        // Llena el formulario
        cy.get('[data-cy=firstName]').type(firstName);
        cy.get('[data-cy=lastName]').type('Apellido_Prueba');
        cy.get('[data-cy=email]').type(email);
        cy.get('[data-cy=carnet]').type(carnet);
        cy.get('[data-cy=password]').type('123456');

        // Intenta registrar
        cy.get('[data-cy=login-btn]').click();

        // Espera la respuesta y revisa el status code
        cy.wait('@registerRequest').then((interception) => {
            const status = interception.response?.statusCode;
            const message = interception.response?.body.message;

            expect(status).to.eq(409);
            expect(message).to.eq('El usuario ya está registrado');
        });

    });

});