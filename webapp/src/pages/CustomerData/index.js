import React, { Component } from 'react'
import {
  string,
} from 'prop-types'

import UserIcon from 'react-icons/lib/fa/user'
import classNames from 'classnames'

import { Grid, Row, Col } from '../../components/Grid'
import Input from '../../components/Input'

const defaultColSize = 12

class CustomerData extends Component {
  constructor (props) {
    super(props)
    this.state = {
      name: '',
      email: '',
      documentNumber: '',
      phoneNumber: '',
    }

    this.handleInputChange = this.handleInputChange.bind(this)
  }

  handleInputChange (e) {
    const { name, value } = e.target

    this.setState({ [name]: value })
  }

  render () {
    const {
      name,
      email,
      documentNumber,
      phoneNumber,
    } = this.state

    return (
      <div className={classNames(this.props.className, this.props.active)}>
        <Grid>
          <Row>
            <Col
              tv={defaultColSize}
              desk={defaultColSize}
              tablet={defaultColSize}
              palm={defaultColSize}
            >
              <Input
                name="name"
                label="Nome"
                hint=""
                value={name}
                placeholder="Digite seu nome"
                icon={<UserIcon size={20} />}
                onChange={this.handleInputChange}
              />
            </Col>
          </Row>
          <Row>
            <Col
              tv={defaultColSize}
              desk={defaultColSize}
              tablet={defaultColSize}
              palm={defaultColSize}
            >
              <Input
                name="email"
                label="E-mail"
                hint=""
                value={email}
                placeholder="Digite seu e-mail"
                onChange={this.handleInputChange}
              />
            </Col>
          </Row>
          <Row>
            <Col
              tv={defaultColSize}
              desk={defaultColSize}
              tablet={defaultColSize}
              palm={defaultColSize}
            >
              <Input
                name="documentNumber"
                label="CPF"
                hint=""
                value={documentNumber}
                placeholder="Digite seu CPF"
                onChange={this.handleInputChange}
              />
            </Col>
          </Row>
          <Row>
            <Col
              tv={defaultColSize}
              desk={defaultColSize}
              tablet={defaultColSize}
              palm={defaultColSize}
            >
              <Input
                name="phoneNumber"
                label="DDD + Telefone"
                hint=""
                value={phoneNumber}
                placeholder="Digite seu telefone"
                onChange={this.handleInputChange}
              />
            </Col>
          </Row>
        </Grid>
      </div>
    )
  }
}

CustomerData.propTypes = {
  className: string,
  active: string,
}

CustomerData.defaultProps = {
  className: '',
  active: '',
}

export default CustomerData
