import * as express from 'express'
import * as cors from 'cors'

const app = express()

app.use(cors({ origin: true }))

export default app
