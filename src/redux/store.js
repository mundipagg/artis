import { createStore, applyMiddleware } from 'redux'
import reducers from './reducers'
import calcAmount from '../utils/calculations/calcAmount'

const middlewares = []

if (process.env.NODE_ENV === 'development') {
  const { logger } = require('redux-logger') // eslint-disable-line
  middlewares.push(logger)
}

export default ({
  customer,
  shipping,
  billing,
  cart,
  transaction,
}) => {
  const amount = calcAmount(cart, shipping, transaction)

  return createStore(
    reducers,
    {
      pageInfo: {
        customer,
        shipping,
        billing,
        cart,
      },
      transactionValues: {
        ...transaction,
        amount,
        finalAmount: amount,
      },
    },
    applyMiddleware(...middlewares)
  )
}
