context('navigation', () => {
    beforeEach(() => {
        cy.visit(Cypress.env('editorLoc'));
        cy.get('input.username')
        .type(Cypress.env('username'))
        cy.get('input.password')
        .type(Cypress.env('password'))
        cy.get('.login-button').click();
    });
    it('should navigate guided, with all components loaded successfully', () => {
        cy.get('.guided-submission-button').eq(1).click(); // statically clicking the second study, for demo purposes
        
        cy.contains('Your MetaboLights study').should('be.visible');
        cy.get('.next-button').click();
        
        cy.contains('i_Investigation.txt');
        cy.get('.next-button').click();

        cy.contains('Do you have a manuscript?');
        cy.get('.skip-link').click();

        cy.contains('Study samples and assay details')
        cy.get('.full-study-view').click();
        cy.get('.swal2-confirm').click(); // if we ever stop using swal this will fail

    });
    it('should hit full study view', () => {
        cy.get('.study-overview-button').eq(1).click(); // statically clicking the second study, for demo purposes

    })
})