import { tomorrow, formatYYYYMMDD } from '../../../../src/utils/helpers/date'

describe('Custom', () => {
  describe('API', () => {
    describe('Minimal', () => {
      describe('Should fail', () => {
        it('without any config', () => {
          const api = `const checkout = createCheckout()

            checkout
              .open()
            `

          cy.visit('/')

          cy.get('#btn-open-textarea').click()
          cy.get('#textarea-code').type(api)
          cy.get('#btn-open-checkout').click()

          cy.on('uncaught:exception', (err) => {
            expect(err.message).contains('configs')
            expect(err.message).contains('undefined')

            return false
          })
        })

        it('with an empty object', () => {
          const api = `const checkout = createCheckout({})

            checkout
              .open()
            `

          cy.visit('/')

          cy.get('#btn-open-textarea').click()
          cy.get('#textarea-code').type(api)
          cy.get('#btn-open-checkout').click()

          cy.on('uncaught:exception', (err) => {
            expect(err.message).contains('reduce')
            expect(err.message).contains('undefined')

            return false
          })
        })

        it('with only encryption_key', () => {
          const api = `const key = 'ek_test_sjQXl3mVUFu1QQYpiSvUBaybtXtXjz';
            const checkout = createCheckout({
              key,
            })

            checkout
              .open()
            `

          cy.visit('/')

          cy.get('#btn-open-textarea').click()
          cy.get('#textarea-code').type(api)
          cy.get('#btn-open-checkout').click()

          cy.on('uncaught:exception', (err) => {
            expect(err.message).contains('reduce')
            expect(err.message).contains('undefined')

            return false
          })
        })

        it('with only configs object', () => {
          const api = `const configs = {
              companyName: 'Pagar.me',
              logo: './pagarme.png',
              themeBase: 'dark',
              primaryColor: '#7ad499',
              secondaryColor: '#46b67c',
              backgroundColor: '#2b2b2b',
              postback: 'http://pagar.me',
              orderUrl: 'http://www.google.com',
              enableCart: true,
              createTransaction: true,
            }

            const checkout = createCheckout({
              configs,
            })

            checkout
              .open()
            `

          cy.visit('/')

          cy.get('#btn-open-textarea').click()
          cy.get('#textarea-code').type(api)
          cy.get('#btn-open-checkout').click()

          cy.on('uncaught:exception', (err) => {
            expect(err.message).contains('reduce')
            expect(err.message).contains('undefined')

            return false
          })
        })

        it('with only customer object', () => {
          const api = `const customer = {
              name: 'Dan Abramov',
              documentNumber: '19981596639',
              email: 'mercurio@pagar.me',
              phoneNumber: '1130442277',
              allowedDocuments: ['CPF', 'CNPJ'],
            }

            const checkout = createCheckout({
              customer,
            })

            checkout
              .open()
            `

          cy.visit('/')

          cy.get('#btn-open-textarea').click()
          cy.get('#textarea-code').type(api)
          cy.get('#btn-open-checkout').click()

          cy.on('uncaught:exception', (err) => {
            expect(err.message).contains('reduce')
            expect(err.message).contains('undefined')

            return false
          })
        })

        it('with only billing object', () => {
          const api = `const billing = {
              street: 'Rua Fidêncio Ramos',
              number: '308',
              additionalInfo: 'Pagar.me',
              neighborhood: 'Vila Olimpia',
              city: 'São Paulo',
              state: 'SP',
              zipcode: '04551010',
            }

            const checkout = createCheckout({
              billing,
            })

            checkout
              .open()
            `

          cy.visit('/')

          cy.get('#btn-open-textarea').click()
          cy.get('#textarea-code').type(api)
          cy.get('#btn-open-checkout').click()

          cy.on('uncaught:exception', (err) => {
            expect(err.message).contains('reduce')
            expect(err.message).contains('undefined')

            return false
          })
        })

        it('with only shipping object', () => {
          const api = `const shipping = {
              street: 'Rua Fidêncio Ramos',
              number: '308',
              additionalInfo: 'Pagar.me',
              neighborhood: 'Vila Olimpia',
              city: 'São Paulo',
              state: 'SP',
              zipcode: '04551010',
              fee: 1599,
            }

            const checkout = createCheckout({
              shipping,
            })

            checkout
              .open()
            `

          cy.visit('/')

          cy.get('#btn-open-textarea').click()
          cy.get('#textarea-code').type(api)
          cy.get('#btn-open-checkout').click()

          cy.on('uncaught:exception', (err) => {
            expect(err.message).contains('reduce')
            expect(err.message).contains('undefined')

            return false
          })
        })

        it('with only cart object', () => {
          const api = `const cart = {
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
                },
                {
                  id: 3,
                  title: 'Orange pill',
                  unitPrice: 6000,
                  quantity: 2,
                  tangible: true,
                },
                {
                  id: 4,
                  title: 'Green pill',
                  unitPrice: 1000,
                  quantity: 10,
                  tangible: true,
                },
                {
                  id: 6,
                  title: 'White pill',
                  unitPrice: 6000,
                  quantity: 2,
                  tangible: true,
                },
                {
                  id: 7,
                  title: 'Black pill',
                  unitPrice: 1000,
                  quantity: 10,
                  tangible: true,
                },
              ],
            }

            const checkout = createCheckout({
              cart,
            })

            checkout
              .open()
            `

          cy.visit('/')

          cy.get('#btn-open-textarea').click()
          cy.get('#textarea-code').type(api)
          cy.get('#btn-open-checkout').click()

          cy.on('uncaught:exception', (err) => {
            expect(err.message).contains('The "key" parameter is required')

            return false
          })
        })

        it('with only transaction object', () => {
          const api = `const transaction = {
              amount: 10000,
              paymentMethods: [
                ['creditcard', 'creditcard'],
                ['creditcard', 'boleto'],
              ],
              defaultMethod: 'creditcard',
              paymentConfig: {
                boleto: {
                  subtitle: '10% de desconto :)',
                  softDescriptor: 'Company name',
                  instructions: 'Use this field to add instructions',
                  expirationAt: '${formatYYYYMMDD(tomorrow)}',
                  discount: {
                    type: 'percentage',
                    value: 25,
                  },
                },
                creditcard: {
                  subtitle: 'Em até 3x sem juros!',
                  invoiceDescriptor: 'Mercurio :)',
                  installments: {
                    initial: 2,
                    max: 10,
                    free: 3,
                    interestRate: 12,
                  },
                },
              },
            }

            const checkout = createCheckout({
              transaction,
            })

            checkout
              .open()
            `

          cy.visit('/')

          cy.get('#btn-open-textarea').click()
          cy.get('#textarea-code').type(api)
          cy.get('#btn-open-checkout').click()

          cy.on('uncaught:exception', (err) => {
            expect(err.message).contains('The "key" parameter is required')

            return false
          })
        })

        it('with invalid amount type', () => {
          const api = `const key = 'ek_test_sjQXl3mVUFu1QQYpiSvUBaybtXtXjz';
            const transaction = {
              amount: "10000",
              paymentMethods: [
                ['creditcard', 'creditcard'],
                ['creditcard', 'boleto'],
              ],
              defaultMethod: 'creditcard',
              paymentConfig: {
                boleto: {
                  subtitle: '10% de desconto :)',
                  softDescriptor: 'Company name',
                  instructions: 'Use this field to add instructions',
                  expirationAt: '${formatYYYYMMDD(tomorrow)}',
                  discount: {
                    type: 'percentage',
                    value: 25,
                  },
                },
                creditcard: {
                  subtitle: 'Em até 3x sem juros!',
                  invoiceDescriptor: 'Mercurio :)',
                  installments: {
                    initial: 2,
                    max: 10,
                    free: 3,
                    interestRate: 12,
                  },
                },
              },
            }

            const checkout = createCheckout({
              key,
              transaction,
            })

            checkout
              .open()
            `

          cy.visit('/')

          cy.get('#btn-open-textarea').click()
          cy.get('#textarea-code').type(api)
          cy.get('#btn-open-checkout').click()

          cy.on('uncaught:exception', (err) => {
            expect(err.message).contains('The "amount" parameter should be Number')

            return false
          })
        })
      })

      describe('Should open', () => {
        it('with minimal configuration', () => {
          const api = `
            const key = 'ek_test_sjQXl3mVUFu1QQYpiSvUBaybtXtXjz';

            const transaction = {
              amount: 10000,
            }

            const checkout = createCheckout({
              key,
              transaction,
            })

            checkout
              .open()
            `

          cy.visit('/')

          cy.get('#btn-open-textarea').click()
          cy.get('#textarea-code').type(api)
          cy.get('#btn-open-checkout').click()
        })
      })
    })
  })
})

