/** @jsx h */
import { h, render } from 'preact'

import Router from './router'

render(
  <Router/>,
  document.body.appendChild(
    document.createElement('div')
  )
)
