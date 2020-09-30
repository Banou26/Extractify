import * as functions from 'firebase-functions'

import app from './app'
import './api/extract'
import './api/repair'
import './api/image'

exports.widgets =
  functions
    .runWith({ timeoutSeconds: 540 })
    .https
    .onRequest(app)
