import React, { Component } from 'react'
import PropTypes from 'prop-types'
import PlusIcon from 'react-icons/lib/go/plus'
import { themr } from 'react-css-themr'
import { equals, filter, isNil, not, pipe } from 'ramda'
import { connect } from 'react-redux'

import AddressForm from '../containers/AddressForm'

import { Grid, Row, Col } from '../components/Grid'
import Button from '../components/Button'
import AddressOptions from '../components/AddressOptions'

import options from '../utils/data/states'
import { addPageInfo, showFooterButton } from '../actions'

const largeColSize = 12
const mediumColSize = 6

const applyThemr = themr('UIShippingPage')

class ShippingPage extends Component {
  constructor (props) {
    super(props)

    const { shipping, addresses } = this.props

    this.state = {
      addresses: !isNil(shipping) ? [...addresses, shipping] : addresses,
      selected: !isNil(shipping) ? shipping : {},
      openAddressForm: false,
    }

    this.toggleOpenAddressForm = this.toggleOpenAddressForm.bind(this)
    this.addAddress = this.addAddress.bind(this)
    this.onChangeAddress = this.onChangeAddress.bind(this)
  }

  componentWillUnmount () {
    const { selected, addresses } = this.state

    const removeSelected = filter(
      pipe(
        equals(selected),
        not
      )
    )

    this.props.handlePageChange('shipping', selected)
    this.props.handlePageChange('addresses', removeSelected(addresses))
  }

  onChangeAddress (address) {
    this.setState({ selected: address })
  }

  addAddress (address) {
    this.setState(({ addresses }) => ({
      addresses: [...addresses, address],
      selected: address,
    }))

    this.toggleOpenAddressForm()
  }

  toggleOpenAddressForm () {
    const openAddressForm = !this.state.openAddressForm

    this.props.footerButtonVisible(!openAddressForm)
    this.setState({ openAddressForm })
  }

  render () {
    const { addresses, selected } = this.state
    const { theme } = this.props

    return (
      <div className={theme.page}>
        <AddressForm
          visible={this.state.openAddressForm}
          onCancel={this.toggleOpenAddressForm}
          options={options}
          onConfirm={this.addAddress}
        />
        <Grid
          hidden={this.state.openAddressForm}
        >
          <Row className={theme.title}>
            {this.props.title}
          </Row>
          <Row>
            <AddressOptions
              addresses={addresses}
              selected={selected}
              onChange={this.onChangeAddress}
            />
          </Row>
          <Row>
            <Col
              tv={mediumColSize}
              desk={mediumColSize}
              tablet={mediumColSize}
              palm={largeColSize}
            >
              <Button
                size="extra-large"
                fill="double"
                relevance="low"
                className={theme.btnAddNewAddress}
                onClick={this.toggleOpenAddressForm}
              >
                <PlusIcon />
                Cadastrar novo endereço de entrega
              </Button>
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}

ShippingPage.propTypes = {
  theme: PropTypes.shape({
    page: PropTypes.string,
    title: PropTypes.string,
    btnAddNewAddress: PropTypes.string,
  }),
  shipping: PropTypes.shape({
    name: PropTypes.string,
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
  addresses: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string,
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
  })),
  title: PropTypes.string.isRequired,
  footerButtonVisible: PropTypes.func,
  handlePageChange: PropTypes.func.isRequired,
}

ShippingPage.defaultProps = {
  theme: {},
  shipping: {},
  addresses: [],
  footerButtonVisible: null,
  handleProgressBar: null,
}

const mapStateToProps = ({ pageInfo }) => ({
  shipping: pageInfo.shipping,
  addresses: pageInfo.addresses,
})

const mapDispatchToProps = dispatch => ({
  handlePageChange: (page, pageInfo) => {
    dispatch(addPageInfo({ page, pageInfo }))
  },
  footerButtonVisible: isVisible => dispatch(showFooterButton(isVisible)),
})


export default connect(mapStateToProps, mapDispatchToProps)(applyThemr(ShippingPage))
