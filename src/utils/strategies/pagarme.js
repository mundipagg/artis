import {
  always,
  applySpec,
  cond,
  concat,
  defaultTo,
  equals,
  identity,
  merge,
  map,
  of,
  path,
  pathOr,
  pipe,
  prop,
  propOr,
  replace,
  T,
  toString,
} from 'ramda'

const url = 'https://api.pagar.me/1/transactions'

const getPaymentMethodType = path(['payment', 'method', 'type'])

const parseCreditcardData = applySpec({
  card_number: path(['payment', 'info', 'cardNumber']),
  card_cvv: path(['payment', 'info', 'cvv']),
  card_expiration_date: pipe(
    path(['payment', 'info', 'expiration']),
    replace(/\//g, ''),
  ),
  soft_descriptor: path(['payment', 'method', 'statementDescriptor']),
  card_holder_name: path(['payment', 'info', 'holderName']),
})

const parseBoletoData = applySpec({
  boleto_expiration_date: path(['payment', 'method', 'expirationAt']),
  boleto_instructions: path(['payment', 'method', 'instructions']),
})

const parseToPayload = applySpec({
  encryption_key: prop('publickey'),
  amount: prop('amount'),
  payment_method: pipe(
    getPaymentMethodType,
    cond([
      [equals('creditcard'), always('credit_card')],
      [T, identity],
    ])
  ),
  customer: pipe(
    prop('customer'),
    applySpec({
      external_id: pipe(
        propOr('#1', 'externalId'),
        toString,
      ),
      name: prop('name'),
      type: pipe(
        prop('type'),
        defaultTo('individual'),
      ),
      country: always('br'),
      email: prop('email'),
      documents: pipe(
        applySpec({
          type: always('cpf'),
          number: prop('documentNumber'),
        }),
        of,
      ),
      phone_numbers: pipe(
        prop('phoneNumber'),
        concat('+55'),
        of,
      ),
    }),
  ),
  items: pipe(
    prop('items'),
    map(
      applySpec({
        id: pipe(
          prop('id'),
          toString
        ),
        title: prop('title'),
        unit_price: prop('unitPrice'),
        quantity: prop('quantity'),
        category: propOr('none', 'category'),
        tangible: prop('tangible'),
      })
    )
  ),
  billing: applySpec({
    name: pathOr('Billing Address', ['billing', 'name']),
    address: applySpec({
      state: path(['billing', 'state']),
      city: path(['billing', 'city']),
      neighborhood: path(['billing', 'neighborhood']),
      street: path(['billing', 'street']),
      street_number: path(['billing', 'number']),
      zipcode: path(['billing', 'zipcode']),
      country: pathOr('br', ['billing', 'country']),
    }),
  }),
  split_rules: path(['transaction', 'splitRules']),
})

const getPaymentMethodData = (data) => {
  switch (getPaymentMethodType(data)) {
    case 'boleto':
      return parseBoletoData(data)
    case 'creditcard':
      return parseCreditcardData(data)
    default:
      throw new Error('Payment method not supported.')
  }
}

/*
* Use this method to mock boleto_barcode and boleto_url.
* Remove this after merge PR 883 in pagarme-core.
* https://github.com/pagarme/pagarme-core/pull/883
* Methods: mergeBoletoParams and mockBoletoData.
*/
const mockBoletoData = paymentType => (data) => {
  if (data.boleto_barcode && data.boleto_url) {
    return data
  }

  if (paymentType === 'boleto') {
    return merge(
      data,
      {
        boleto_url: './boleto.pdf',
        boleto_barcode: '123456789123456789',
      },
    )
  }

  return data
}

const strategy = (data) => {
  const commonPayload = parseToPayload(data)
  const paymentData = getPaymentMethodData(data)
  const fullPayload = merge(paymentData, commonPayload)

  return fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-PagarMe-Version': '2017-08-28',
    },
    method: 'POST',
    body: JSON.stringify(fullPayload),
  })
    .then(response => response.json())
    .then(mockBoletoData(getPaymentMethodType(data)))
}

export default strategy

