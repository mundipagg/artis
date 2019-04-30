describe('Custom', () => {
  describe('API', () => {
    describe('Configs', () => {
      describe('Should open', () => {
        it('with company name on image', () => {
          const api = `
            const key = 'ek_test_sjQXl3mVUFu1QQYpiSvUBaybtXtXjz';
            const configs = {
              companyName: 'Pagar.me',
              logo: 'o',
            }

            const transaction = {
              amount: 10000,
            }

            const checkout = createCheckout({
              key,
              configs,
              transaction,
            })

            checkout
              .open()
            `

          cy.visit('/')

          cy.get('#btn-open-textarea').click()
          cy.get('#textarea-code').type(api)
          cy.get('#btn-open-checkout').click()

          cy.wait(300)
          cy.get('.header__logo').then((elem) => {
            expect(elem[0].alt).to.equal('Pagar.me')
          })
        })

        it('with logo', () => {
          const api = `
            const key = 'ek_test_sjQXl3mVUFu1QQYpiSvUBaybtXtXjz';
            const configs = {
              logo: 'https://www.google.com.br/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png',
            }

            const transaction = {
              amount: 10000,
            }

            const checkout = createCheckout({
              key,
              configs,
              transaction,
            })

            checkout
              .open()
            `

          cy.visit('/')

          cy.get('#btn-open-textarea').click()
          cy.get('#textarea-code').type(api)
          cy.get('#btn-open-checkout').click()

          cy.get('.header__logo').then((elem) => {
            const { src } = elem[0]
            cy.request(src).then((resp) => {
              expect(resp.status).to.eq(200)
            })
          })
        })

        describe('with enabled cart', () => {
          it('viewing itens', () => {
            const api = `
              const key = 'ek_test_sjQXl3mVUFu1QQYpiSvUBaybtXtXjz';

              const configs = {
                enableCart: true
              }

              const transaction = {
                amount: 10000
              }

              const cart = {
                items: [
                  {
                    id: 1,
                    title: 'Red pill',
                    unitPrice: 5000,
                    quantity: 1,
                    tangible: true,
                  },
                  {
                    id: 2,
                    title: 'Blue pill',
                    unitPrice: 5000,
                    quantity: 1,
                    tangible: true
                  }
                ]
              }

              const checkout = createCheckout({
                key,
                configs,
                transaction,
                cart,
              })

              checkout
                .open()
              `

            cy.visit('/')

            cy.get('#btn-open-textarea').click()
            cy.get('#textarea-code').type(api)
            cy.get('#btn-open-checkout').click()
            cy.wait(300)

            cy.get('.cart__cart').should('exist')
          })

          it('viewing total', () => {
            const api = `
              const key = 'ek_test_sjQXl3mVUFu1QQYpiSvUBaybtXtXjz';

              const configs = {
                enableCart: true
              }

              const transaction = {
                amount: 10000
              }

              const cart = {
                items: [
                  {
                    id: 1,
                    title: 'Red pill',
                    unitPrice: 5000,
                    quantity: 1,
                    tangible: true,
                  },
                  {
                    id: 2,
                    title: 'Blue pill',
                    unitPrice: 5000,
                    quantity: 1,
                    tangible: true
                  }
                ]
              }

              const checkout = createCheckout({
                key,
                configs,
                transaction,
                cart,
              })

              checkout
                .open()
              `

            cy.visit('/')

            cy.get('#btn-open-textarea').click()
            cy.get('#textarea-code').type(api)
            cy.get('#btn-open-checkout').click()
            cy.wait(300)

            cy.get('.cart__amountResume > .cart__labels').should('exist')
            cy.get('.cart__amountResume > .cart__values').should('exist')

            cy.get('.cart__amountResume > .cart__labels').then((elem) => {
              expect(elem[0].innerText).contains('TOTAL')
            })

            cy.get('.cart__amountResume > .cart__values').then((elem) => {
              expect(elem[0].innerText).contains('100')
            })
          })

          it('viewing shipping informations', () => {
            const api = `
              const key = 'ek_test_sjQXl3mVUFu1QQYpiSvUBaybtXtXjz';

              const configs = {
                enableCart: true
              }

              const transaction = {
                amount: 10000
              }

              const customer = {
                name: 'Dan Abramov',
                documentNumber: '19981596639',
                email: 'mercurio@pagar.me',
                phoneNumber: '1130442277',
                allowedDocuments: ['CPF', 'CNPJ'],
              }

              const shipping = {
                street: 'Rua Fidêncio Ramos',
                number: '308',
                additionalInfo: 'Pagar.me',
                neighborhood: 'Vila Olimpia',
                city: 'São Paulo',
                state: 'SP',
                zipcode: '04551010',
              }

              const cart = {
                items: [
                  {
                    id: 1,
                    title: 'Red pill',
                    unitPrice: 5000,
                    quantity: 1,
                    tangible: true,
                  },
                  {
                    id: 2,
                    title: 'Blue pill',
                    unitPrice: 5000,
                    quantity: 1,
                    tangible: true
                  }
                ]
              }

              const checkout = createCheckout({
                key,
                configs,
                transaction,
                customer,
                shipping,
                cart,
              })

              checkout
                .open()
              `

            cy.visit('/')

            cy.get('#btn-open-textarea').click()
            cy.get('#textarea-code').type(api)
            cy.get('#btn-open-checkout').click()
            cy.wait(300)

            cy.get('.cart__customerResume > div').then((elem) => {
              expect(elem.length).to.eq(3)
              expect(elem[0].innerHTML).to.eq('<p>Nome</p><p>Dan Abramov</p>')
              expect(elem[1].innerHTML).to.eq('<p>E-mail</p><p>mercurio@pagar.me</p>')
              expect(elem[2].innerHTML).to.eq('<p>Entrega</p><p>\nRua Fidêncio Ramos 308 - Pagar.me\n\nCEP 04551-010 - São Paulo - SP\n</p>')
            })
          })

          it('viewing values informations', () => {
            const api = `
              const key = 'ek_test_sjQXl3mVUFu1QQYpiSvUBaybtXtXjz';

              const configs = {
                enableCart: true
              }

              const transaction = {
                amount: 10000
              }

              const customer = {
                name: 'Dan Abramov',
                documentNumber: '19981596639',
                email: 'mercurio@pagar.me',
                phoneNumber: '1130442277',
                allowedDocuments: ['CPF', 'CNPJ'],
              }

              const shipping = {
                street: 'Rua Fidêncio Ramos',
                number: '308',
                additionalInfo: 'Pagar.me',
                neighborhood: 'Vila Olimpia',
                city: 'São Paulo',
                state: 'SP',
                zipcode: '04551010',
                fee: 1234,
              }

              const cart = {
                items: [
                  {
                    id: 1,
                    title: 'Red pill',
                    unitPrice: 5000,
                    quantity: 1,
                    tangible: true,
                  },
                  {
                    id: 2,
                    title: 'Blue pill',
                    unitPrice: 5000,
                    quantity: 1,
                    tangible: true
                  }
                ]
              }

              const checkout = createCheckout({
                key,
                configs,
                transaction,
                customer,
                shipping,
                cart,
              })

              checkout
                .open()
              `

            cy.visit('/')

            cy.get('#btn-open-textarea').click()
            cy.get('#textarea-code').type(api)
            cy.get('#btn-open-checkout').click()
            cy.wait(300)

            cy.get('.cart__amountResume > div').then((elem) => {
              expect(elem.length).to.eq(2)
            })

            cy.get('.cart__amountResume > div:first > p:first').should('exist')
            cy.get('.cart__amountResume > div:first > p:nth-child(2)').should('exist')
            cy.get('.cart__amountResume > div:first > p:last').should('exist')
            cy.get('.cart__amountResume > div:last > p:first').should('exist')
            cy.get('.cart__amountResume > div:last > p:nth-child(2)').should('exist')
            cy.get('.cart__amountResume > div:last > p:last').should('exist')

            cy.wait(300)

            cy.get('.cart__amountResume > div:first > p:first').then((elem) => {
              expect(elem[0].innerText).to.eq('Valor')
            })
            cy.get('.cart__amountResume > div:first > p:nth-child(2)').then((elem) => {
              expect(elem[0].innerText).to.eq('Frete')
            })
            cy.get('.cart__amountResume > div:first > p:last').then((elem) => {
              expect(elem[0].innerText).to.eq('TOTAL')
            })
            cy.get('.cart__amountResume > div:last').then((elem) => {
              expect(elem[0].innerText).contain('87,66')
              expect(elem[0].innerText).contain('12,34')
              expect(elem[0].innerText).contain('100,00')
            })
          })
        })
      })
    })
  })
})

