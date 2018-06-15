import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import Form from 'react-vanilla-form'
import {
  merge,
  omit,
} from 'ramda'
import {
  FormInput,
  ThemeConsumer,
} from 'former-kit'

import options from '../utils/data/states'
import { removeMask } from '../utils/masks/'
import getAddress from '../utils/helpers/getAddress'
import { addPageInfo } from '../actions'
import {
  isFormValid,
  isNumber,
  maxLength,
  minLength,
  required,
} from '../utils/validations'
import { NavigationBar } from '../components'

const consumeTheme = ThemeConsumer('UIAddressesPage')

const defaultShippingAddress = {
  city: '',
  complement: '',
  number: '',
  state: '',
  street: '',
  zipcode: '',
}

class ShippingPage extends Component {
  constructor (props) {
    super(props)

    const { billing, shipping } = props

    this.state = typeof billing.sameAddressForShipping === 'undefined'
      ? {
        fee: shipping.fee,
      }
      : {
        ...merge(defaultShippingAddress, shipping),
      }
  }

  componentWillUnmount () {
    this.props.handlePageChange({
      page: 'shipping',
      pageInfo: this.state,
    })
  }

  autocompleteAddress (zipcode) {
    const updateAddress = (address) => {
      const newZipcode = address.cep

      const newAddress = merge(
        omit(['cep'], address),
        {
          zipcode: newZipcode,
          number: '',
          complement: '',
          isSearchingCPF: false,
        }
      )

      this.setState(newAddress)

      this.numberInput.focus()
    }

    const handleError = () =>
      this.setState({
        isSearchingCPF: false,
      })

    this.setState({ isSearchingCPF: true }, () => (
      getAddress(zipcode)
        .then(updateAddress)
        .catch(handleError)
    ))
  }

  handleNumberInputRef = (input) => {
    this.numberInput = input
  }

  handleChangeZipcode = (event) => {
    const zipcode = event.target.value

    if (removeMask(zipcode).length === 8) {
      this.autocompleteAddress(zipcode)
    }
  }

  handleChangeForm = (values, errors) => {
    this.setState({
      ...values,
      formValid: isFormValid(errors),
    })
  }

  render () {
    const {
      isSearchingCPF,
    } = this.state

    const {
      theme,
      enableCart,
      handlePreviousButton,
    } = this.props

    return (
      <Form
        data={this.state}
        className={theme.addressForm}
        onChange={this.handleChangeForm}
        onSubmit={this.props.handleSubmit}
        customErrorProp="error"
        validation={{
          zipcode: [
            required,
          ],
          number: [
            required,
            isNumber,
            maxLength(5),
          ],
          complement: [
            maxLength(65),
          ],
          street: [
            required,
            maxLength(40),
          ],
          city: [
            required,
            maxLength(25),
          ],
          state: [
            required,
            minLength(2),
            maxLength(2),
          ],
        }}
      >
        <h2 className={theme.title}>
          Onde devemos fazer a entrega?
        </h2>
        <main className={theme.content}>
          <FormInput
            disabled={isSearchingCPF}
            label="CEP"
            mask="11111-111"
            name="zipcode"
            onChange={this.handleChangeZipcode}
          />
          <FormInput
            disabled={isSearchingCPF}
            label="Rua"
            name="street"
            placeholder="Digite o endereço"
          />
          <div className={theme.inputGroup}>
            <FormInput
              className={theme.fieldNumber}
              inputRef={this.handleNumberInputRef}
              label="Nº"
              name="number"
              type="number"
            />
            <FormInput
              className={theme.fieldComplement}
              label="Complemento"
              name="complement"
            />
          </div>
          <div className={theme.inputGroup}>
            <FormInput
              className={theme.fieldCity}
              disabled={isSearchingCPF}
              label="Cidade"
              name="city"
              placeholder="Digite a cidade"
            />
            <FormInput
              className={theme.fieldState}
              disabled={isSearchingCPF}
              label="Estado"
              name="state"
              options={options}
              placeholder="Escolha a UF"
            />
          </div>
        </main>
        <footer className={theme.footer}>
          <NavigationBar
            enableCart={enableCart}
            formValid={!this.state.formValid}
            handlePreviousButton={handlePreviousButton}
            nextTitle="Continuar"
            prevTitle="Ops, voltar"
          />
        </footer>
      </Form>
    )
  }
}

ShippingPage.propTypes = {
  theme: PropTypes.shape({
    addressForm: PropTypes.string,
    content: PropTypes.string,
    footer: PropTypes.string,
    fieldNumber: PropTypes.string,
    fieldComplement: PropTypes.string,
    fieldCity: PropTypes.string,
    fieldState: PropTypes.string,
    inputGroup: PropTypes.string,
    switchLabel: PropTypes.string,
  }),
  enableCart: PropTypes.bool,
  handleSubmit: PropTypes.func.isRequired,
  handlePageChange: PropTypes.func.isRequired,
  handlePreviousButton: PropTypes.func.isRequired,
  billing: PropTypes.shape({
    sameAddressForShipping: PropTypes.bool,
  }),
  shipping: PropTypes.shape({
    name: PropTypes.string,
    street: PropTypes.string,
    number: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    complement: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    zipcode: PropTypes.string,
  }),
}

ShippingPage.defaultProps = {
  theme: {},
  shipping: {},
  billing: {},
  enableCart: false,
}

const mapStateToProps = ({ pageInfo }) => ({
  shipping: pageInfo.shipping,
  billing: pageInfo.billing,
})

export default connect(mapStateToProps, {
  handlePageChange: addPageInfo,
})(consumeTheme(ShippingPage))
