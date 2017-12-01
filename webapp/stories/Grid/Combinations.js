import React from 'react'
import { storiesOf } from '@storybook/react'
import { range } from 'ramda'

import { Grid, Row, Col } from '../../src/components/Grid'
import CardSample from './CardSample'

import style from './style.css'

const maxColumns = 12
const combinationExamples = range(3, 9)

storiesOf('Grid', module)
  .add('Size combinations', () => (
    <div className={style.background}>
      <Grid>
        {combinationExamples.map(size => (
          <Row key={size}>
            <Col
              tv={size}
              desk={size}
              tablet={size}
              palm={size}
            >
              <CardSample>
                {`${maxColumns - size} column${maxColumns - size > 1 ? 's' : ''}`}
              </CardSample>
            </Col>
            <Col
              tv={maxColumns - size}
              desk={maxColumns - size}
              tablet={maxColumns - size}
              palm={maxColumns - size}
            >
              <CardSample>
                {`${maxColumns - size} column${maxColumns - size > 1 ? 's' : ''}`}
              </CardSample>
            </Col>
          </Row>
        ))}
      </Grid>
    </div>
  ))
