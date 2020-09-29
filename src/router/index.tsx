/** @jsx h */
import { h, Fragment } from 'preact'
import { useRoutes } from 'raviger'

import Home from '../components/home'
import Pdf from '../components/pdf'

const routes = {
  '/': () => <Home/>,
  '/pdf/:id': ({ userId }) => <Pdf id={userId}/>
}

export default () =>
  <Fragment>
    <h1>Extractify</h1>
    {useRoutes(routes)}
  </Fragment>
