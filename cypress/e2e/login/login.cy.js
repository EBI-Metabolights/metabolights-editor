
context('login', () => {
    beforeEach(() => {
        cy.visit(Cypress.env('editorLoc'))
    })

    it('should login successfully with valid credentials', () => {
        cy.get('input.username')
            .type(Cypress.env('username'))
        cy.get('input.password')
            .type(Cypress.env('password'))
        cy.get('.login-button').click();
        cy.url().should('include', '/console');

    });
})