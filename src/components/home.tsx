/** @jsx h */
import { h } from 'preact'
import { useState, useEffect, useRef } from 'preact/hooks'
import { Download } from 'react-feather'
import { getPDF } from '../utils'
import { Util } from 'pdfjs-dist'
import pdf from 'url:../../res/pdf1.pdf'
import * as tesseract from 'tesseract.js'

var PDF_PATH = "../../web/compressed.tracemonkey-pldi-09.pdf";
var PAGE_NUMBER = 11;
var PAGE_SCALE = 1;
var SVG_NS = "http://www.w3.org/2000/svg";

function buildSVG(viewport, textContent) {
  // Building SVG with size of the viewport (for simplicity)
  var svg = document.createElementNS(SVG_NS, "svg:svg");
  svg.setAttribute("width", viewport.width + "px");
  svg.setAttribute("height", viewport.height + "px");
  // items are transformed to have 1px font size
  svg.setAttribute("font-size", 1);

  // processing all items
  textContent.items.forEach(function (textItem) {
    // we have to take in account viewport transform, which includes scale,
    // rotation and Y-axis flip, and not forgetting to flip text.
    var tx = Util.transform(
      Util.transform(viewport.transform, textItem.transform),
      [1, 0, 0, -1, 0, 0]
    );
    var style = textContent.styles[textItem.fontName];
    // adding text element
    var text = document.createElementNS(SVG_NS, "svg:text");
    text.setAttribute("transform", "matrix(" + tx.join(" ") + ")");
    text.setAttribute("font-family", style.fontFamily);
    text.textContent = textItem.str;
    svg.appendChild(text);
  });
  return svg;
}

function pageLoaded() {
  // Loading document and page text content
  var loadingTask = getPDF(pdf);
  loadingTask.then(function (pdfDocument) {
    console.log('AAAAAAAAA', pdfDocument)
    pdfDocument.getPage(PAGE_NUMBER).then(function (page) {
      var viewport = page.getViewport({ scale: PAGE_SCALE })
      page.getTextContent().then(function (textContent) {
        // building SVG and adding that to the DOM
        var svg = buildSVG(viewport, textContent)
        document.body.appendChild(svg)
      })
    })
  })
}

document.addEventListener("DOMContentLoaded", function () {
  pageLoaded();
});

const makePdf = async (name, pdf): Promise<PDF> => ({
  pdf,
  name,
  pages:
    await Promise.all(
      (await Promise.all(
        new Array(pdf.numPages)
          .fill(undefined)
          .map((_, i) => pdf.getPage(i + 1))
      )).map(async page => ({
        page,
        number: page.pageNumber,
        lines:
          (await page.getTextContent())
            .items
            // .filter(({ fontName }) =>
            //   fontName !== 'g_d0_f12'
            //   && fontName !== 'g_d0_f13'
            //   && fontName !== 'g_d0_f14'
            //   && fontName !== 'g_d0_f15'
            //   && fontName !== 'g_d0_f16'
            //   && fontName !== 'g_d0_f19'
            // )
      }))
    )
})

// fetch(pdf)
//   .then(res => res.arrayBuffer())
//   .then(arrayBuffer => getPDF(arrayBuffer))
//   .then(async pdf => {
//     console.log(pdf)
//     // const page = await pdf.getPage(4)
//     // const { items } = await page.getTextContent()
//     // console.log(items)
//     // console.log(items.map(({ str }: { str: string }) => str).join('|'))
//     const pd = await makePdf(pdf)
//     console.log(pd)
//   })

interface Line {
  str: string
  fontName: string
}

interface Page {
  page: any
  number: number
  lines: Line[]
}

interface PDF {
  pdf: any
  name: string
  pages: Page[]
}



export default () => {
  const [files, setFiles] = useState<PDF[]>([])
  const [isHover, setIsHover] = useState(false)
  const canvasRef = useRef()
  console.log(files)
  useEffect(() => {
    files.map(async (file) => {
      console.log(file)

      file
        .pdf
        .getPage(12)
        .then(page => {
          console.log('Page loaded')
          
          const scale = 1.5
          const viewport = page.getViewport({ scale: scale })

          // Prepare canvas using PDF page dimensions
          const canvas = canvasRef.current
          const context = canvas.getContext('2d')
          canvas.height = viewport.height
          canvas.width = viewport.width

          // Render PDF page into canvas context
          const renderContext = { canvasContext: context, viewport: viewport }
          const renderTask = page.render(renderContext)
          renderTask.promise.then(() => {
            tesseract.recognize(
              canvas.toDataURL(),
              'eng',
              { logger: m => console.log(m) }
            ).then(({ data: { text } }) => {
              console.log(text)
            })
          })
        })

      // fetch(
      //   'http://localhost:5001/extractify-10ca0/us-central1/widgets/extract',
      //   {
      //     method: 'POST',
      //     body: file,
      //     mode: 'cors'
      //   }
      // )
      //   .then(res => res.json())
      //   .then(res => console.log('RES:', res))
    })
  }, [files.map(({ name }) => name).join('|')])

  return (
    <div className="home">
      <div
        className={`drop-zone ${isHover ? 'drag-hover' : ''}`}
        onDragLeave={() => setIsHover(false)}
        onDragOver={() => setIsHover(true)}
        onDrop={() => setIsHover(false)}
      >
        <span>Drag or click PDF file(s)</span>
        <Download size="10rem"/>
        <input
          type="file"
          multiple={true}
          onChange={async ev =>
            setFiles(
              await Promise.all(
                [...(ev.target as HTMLInputElement).files]
                  .map(async file =>
                    makePdf(file.name, await getPDF(await file.arrayBuffer()))
                  )
              )
            )
          }
        />
      </div>
      <canvas ref={canvasRef}></canvas>
      <div className="pdf-text">
        {
          files.map(({ name, pages }) =>
            <div>
              <h1>{name}</h1>
              {
                pages.map(({ number, lines }) =>
                  <div>
                    <h2>Page {number}</h2>
                    {
                      lines.map(({ fontName, str }) =>
                        fontName === 'g_d0_f2'
                          ? <h3>{str}</h3>
                          : <span>{str}</span>
                      )
                    }
                  </div>
                )
              }
            </div>
          )
        }
      </div>
    </div>
  )
}
