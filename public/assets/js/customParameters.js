/* eslint-disable */
const tomorrow = moment().add(1, 'days').format('YYYY-MM-DD')

const mundipaggApi = `const configs = {
  token: 'SOME_TOKEN_HERE',
};`

const pagarmeApi = `const key = 'ek_test_f9cws0bU9700VqWE4UDuBlKLbvX4IO';

const configs = {
  companyName: 'Pagar.me',
  logo: './pagarme.png',
  themeBase: 'dark',
  primaryColor: '#7ad499',
  secondaryColor: '#46b67c',
  headerFooterColor: 'red',
  backgroundColor: '#2b2b2b',
  orderUrl: 'http://www.google.com',
  enableCart: true,
  createTransaction: true,
  antifraud: false,
  postback: 'http://pagar.me',
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

const transaction = {
  amount: 10000,
  paymentMethods: [
    'creditcard',
    'boleto',
  ],
  defaultMethod: 'creditcard',
  paymentConfig: {
    boleto: {
      subtitle: '10% de desconto :)',
      softDescriptor: 'Company name',
      instructions: 'Use this field to add instructions',
      expirationAt: '${tomorrow}',
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
  configs,
  customer,
  billing,
  shipping,
  cart,
  transaction,
})

const onSuccess = data => console.log('onSuccess callback', data)
const onError = err => console.log('onError callback', err)
const onClose = () => console.log('onClose callback')

const pages = {
  customer: {
    onEnter: () => console.log('customer page onEnter callback'),
    onExit: () => console.log('customer page onExit callback'),
  },
  billing: {
    onEnter: () => console.log('billing page onEnter callback'),
    onExit: () => console.log('billing page onExit callback'),
  },
  shipping: {
    onEnter: () => console.log('shipping page onEnter callback'),
    onExit: () => console.log('shipping page onExit callback'),
  },
  payment: {
    selection: {
      onEnter: () => console.log('payment selection page onEnter callback'),
      onExit: () => console.log('payment selection page onExit callback'),
    },
    singleCreditcard: {
      onEnter: () => console.log('payment singleCreditcard page onEnter callback'),
      onExit: () => console.log('payment singleCreditcard page onExit callback'),
    },
    singleBoleto: {
      onEnter: () => console.log('payment singleBoleto page onEnter callback'),
      onExit: () => console.log('payment singleBoleto page onExit callback'),
    }
  }
}

checkout
  .onSuccess(onSuccess)
  .onError(onError)
  .onClose(onClose)
  .pages(pages)
  .open()
`
