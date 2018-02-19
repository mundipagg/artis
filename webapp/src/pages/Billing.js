import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { themr } from 'react-css-themr'
import Form from '../components/Form'

import { Grid, Row, Col } from '../components/Grid'
import Input from '../components/Input'
import Dropdown from '../components/Dropdown'

import options from '../utils/data/states'
import getAddress from '../utils/helpers/getAddress'
import removeZipcodeMask from '../utils/helpers/removeZipcodeMask'

import {
  requiredValidation,
  numbersValidation,
  maxLengthValidation,
  lettersValidation,
  minLengthValidation,
} from '../utils/validators/'

const applyThemr = themr('UIBillingPage')

const smallColSize = 4
const bigColSize = 8

class BillingPage extends Component {
  constructor (props) {
    super(props)

    this.state = {
      ...props.billing,
      zipcodeError: '',
    }

    this.handleStateChange = this.handleStateChange.bind(this)
    this.handleInputChange = this.handleInputChange.bind(this)
    this.handleNumberInputRef = this.handleNumberInputRef.bind(this)
    this.handleZipcodeChange = this.handleZipcodeChange.bind(this)
    this.handleZipcodeBlur = this.handleZipcodeBlur.bind(this)
  }

  componentWillUnmount () {
    this.props.handlePageChange(this.state, 'billing')
  }

  handleStateChange (value) {
    this.setState({ state: value })
  }

  handleInputChange (e) {
    const { name, value } = e.target

    this.setState({ [name]: value })
  }

  handleNumberInputRef (input) {
    this.numberInput = input
  }

  handleZipcodeChange (e) {
    const { value } = e.target
    const zipcode = removeZipcodeMask(value)

    if (zipcode.length === 8) {
      this.autocompleteAddress(zipcode)
    }

    this.setState({ zipcode: value })
  }

  handleZipcodeBlur () {
    this.setState({ zipcodeError: '' })
  }

  autocompleteAddress (zipcode) {
    const updateAddress = (address) => {
      this.setState({
        ...address,
        zipcodeError: '',
      })

      this.numberInput.focus()
    }

    const handleError = error =>
      this.setState(prevState => ({
        ...prevState,
        zipcodeError: error.message,
      }))

    getAddress(zipcode)
      .then(updateAddress)
      .catch(handleError)
  }

  render () {
    const {
      zipcode,
      zipcodeError,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
    } = this.state

    const { theme, isBigScreen } = this.props

    return (
      <Grid className={
        classNames(theme.page, {
          [theme.noMarginTop]: isBigScreen,
        })}
      >
        <Form
          validation={{
            zipcode: [
              requiredValidation,
              minLengthValidation(8),
              maxLengthValidation(8),
            ],
            street: [
              requiredValidation,
              maxLengthValidation(100),
            ],
            streetNumber: [
              requiredValidation,
              numbersValidation,
              maxLengthValidation(5),
            ],
            streetComplement: [
              maxLengthValidation(100),
            ],
            neighborhood: [
              requiredValidation,
              maxLengthValidation(100),
            ],
            city: [
              requiredValidation,
              maxLengthValidation(100),
              lettersValidation,
            ],
            state: [
              requiredValidation,
              maxLengthValidation(100),
              lettersValidation,
            ],
          }}
        >
          <Row className={theme.title}>
            {this.props.title}
          </Row>
          <Row>
            <Input
              name="zipcode"
              label="CEP"
              mask="11111-111"
              value={zipcode}
              error={zipcodeError}
              placeholder="Digite o CEP"
              onChange={this.handleZipcodeChange}
              onBlur={this.handleZipcodeBlur}
            />
          </Row>
          <Row>
            <Input
              name="street"
              label="Endereço"
              hint="Rua, Av, Praça ou Travessa"
              value={street}
              placeholder="Digite o endereço"
              onChange={this.handleInputChange}
            />
          </Row>
          <Row>
            <Col
              tv={smallColSize}
              desk={smallColSize}
              tablet={smallColSize}
              palm={smallColSize}
            >
              <Input
                inputRef={this.handleStreetNumberInputRef}
                name="streetNumber"
                label="Nº"
                hint=""
                value={streetNumber}
                placeholder="Digite o número"
                onChange={this.handleInputChange}
              />
            </Col>
            <Col
              tv={bigColSize}
              desk={bigColSize}
              tablet={bigColSize}
              palm={bigColSize}
            >
              <Input
                name="streetComplement"
                label="Complemento"
                hint=""
                value={streetComplement}
                placeholder="Digite o complemento do endereço"
                onChange={this.handleInputChange}
              />
            </Col>
          </Row>
          <Row>
            <Input
              name="neighborhood"
              label="Bairro"
              hint=""
              value={neighborhood}
              placeholder="Digite o bairro"
              onChange={this.handleInputChange}
            />
          </Row>
          <Row>
            <Col
              tv={bigColSize}
              desk={bigColSize}
              tablet={bigColSize}
              palm={bigColSize}
            >
              <Input
                name="city"
                label="Cidade"
                hint=""
                value={city}
                placeholder="Digite a cidade"
                onChange={this.handleInputChange}
              />
            </Col>
            <Col
              tv={smallColSize}
              desk={smallColSize}
              tablet={smallColSize}
              palm={smallColSize}
            >
              <Dropdown
                options={options}
                name="state"
                label="Estado"
                value={state}
                onChange={this.handleStateChange}
                title="Selecione"
              />
            </Col>
          </Row>
        </Form>
      </Grid>
    )
  }
}

BillingPage.propTypes = {
  theme: PropTypes.shape({
    page: PropTypes.string,
    title: PropTypes.string,
  }),
  title: PropTypes.string.isRequired,
  isBigScreen: PropTypes.bool,
  handlePageChange: PropTypes.func.isRequired,
  billing: PropTypes.shape({
    street: PropTypes.string,
    number: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]),
    complement: PropTypes.string,
    neighborhood: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    zipcode: PropTypes.string,
  }),
}

BillingPage.defaultProps = {
  theme: {},
  isBigScreen: false,
  billing: {},
}

export default applyThemr(BillingPage)

