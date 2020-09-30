/** @jsx h */
import { h, render } from 'preact'

import Home from './components/home'

render(
  <Home/>,
  document.body.appendChild(
    document.createElement('div')
  )
)
