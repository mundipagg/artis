export const addInstallments = payload => ({
  type: 'ADD_INSTALLMENTS',
  payload,
})

export const addPageInfo = payload => ({
  type: 'ADD_PAGE_INFO',
  payload,
})

export const addTransactionValues = payload => ({
  type: 'ADD_TRANSACTIONS_VALUES',
  payload,
})

export const changeScreenSize = size => ({
  type: 'CHANGE_SCREEN_SIZE',
  size,
})

export const updateFinalAmount = payload => ({
  type: 'UPDATE_FINAL_AMOUNT',
  payload,
})

export const toggleCart = () => ({
  type: 'TOGGLE',
})

export const toggleSameAddressForShipping = () => ({
  type: 'TOGGLE_SAME_ADDRESS_FOR_SHIPPING',
})
