import { combineReducers } from 'redux'
import addresses from './addresses'
import cart from './cart'
import installments from './installments'
import pageInfo from './pageInfo'
import transactionValues from './transactionValues'

const checkoutReducer = combineReducers({
  addresses,
  cart,
  installments,
  pageInfo,
  transactionValues,
})

export default checkoutReducer
