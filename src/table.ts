import { gray, lightGray, lightMagenta } from 'kolorist'

export default function table(obj: any, indent = 0, doneFirstLineIndent = 0) {
  const table = createTable(obj)
  const maxWidth = process.stdout.columns - indent
  return renderTable(table, maxWidth, indent, doneFirstLineIndent)
}

export function createTable(obj: any) {
  const keys = Object.keys(obj)
  const shouldRenderValuesCol = keys.some(key => !isObj(obj[key])) || keys.length === 0
  const shouldRenderKeyCols = keys.some(key => isObj(obj[key]))
  const rows: string[][] = []
  const allValueKeys: string[] = []
  const headerRow = ['(index)']
  if (shouldRenderKeyCols) {
    allValueKeys.push(...new Set(keys.flatMap(key => isObj(obj[key]) ? Object.keys(obj[key]) : [])))
    headerRow.push(...allValueKeys)
  }
  if (shouldRenderValuesCol) headerRow.push('Values')
  rows.push(headerRow)
  keys.forEach((key) => {
    const value = obj[key]
    const row = [key]
    if (shouldRenderKeyCols) {
      row.push(...allValueKeys.map(key => isObj(value) ? (key in value ? value[key] : '') : ''))
      if (shouldRenderValuesCol) row.push(isObj(value) ? '' : value)
    }
    else {
      row.push(value)
    }
    rows.push(row)
  })
  return rows
}

export function renderTable(rows: string[][], width: number, indent = 0, doneFirstLineIndent = 0) {
  const table: string[] = []
  const minCellWidth = 5
  const maxCols = Math.floor((width - 1) / (minCellWidth + 1))
  const rowsToRender = rows.map(row => row.slice(0, maxCols))
  const nRows = rowsToRender.length
  const nCols = rowsToRender[0].length
  const cellWidth = Math.floor((width - (nCols + 1)) / nCols)
  const isTruncated = nCols !== rows[0].length

  function getCellWidth(index: number) {
    return index === nCols - 1
      ? cellWidth + (width - ((cellWidth * nCols) + nCols + 1))
      : cellWidth
  }
  function renderRow(row: string[], chars: string) {
    const start = chars[0]
    const mid = chars[2]
    const end = chars[4]
    return `${gray(start)}${row.join(gray(mid))}${gray(isTruncated ? '…' : end)}`
  }
  function renderSeparator(chars: string) {
    const line = chars[1]
    const rows = Array.from({ length: nCols }).map((_, index) => gray(line.repeat(getCellWidth(index))))
    return renderRow(rows, chars)
  }
  function renderCell(cell: string, width: number, color: (str: string | number) => string) {
    let content: string
    content = isObj(cell) ? JSON.stringify(cell) : `${cell}`
    content = content.length > (width - 2) ? `${content.slice(0, width - 3)}…` : content
    content = content.padEnd(width - 2, ' ')
    return color(` ${content} `)
  }

  rowsToRender.forEach((row, index) => {
    if (index === 0) table.push(renderSeparator('┏━┳━┓'))
    const color = index === 0 ? lightGray : lightMagenta
    const cells = row.map((cell, index) => renderCell(cell, getCellWidth(index), color))
    table.push(renderRow(cells, index === 0 ? '┃ ┃ ┃' : '│ │ │'))
    const chars = index === 0 && rowsToRender.length === 1 ? '┗━┻━┛' : index === 0 ? '┡━╇━┩' : index < nRows - 1 ? '├─┼─┤' : '└─┴─┘'
    table.push(renderSeparator(chars))
  })

  return `${' '.repeat(indent - doneFirstLineIndent)}${table.join(`\n${' '.repeat(indent)}`)}`
}

function isObj(obj: any) {
  return typeof obj === 'object'
}
