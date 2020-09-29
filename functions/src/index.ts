import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'
import * as pdfjsTypes from 'pdfjs-dist'
// import * as playwright from 'playwright'
// ts-ignore
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/es5/build/pdf.js'

const app = express()
app.use(cors({ origin: true }))

app.post('/extract', (request, response) => {
  if (typeof request.body === 'object') {
    void (<typeof pdfjsTypes.getDocument>getDocument)({ data: request.body })
      .promise
      .then(async pdf => {
        const page = await pdf.getPage(2)
        const { items } = await page.getTextContent()
        response.end(
          JSON.stringify(
            items.map(({ str }) => str)
          )
        )
      })
  }
})

exports.widgets = functions.https.onRequest(app)
