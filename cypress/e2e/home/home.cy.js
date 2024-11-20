

context('home', () => {
    beforeEach(() => {
        cy.visit("localhost:4200/metabolights/editor/")
    })

    it('should load the login view', () => {
        cy.get('input.username')
            .invoke('attr', 'placeholder')
            .then(placeholder => {
                expect(placeholder).to.equal('Email address')
            })
    })
})