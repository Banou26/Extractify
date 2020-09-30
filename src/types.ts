
export interface Line {
  str: string
  fontName: string
}

export interface Page {
  page: any
  number: number
  textContent: { styles: any[], lines: Line[] }
}

export interface PDF {
  arrayBuffer: ArrayBuffer
  pdf: any
  name: string
  pages: Page[]
}
