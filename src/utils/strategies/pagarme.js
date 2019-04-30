import {
  always,
  applySpec,
  assoc,
  concat,
  cond,
  defaultTo,
  equals,
  identity,
  ifElse,
  map,
  merge,
  of,
  omit,
  path,
  pathOr,
  pipe,
  prop,
  propOr,
  replace,
  T,
  toString,
  values,
} from 'ramda'
import pagarme from 'pagarme'

import { formatToBRL, removeMask } from '../masks'
import getCheckoutVersion from '../helpers/getCheckoutVersion'
import URLS from './urls'

const apiVersion = '2017-08-28'
const checkoutVersion = getCheckoutVersion()

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
  soft_descriptor: path(['payment', 'method', 'softDescriptor']),
})

const parseToPayload = applySpec({
  encryption_key: prop('key'),
  postback_url: prop('postback'),
  capture: always(true),
  amount: prop('amount'),
  payment_method: pipe(
    getPaymentMethodType,
    cond([
      [equals('creditcard'), always('credit_card')],
      [T, identity],
    ])
  ),
  installments: pathOr(1, ['payment', 'info', 'installments']),
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
        removeMask,
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
  shipping: applySpec({
    name: pathOr('Shipping Address', ['billing', 'name']),
    fee: pathOr(0, ['shipping', 'fee']),
    address: applySpec({
      state: path(['shipping', 'state']),
      city: path(['shipping', 'city']),
      neighborhood: path(['shipping', 'neighborhood']),
      street: path(['shipping', 'street']),
      street_number: path(['shipping', 'number']),
      zipcode: path(['shipping', 'zipcode']),
      country: pathOr('br', ['shipping', 'country']),
    }),
  }),
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

const buildInstallmentName = (interestRate, free) => (installment) => {
  const {
    installment: index,
    installment_amount: installmentAmount,
  } = installment

  const hasInterestRate = index <= free
    ? 'sem juros'
    : 'com juros'

  return `${index}x de ${formatToBRL(installmentAmount)} ${hasInterestRate}`
}

const parseInterestRate = (interestRate, free) => ({ installment }) => (
  installment <= free ? 0 : interestRate
)

const getInstallmentPayload = applySpec({
  encryption_key: prop('key'),
  amount: prop('amount'),
  free_installments: prop('free'),
  max_installments: prop('max'),
  interest_rate: prop('interestRate'),
})

const getCheckoutData = ({
  customer,
  billing,
  shipping,
  cart,
  transaction,
}) =>
  Promise.resolve({
    customer,
    billing,
    shipping,
    cart,
    transaction,
  })

const getInstallments = (key, amount, installment) => {
  const url = new URL(URLS.pagarme.installments)

  const payload = getInstallmentPayload(
    merge({ key, amount }, installment)
  )

  const {
    interest_rate: interestRate,
    free_installments: freeInstallments,
  } = payload

  Object.keys(payload).forEach(objKey =>
    url.searchParams.append(objKey, payload[objKey])
  )

  const configs = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-PagarMe-Version': apiVersion,
      'X-PagarMe-User-Agent': `Checkout/${checkoutVersion}`,
    },
    method: 'GET',
  }

  const parseInstallmentResponse = pipe(
    propOr({}, 'installments'),
    values,
    map(applySpec({
      installment: prop('installment'),
      amount: prop('amount'),
      installmentAmount: prop('installment_amount'),
      interest: parseInterestRate(
        interestRate,
        payload.free_installments,
      ),
      value: pipe(
        prop('installment'),
        toString,
      ),
      name: buildInstallmentName(
        interestRate,
        freeInstallments,
      ),
    }))
  )

  return fetch(url, configs)
    .then(response => response.json())
    .then(parseInstallmentResponse)
}

const parseCardId = applySpec({
  card_id: prop('cardId'),
})

const request = (data) => {
  const commonPayload = parseToPayload(data)
  const paymentData = ifElse(
    prop('cardId'),
    parseCardId,
    getPaymentMethodData,
  )(data)
  const fullPayload = merge(paymentData, commonPayload)

  if (propOr(true, 'createTransaction', data) === false) {
    if (commonPayload.payment_method === 'credit_card') {
      return pagarme.client
        .connect({ encryption_key: commonPayload.encryption_key })
        .then(client => client.security.encrypt(paymentData))
        .then(cardHash => (
          assoc(
            'card_hash',
            cardHash,
            omit([
              'card_cvv',
              'card_expiration_date',
              'card_holder_name',
              'card_number',
            ], fullPayload)
          )
        ))
    }

    return Promise.resolve(fullPayload)
  }

  const url = URLS.pagarme.transaction

  const configs = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-PagarMe-Version': apiVersion,
      'X-PagarMe-User-Agent': `Checkout/${checkoutVersion}`,
    },
    method: 'POST',
    body: JSON.stringify(fullPayload),
  }

  return fetch(url, configs)
    .then(response => response.json())
    .then(getPaymentMethodType(data))
}

const prepare = (apiData) => {
  const { key, transaction } = apiData
  const amount = propOr(0, 'amount', transaction)

  const installments = pathOr({}, [
    'paymentConfig',
    'creditcard',
    'installments',
  ], transaction)

  return Promise.all([
    getCheckoutData(apiData),
    getInstallments(key, amount, installments),
  ])
}

const createCard = (payload) => {
  const url = URLS.pagarme.cards

  const configs = {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-PagarMe-Version': apiVersion,
      'X-PagarMe-User-Agent': `Checkout/${checkoutVersion}`,
    },
    method: 'POST',
    body: JSON.stringify(payload),
  }

  return fetch(url, configs)
    .then(response => response.json())
}

export default {
  createCard,
  prepare,
  request,
}
