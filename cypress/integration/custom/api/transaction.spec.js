import { tomorrow, formatYYYYMMDD } from '../../../../src/utils/helpers/date'

describe('Custom', () => {
  describe('API', () => {
    describe('Transaction ', () => {
      describe('Should be successful ', () => {
        describe('with a boleto transaction', () => {
          let api = `
            const key = 'ek_test_sjQXl3mVUFu1QQYpiSvUBaybtXtXjz';

            const configs = {
              createTransaction: true,
            }

            const customer = {
              name: 'Dan Abramov',
              documentNumber: '19981596639',
              email: 'mercurio@pagar.me',
              phoneNumber: '1130442277',
              allowedDocuments: ['CPF', 'CNPJ'],
            }

            const billing = {
              street: 'Rua Fidêncio Ramos',
              number: '308',
              additionalInfo: 'Pagar.me',
              neighborhood: 'Vila Olimpia',
              city: 'São Paulo',
              state: 'SP',
              zipcode: '04551010',
            }

            const shipping = {
              street: 'Rua Fidêncio Ramos',
              number: '308',
              additionalInfo: 'Pagar.me',
              neighborhood: 'Vila Olimpia',
              city: 'São Paulo',
              state: 'SP',
              zipcode: '04551010',
              fee: 1599,
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
                  tangible: true,
                }
              ]
            }

            const transaction = {
              amount: 10000,
              paymentConfig: {
                boleto: {
                  subtitle: '10% de desconto :)',
                  expirationAt: '${formatYYYYMMDD(tomorrow)}',
                  discount: {
                    type: 'percentage',
                    value: 25,
                  },
                },
              },
            }

            const checkout = createCheckout({
              key,
              configs,
              customer,
              billing,
              shipping,
              cart,
              transaction,
            })

            checkout
              .open()
            `

          it('and showing the subtitle', () => {
            cy.visit('/')

            cy.get('#btn-open-textarea').click()
            cy.get('#textarea-code').type(api)
            cy.get('#btn-open-checkout').click()
            cy.wait(300)

            cy.get('.actionButton__wrapper:last .actionButton__subtitle').should('exist')

            cy.get('.actionButton__wrapper:last .actionButton__subtitle').then((elem) => {
              expect(elem[0].innerText).contains('10% De Desconto :)')
            })

            cy.get('.actionButton__textWrapper:last').click()
            cy.get('[type="submit"]:last').click()


            cy.get('.boletoPage__subtitle').should('exist')

            cy.get('.boletoPage__subtitle').then((elem) => {
              expect(elem[0].innerText).contains('10% de desconto :)')
            })
          })

          it('and showing the discount using percentage', () => {
            cy.visit('/')

            cy.get('#btn-open-textarea').click()
            cy.get('#textarea-code').type(api)
            cy.get('#btn-open-checkout').click()
            cy.wait(300)

            cy.get('.actionButton__textWrapper:last').click()
            cy.get('[type="submit"]:last').click()

            cy.get('.boletoPage__amount').should('exist')

            cy.get('.boletoPage__amount').then((elem) => {
              expect(elem[0].innerText).contains('75,00')
            })
          })

          it('and showing the discount using value', () => {
            api = `
              const key = 'ek_test_sjQXl3mVUFu1QQYpiSvUBaybtXtXjz';

              const configs = {
                createTransaction: true,
              }

              const customer = {
                name: 'Dan Abramov',
                documentNumber: '19981596639',
                email: 'mercurio@pagar.me',
                phoneNumber: '1130442277',
                allowedDocuments: ['CPF', 'CNPJ'],
              }

              const billing = {
                street: 'Rua Fidêncio Ramos',
                number: '308',
                additionalInfo: 'Pagar.me',
                neighborhood: 'Vila Olimpia',
                city: 'São Paulo',
                state: 'SP',
                zipcode: '04551010',
              }

              const shipping = {
                street: 'Rua Fidêncio Ramos',
                number: '308',
                additionalInfo: 'Pagar.me',
                neighborhood: 'Vila Olimpia',
                city: 'São Paulo',
                state: 'SP',
                zipcode: '04551010',
                fee: 1599,
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
                    tangible: true,
                  }
                ]
              }

              const transaction = {
                amount: 10000,
                paymentConfig: {
                  boleto: {
                    subtitle: '10% de desconto :)',
                    expirationAt: '${formatYYYYMMDD(tomorrow)}',
                    discount: {
                      value: 5000,
                    },
                  },
                },
              }

              const checkout = createCheckout({
                key,
                configs,
                customer,
                billing,
                shipping,
                cart,
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

            cy.get('.actionButton__textWrapper:last').click()
            cy.get('[type="submit"]:last').click()

            cy.get('.boletoPage__amount').should('exist')

            cy.get('.boletoPage__amount').then((elem) => {
              expect(elem[0].innerText).contains('50,00')
            })
          })
        })

        describe('with a credit card transaction', () => {
          const api = `
              const key = 'ek_test_sjQXl3mVUFu1QQYpiSvUBaybtXtXjz';

              const configs = {
                createTransaction: true,
              }

              const customer = {
                name: 'Dan Abramov',
                documentNumber: '19981596639',
                email: 'mercurio@pagar.me',
                phoneNumber: '1130442277',
                allowedDocuments: ['CPF', 'CNPJ'],
              }

              const billing = {
                street: 'Rua Fidêncio Ramos',
                number: '308',
                additionalInfo: 'Pagar.me',
                neighborhood: 'Vila Olimpia',
                city: 'São Paulo',
                state: 'SP',
                zipcode: '04551010',
              }

              const shipping = {
                street: 'Rua Fidêncio Ramos',
                number: '308',
                additionalInfo: 'Pagar.me',
                neighborhood: 'Vila Olimpia',
                city: 'São Paulo',
                state: 'SP',
                zipcode: '04551010',
                fee: 1599,
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
                    tangible: true,
                  }
                ]
              }

              const transaction = {
                amount: 10000,
                paymentConfig: {
                  boleto: {
                    subtitle: '10% de desconto :)',
                    expirationAt: '${formatYYYYMMDD(tomorrow)}',
                    discount: {
                      value: 5000,
                    },
                  },
                  creditcard: {
                    subtitle: 'Em até 3x sem juros!',
                    invoiceDescriptor: 'Mercurio :)',
                    installments: {
                      initial: 2,
                      max: 5,
                      free: 3,
                      interestRate: 25,
                    },
                  },
                },
              }

              const checkout = createCheckout({
                key,
                configs,
                customer,
                billing,
                shipping,
                cart,
                transaction,
              })

              checkout
                .open()
              `

          it('and showing the subtitle', () => {
            cy.visit('/')

            cy.get('#btn-open-textarea').click()
            cy.get('#textarea-code').type(api)
            cy.get('#btn-open-checkout').click()
            cy.wait(300)

            cy.get('.actionButton__textWrapper:first').click()
            cy.get('[type="submit"]:last').click()

            cy.get('.creditcardPage__subtitle').should('exist')
            cy.get('.creditcardPage__subtitle').then((elem) => {
              expect(elem[0].innerText).contains('Em até 3x sem juros!')
            })
          })

          it('and showing 5 installment options ', () => {
            cy.visit('/')

            cy.get('#btn-open-textarea').click()
            cy.get('#textarea-code').type(api)
            cy.get('#btn-open-checkout').click()
            cy.wait(300)

            cy.get('.actionButton__textWrapper:first').click()
            cy.get('[type="submit"]:last').click()

            cy.get('.dropdown__select').should('exist')
            cy.get('.dropdown__option').should('exist')

            cy.get('.dropdown__option').then((elem) => {
              expect(elem.length).to.be.at.least(5)
              expect(elem).to.have.length.of.at.most(6)
            })
          })

          it('and showing 3 free installment options ', () => {
            cy.visit('/')

            cy.get('#btn-open-textarea').click()
            cy.get('#textarea-code').type(api)
            cy.get('#btn-open-checkout').click()
            cy.wait(300)

            cy.get('.actionButton__textWrapper:first').click()
            cy.get('[type="submit"]:last').click()

            cy.get('.dropdown__option').then((elem) => {
              expect(elem[1].innerText).contains('100,00 sem juros')
              expect(elem[1].innerText).contains('1x')
              expect(elem[2].innerText).contains('50,00 sem juros')
              expect(elem[2].innerText).contains('2x')
              expect(elem[3].innerText).contains('33,33 sem juros')
              expect(elem[3].innerText).contains('3x')
              expect(elem[4].innerText).not.contains('25,00 com juros')
              expect(elem[4].innerText).not.contains('25,00 sem juros')
              expect(elem[4].innerText).contains('4x')
              expect(elem[5].innerText).not.contains('20,00 sem juros')
              expect(elem[5].innerText).not.contains('20,00 com juros')
              expect(elem[5].innerText).contains('5x')
            })
          })

          it('and showing 2 interest installment options ', () => {
            cy.visit('/')

            cy.get('#btn-open-textarea').click()
            cy.get('#textarea-code').type(api)
            cy.get('#btn-open-checkout').click()
            cy.wait(300)

            cy.get('.actionButton__textWrapper:first').click()
            cy.get('[type="submit"]:last').click()

            cy.get('.dropdown__option').then((elem) => {
              expect(elem[4].innerText).contains('4x')
              expect(elem[4].innerText).contains('50,00 com juros')
              expect(elem[5].innerText).contains('5x')
              expect(elem[5].innerText).contains('45,00 com juros')
            })
          })
        })
      })
    })
  })
})

