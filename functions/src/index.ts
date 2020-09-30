import * as functions from 'firebase-functions'
import * as express from 'express'
import * as cors from 'cors'
import * as pdfjsTypes from 'pdfjs-dist'
import { createCanvas } from 'canvas'
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

// app.post('/repair', (request, response) => {
//   const canvas = createCanvas(200, 200)
//   const ctx = canvas.getContext('2d')
//   if (typeof request.body === 'object') {
//     void (<typeof pdfjsTypes.getDocument>getDocument)({ data: request.body })
//       .promise
//       .then(async pdf => {
//         const page = await pdf.getPage(2)
//         const { items } = await page.getTextContent()
        
//         const viewport = page.getViewport({ scale: 1.5 })
//         const context = canvas.getContext('2d')
//         canvas.height = viewport.height
//         canvas.width = viewport.width

//         // Render PDF page into canvas context
//         const renderContext = { canvasContext: context, viewport: viewport }
//         const renderTask = page.render(renderContext)
//         renderTask.promise.then(() => {
//           response.end(canvas.toDataURL())
//           // tesseract.recognize(
//           //   canvas.toDataURL(),
//           //   'eng',
//           //   { logger: m => console.log(m) }
//           // ).then(({ data: { text } }) => {
//           //   console.log(text)
//           // })
//         })

//         // response.end(
//         //   JSON.stringify(
//         //     items.map(({ str }) => str)
//         //   )
//         // )
//       })
//   }
// })

exports.widgets = functions.https.onRequest(app)
