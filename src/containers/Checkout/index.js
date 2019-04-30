import React from 'react'
import ReactDOM from 'react-dom'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { ThemeConsumer } from 'former-kit'
import { connect } from 'react-redux'
import { State, withStatechart } from 'react-automata'
import ReactGA from 'react-ga'
import {
  __,
  always,
  and,
  any,
  assoc,
  complement,
  dissoc,
  equals,
  filter,
  has,
  head,
  identity,
  ifElse,
  isNil,
  keys,
  length,
  merge,
  not,
  path,
  pathOr,
  pipe,
  prop,
  propEq,
  propOr,
  reject,
  type,
} from 'ramda'

import {
  addInstallments,
  addPageInfo,
  addTransactionValues,
} from '../../redux/actions'
import strategies from '../../utils/strategies'
import getErrorMessage from '../../utils/data/errorMessages'
import {
  hasRequiredPageData,
  isFormValid,
} from '../../utils/validations'
import calcAmount from '../../utils/calculations/calcAmount'
import { insertStaticPosition } from '../../utils/helpers/bodyCss'

import {
  AnalysisInfo,
  Cart,
  ErrorInfo,
  Footer,
  Header,
  LoadingInfo,
  SuccessInfo,
} from '../../components'

import CustomerPage from '../../pages/Customer'
import BillingPage from '../../pages/Billing'
import ShippingPage from '../../pages/Shipping'
import PaymentOptionsPage from '../../pages/Payment/PaymentOptions'
import CreditCardPage from '../../pages/Payment/CreditCard'
import BoletoPage from '../../pages/Payment/Boleto'

import CloseIcon from '../../images/checkout-close.svg'

import statechart from './statechart'
import steps from './steps'

const consumeTheme = ThemeConsumer('UICheckout')

const getActiveStep = ifElse(
  pipe(type, equals('Object')),
  pipe(keys, head),
  identity,
)

const isOnlyCreationOfCardId = (status, errors) => (
  isNil(status) && isNil(errors)
)

const isTransactionSuccess = status =>
  status === 'authorized' || status === 'waiting_payment'

const isTransactionAnalysis = status =>
  status === 'processing' || status === 'pending_review'

const getBoletoInformations = (thisOfClass) => {
  const choosedPaymentType = path([
    'props',
    'pageInfo',
    'payment',
    'type',
  ], thisOfClass)

  if (choosedPaymentType === 'boleto') {
    return {
      title: 'Aguardando pagamento',
      subtitle: 'Seu boleto será gerado em breve',
      text: 'Em breve o lojista lhe enviará o boleto bancário.',
    }
  }

  return {}
}

class Checkout extends React.Component {
  state = {
    closingEffect: false,
    steps,
  }

  componentWillMount () {
    const { apiData, apiErrors } = this.props
    const onError = path([
      'callbacks',
      'onError',
    ], apiData)

    if (onError && length(apiErrors)) {
      onError({
        name: 'API_ERROR',
        message: apiErrors,
      })
    }

    if (length(apiErrors)) {
      throw new Error(apiErrors)
    }
  }

  onTransactionReturn = ({
    response,
    onSuccess,
    onError,
  }) => {
    const {
      creditCard,
      transition,
    } = this.props

    const {
      status,
      errors,
    } = response

    const callbackPayload = this.replaceCardhashIfCardIdIsPresent(
      response,
      creditCard
    )

    const choosedPaymentType = path([
      'props',
      'pageInfo',
      'payment',
      'type',
    ], this)

    if (isOnlyCreationOfCardId(status, errors)) {
      if (onSuccess) {
        onSuccess(callbackPayload)
      }

      return this.close()
    }

    if (isTransactionSuccess(status)) {
      if (onSuccess) {
        this.submitForm()
        onSuccess(callbackPayload)
      }

      if (choosedPaymentType === 'boleto') {
        return transition('TRANSACTION_ANALYSIS')
      }

      return transition('TRANSACTION_SUCCESS')
    }

    if (isTransactionAnalysis(status)) {
      return transition('TRANSACTION_ANALYSIS')
    }

    const errorMessage = getErrorMessage(response)

    if (onError) {
      onError(errorMessage)
    }

    return this.setState({
      transactionErrors: errors,
    }, transition('TRANSACTION_FAILURE'))
  }

  getProp = (item, props) => {
    if (item === 'orderUrl') {
      return pathOr({}, [
        'apiData',
        'configs',
        'orderUrl',
      ], props)
    }

    if (item === 'finalAmount') {
      return prop('finalAmount', props)
    }

    if (item === 'boletoBarcode') {
      return prop('boletoBarcode', this.state)
    }

    if (item === 'boletoUrl') {
      return prop('boletoUrl', this.state)
    }

    if (item === 'boletoName') {
      return pathOr({}, [
        'apiData',
        'transaction',
        'paymentConfig',
        'boleto',
        'fileName',
      ], props)
    }

    if (item === 'boletoExpiration') {
      return pathOr({}, [
        'apiData',
        'transaction',
        'paymentConfig',
        'boleto',
        'expirationAt',
      ], props)
    }

    if (item === 'creditCardInstallmentsText') {
      return pathOr({}, [
        'pageInfo',
        'payment',
        'info',
        'installmentText',
      ], props)
    }

    return null
  }

  getInitialData = () => {
    const {
      acquirerName,
      creditCard,
      handleAddInstallments,
    } = this.props
    const acquirer = strategies[acquirerName]
    const apiData = assoc('creditCard', creditCard, this.props.apiData)

    ReactGA.pageview('/loading')
    acquirer.prepare(apiData)
      .then((response) => {
        const [checkoutData, installments] = response

        this.saveAllPageInfos(checkoutData)
        this.saveTransactionValues(checkoutData)
        handleAddInstallments(installments)

        this.navigateNextPage()
      })
  }

  submitForm () {
    const { form } = this.props

    if (form) {
      form.submit()
    }
  }

  replaceCardhashIfCardIdIsPresent = (response, creditCard) => {
    const addCardId = pipe(
      prop('cardId'),
      assoc('cardId', __, response),
      dissoc('card_hash')
    )

    return ifElse(
      has('cardId'),
      addCardId,
      always(response)
    )(creditCard)
  }

  saveTransactionValues = (checkoutData) => {
    const { handleAddTransactionValues } = this.props
    const { transaction, cart, shipping } = checkoutData

    const amount = calcAmount(cart, shipping, transaction)
    const defaultMethod = prop('defaultMethod', transaction)
    const paymentConfig = prop('paymentConfig', transaction)

    handleAddTransactionValues({
      amount,
      defaultMethod,
      paymentConfig,
    })
  }

  saveAllPageInfos = (checkoutData) => {
    const {
      cart,
      customer,
      billing,
      shipping,
    } = checkoutData
    const { handleAddPageInfo } = this.props

    handleAddPageInfo({
      page: 'cart',
      pageInfo: cart,
    })

    handleAddPageInfo({
      page: 'customer',
      pageInfo: customer,
    })

    handleAddPageInfo({
      page: 'billing',
      pageInfo: billing,
    })

    handleAddPageInfo({
      page: 'shipping',
      pageInfo: shipping,
    })
  }

  navigateToPage () {
    const value = pathOr('', ['machineState', 'value'], this.props)
    const antifraud = pathOr(
      true,
      ['apiData', 'configs', 'antifraud'],
      this.props
    )
    const page = getActiveStep(value)
    const tangible = prop('tangible')
    const cartItems = pathOr([], ['apiData', 'cart', 'items'], this.props)

    const isAllItemsTangible = any(tangible, cartItems)

    if (
      page === 'addresses' &&
      hasRequiredPageData(page, this.props, 'billing') &&
      (!isAllItemsTangible && !antifraud)
    ) {
      const haveAddresses = propEq('page', 'addresses')
      this.setState({
        steps: reject(haveAddresses, this.state.steps),
      })

      this.navigateNextPage()

      return
    }

    if (!hasRequiredPageData(page, this.props)) {
      ReactGA.pageview(`/${page}`)
      return
    }

    this.setState({
      steps: filter(pipe(
        prop('page'), complement(equals)(page)
      ), this.state.steps),
    })

    this.navigateNextPage()
  }

  navigateBackToPage () {
    const value = pathOr('', ['machineState', 'value'], this.props)
    const page = getActiveStep(value)

    if (!hasRequiredPageData(page, this.props)) {
      ReactGA.pageview(`/${page}`)
      return
    }

    this.navigatePrevPage()
  }

  handlePageTransition = page => () => this.props.transition(page)

  shouldRedirectToShipping = (machineState, sameAddressForShipping) => {
    const addresses = path(['value', 'addresses'], machineState)
    const payment = path(['history', 'value', 'payment'], machineState)

    const isBillingPage = addresses === 'billing'
    const isPrevPagePaymentOptions = payment === 'selection'

    return isBillingPage && isPrevPagePaymentOptions && !sameAddressForShipping
  }

  navigatePreviousPage = () => {
    const { machineState, sameAddressForShipping } = this.props
    const { value } = machineState

    const isFirstPage = equals(
      pipe(
        head,
        prop('page'),
      )(this.state.steps)
    )

    if (isFirstPage(value)) {
      return false
    }

    const currentStateKey = head(Object.keys(value))
    const currentStateValue = head(Object.values(value))

    if (this.shouldRedirectToShipping(machineState, sameAddressForShipping)) { //eslint-disable-line
      this.props.transition('SHIPPING')
    }

    if (and(
      equals(currentStateKey, 'confirmation'),
      complement(equals)(currentStateValue, 'failure')
    )) {
      return false
    }

    if (and(
      isFirstPage('payment'),
      and(
        equals(currentStateKey, 'payment'),
        equals(currentStateValue, 'selection')
      )
    )) {
      return false
    }

    if (and(
      equals('billing', currentStateValue),
      isFirstPage('addresses')
    )) {
      return false
    }

    if (equals('shipping', currentStateValue)) {
      return () => this.props.transition('BILLING')
    }

    if (and(
      equals('payment', currentStateKey),
      complement(equals)('selection', currentStateValue),
    )) {
      return () => this.props.transition('SELECTION')
    }

    return () => this.props.transition('PREV')
  }

  navigateNextPage = () => {
    this.props.transition('NEXT')
  }

  navigatePrevPage = () => {
    this.props.transition('PREV')
  }

  handleFormSubmit = (values, errors) => {
    if (not(isFormValid(errors))) {
      return
    }

    this.navigateNextPage()
  }

  handleBillingFormSubmit = (values, errors) => {
    if (not(isFormValid(errors))) {
      return
    }

    const { sameAddressForShipping } = this.props

    if (sameAddressForShipping) {
      this.props.transition('NEXT')
    }

    if (!sameAddressForShipping) {
      this.props.transition('SHIPPING')
    }
  }

  close = () => {
    const { apiData, targetElement } = this.props
    const onClose = path(['callbacks', 'onClose'], apiData)

    ReactGA.event({
      category: 'Header',
      action: 'Click - Close Button',
    })

    this.setState({ closingEffect: true })

    setTimeout(() => {
      ReactDOM.unmountComponentAtNode(
        targetElement
      )
      if (onClose) {
        insertStaticPosition()
        onClose()
      }
    }, 500)
  }

  enterLoading = () => {
    const {
      acquirerName,
      pageInfo,
      apiData,
      finalAmount,
    } = this.props

    const {
      configs = {},
      key,
      token,
      cart,
      callbacks = {},
    } = apiData

    const {
      postback,
      createTransaction,
    } = configs

    const {
      onSuccess,
      onError,
    } = callbacks

    const items = propOr([], 'items', cart)

    const requestPayload = {
      ...pageInfo,
      createTransaction,
      items,
      key,
      token,
      postback,
      amount: finalAmount,
    }

    const { request } = strategies[acquirerName]

    request(requestPayload)
      .then((response) => {
        this.onTransactionReturn({
          response: merge(requestPayload, response),
          onSuccess,
          onError,
        })
      })
  }

  renderPages () {
    const {
      apiData,
      transaction,
    } = this.props

    const enableCart = pathOr(false, [
      'configs',
      'enableCart',
    ], apiData)

    const antifraud = pathOr(true, ['configs', 'antifraud'], apiData)
    const cartItems = pathOr([], ['cart', 'items'], apiData)
    const pagesCallbacks = path(['callbacks', 'pages'], apiData)
    const customerCallbacks = prop('customer')(pagesCallbacks)
    const billingCallbacks = prop('billing')(pagesCallbacks)
    const shippingCallbacks = prop('shipping')(pagesCallbacks)
    const paymentCallbacks = prop('payment')(pagesCallbacks)
    const selectionCallbacks = prop('selection', paymentCallbacks)
    const singleCreditcardCallbacks = prop('singleCreditcard', paymentCallbacks)
    const singleBoletoCallbacks = prop('singleBoleto', paymentCallbacks)
    const boletoTexts = getBoletoInformations(this)
    const { transactionErrors } = this.state

    return (
      <React.Fragment>
        <State value="initialData">
          <LoadingInfo
            title="Carregando"
            subtitle="Aguarde..."
          />
        </State>
        <State value="customer">
          <CustomerPage
            callbacks={customerCallbacks}
            enableCart={enableCart}
            handleSubmit={this.handleFormSubmit}
          />
        </State>
        <State value="addresses.billing">
          <BillingPage
            callbacks={billingCallbacks}
            handlePreviousButton={this.navigatePreviousPage}
            enableCart={enableCart}
            handleSubmit={this.handleBillingFormSubmit}
            antifraud={antifraud}
            cartItems={cartItems}
          />
        </State>
        <State value="addresses.shipping">
          <ShippingPage
            callbacks={shippingCallbacks}
            enableCart={enableCart}
            handlePreviousButton={this.navigatePreviousPage}
            handleSubmit={this.handleFormSubmit}
          />
        </State>
        <State value="payment.selection">
          <PaymentOptionsPage
            callbacks={selectionCallbacks}
            checkoutColors={this.props.checkoutColors}
            enableCart={enableCart}
            handlePreviousButton={this.navigatePreviousPage}
            handlePageTransition={this.handlePageTransition}
            transaction={transaction}
          />
        </State>
        <State value="payment.singleCreditCard">
          <CreditCardPage
            callbacks={singleCreditcardCallbacks}
            enableCart={enableCart}
            handlePageTransition={this.handlePageTransition}
            handlePreviousButton={this.navigatePreviousPage}
            handleSubmit={this.handleFormSubmit}
            transaction={transaction}
          />
        </State>
        <State value="payment.singleBoleto">
          <BoletoPage
            callbacks={singleBoletoCallbacks}
            checkoutColors={this.props.checkoutColors}
            enableCart={enableCart}
            handlePreviousButton={this.navigatePreviousPage}
            handleSubmit={this.handleFormSubmit}
            transaction={transaction}
          />
        </State>
        <State value="confirmation.transaction">
          <LoadingInfo
            subtitle="Aguenta firme, é rapidinho"
            title="Processando sua compra"
          />
        </State>
        <State value="confirmation.failure">
          <ErrorInfo
            errors={transactionErrors}
            handlePreviousButton={this.navigatePreviousPage}
          />
        </State>
        <State value="confirmation.analysis">
          <AnalysisInfo
            title={boletoTexts.title}
            subtitle={boletoTexts.subtitle}
            text={boletoTexts.text}
            closeCheckout={this.close}
          />
        </State>
        <State value="confirmation.success">
          <SuccessInfo
            amount={this.getProp('finalAmount', this.props)}
            boleto={{
              barcode: this.getProp('boletoBarcode', this.props),
              url: this.getProp('boletoUrl', this.props),
              name: this.getProp('boletoName', this.props),
              expirationAt: this.getProp('boletoExpiration', this.props),
            }}
            closeCheckout={this.close}
            creditCard={{
              installmentText: this.getProp(
                'creditCardInstallmentsText',
                this.props
              ),
            }}
            orderUrl={this.getProp('orderUrl', this.props)}
          />
        </State>
      </React.Fragment>
    )
  }

  render () {
    const {
      theme,
      apiData,
      machineState,
      pageInfo,
      finalAmount,
      transaction,
    } = this.props

    const amount = prop('amount', transaction)

    const cart = pathOr({}, ['cart'], apiData)
    const items = pathOr([], ['items'], cart)

    const enableCart = pathOr(false, ['configs', 'enableCart'], apiData)
    const companyName = pathOr('', ['configs', 'companyName'], apiData)
    const logo = pathOr('', ['configs', 'logo'], apiData)

    const { shipping, customer } = pageInfo

    return (
      <div
        className={classNames(
          theme.wrapper,
          {
            [theme.closingEffect]: this.state.closingEffect,
          },
        )}
      >
        <CloseIcon
          className={theme.closeButton}
          onClick={this.close}
        />
        {
          enableCart &&
          <Cart
            items={items}
            amount={{
              initial: amount,
              final: finalAmount,
            }}
            shipping={shipping}
            customer={customer}
            onToggleCart={this.handleToggleCart}
          />
        }
        <div className={theme.checkout}>
          <Header
            activeStep={getActiveStep(machineState.value)}
            handleCloseButton={this.close}
            handlePreviousButton={this.navigatePreviousPage}
            logoAlt={companyName}
            logoSrc={logo}
            steps={this.state.steps}
          />
          <main
            className={theme.content}
          >
            {this.renderPages()}
          </main>
          <Footer />
        </div>
      </div>
    )
  }
}

Checkout.propTypes = {
  acquirerName: PropTypes.string.isRequired,
  apiData: PropTypes.shape().isRequired,
  apiErrors: PropTypes.arrayOf(PropTypes.string).isRequired,
  checkoutColors: PropTypes.shape().isRequired,
  creditCard: PropTypes.shape({
    cardId: PropTypes.string,
  }),
  finalAmount: PropTypes.number.isRequired,
  form: PropTypes.node,
  handleAddInstallments: PropTypes.func.isRequired,
  handleAddPageInfo: PropTypes.func.isRequired,
  handleAddTransactionValues: PropTypes.func.isRequired,
  machineState: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.object,
  ]).isRequired,
  pageInfo: PropTypes.object.isRequired, // eslint-disable-line
  sameAddressForShipping: PropTypes.bool.isRequired,
  targetElement: PropTypes.object.isRequired, // eslint-disable-line
  theme: PropTypes.shape(),
  transaction: PropTypes.shape(),
  transition: PropTypes.func.isRequired,
}

Checkout.defaultProps = {
  creditCard: {},
  form: null,
  theme: {},
  transaction: {},
}

const mapStateToProps = ({
  addresses, creditCard, pageInfo, transactionValues,
}) => ({
  creditCard,
  finalAmount: transactionValues.finalAmount,
  pageInfo,
  sameAddressForShipping: addresses.sameAddressForShipping,
  transaction: transactionValues,
})

export default connect(mapStateToProps, {
  handleAddPageInfo: addPageInfo,
  handleAddTransactionValues: addTransactionValues,
  handleAddInstallments: addInstallments,
})(consumeTheme(withStatechart(statechart)(Checkout)))
