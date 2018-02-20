import React from 'react'
import PropTypes from 'prop-types'
import LockIcon from 'react-icons/lib/md/lock-outline'
import { themr } from 'react-css-themr'
import { connect } from 'react-redux'

import { Grid, Row, Col } from '../Grid'
import Button from '../Button'

const applyThemr = themr('UIFooter')

const palmColSize = 12
const buttonColSize = 12
const defaultColSize = 6

const Footer = ({
  buttonText,
  buttonClick,
  companyName,
  nextButtonDisabled,
  theme,
  buttonVisible,
  isDisable,
}) => (
  <footer>
    <Grid>
      <Row>
        <Col
          desk={buttonColSize}
          tv={buttonColSize}
          tablet={buttonColSize}
          palm={palmColSize}
          alignEnd
        >
          <Button
            hidden={nextButtonDisabled || !buttonVisible}
            disabled={isDisable}
            size="extra-large"
            relevance="normal"
            onClick={buttonClick}
            className={theme.button}
          >
            {buttonText}
          </Button>
        </Col>
      </Row>
      <Row>
        <Col
          desk={defaultColSize}
          tv={defaultColSize}
          tablet={defaultColSize}
          palm={palmColSize}
          className={theme.safe}
        >
          <LockIcon />
          Ambiente Seguro
        </Col>
        <Col
          desk={defaultColSize}
          tv={defaultColSize}
          tablet={defaultColSize}
          palm={palmColSize}
          className={theme.powered}
        >
          Powered by { companyName }
        </Col>
      </Row>
    </Grid>
  </footer>
)

Footer.defaultProps = {
  theme: {},
  nextButtonDisabled: false,
}

Footer.propTypes = {
  theme: PropTypes.shape({
    button: PropTypes.string,
    powered: PropTypes.string,
    safe: PropTypes.string,
    total: PropTypes.string,
    value: PropTypes.string,
  }),
  buttonText: PropTypes.string.isRequired,
  buttonClick: PropTypes.func.isRequired,
  companyName: PropTypes.string.isRequired,
  nextButtonDisabled: PropTypes.bool,
  buttonVisible: PropTypes.bool.isRequired,
  isDisable: PropTypes.bool.isRequired,
}

const mapToProps = ({ disableFooterButton }) => ({
  isDisable: disableFooterButton,
})

export default connect(mapToProps)(applyThemr(Footer))
