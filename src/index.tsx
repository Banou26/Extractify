/** @jsx h */
import { Fragment, h, render } from 'preact'

import DropZone from './components/drop-zone'
import Home from './components/home'

render(
  <DropZone>
    <Home/>
  </DropZone>,
  document.body.appendChild(
    document.createElement('div')
  )
)
