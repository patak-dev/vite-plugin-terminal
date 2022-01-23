import { describe, expect, it } from 'vitest'
import { createTable, renderTable } from '../src/table'

describe('createTable', () => {
  it('should handle empty values', () => {
    const data: string[] = []
    expect(createTable(data)).toEqual([
      ['(index)', 'Values'],
    ])
  })

  it('should handle plain values', () => {
    const data = ['a', 'b']
    expect(createTable(data)).toEqual([
      ['(index)', 'Values'],
      ['0', 'a'],
      ['1', 'b'],
    ])
  })

  it('should handle objects', () => {
    const data = [
      { a: 'One', b: 'Two' },
      { a: 'Three', b: 'Four' },
    ]
    expect(createTable(data)).toEqual([
      ['(index)', 'a', 'b'],
      ['0', 'One', 'Two'],
      ['1', 'Three', 'Four'],
    ])
  })

  it('should handle arrays', () => {
    const data = [
      ['One', 'Two'],
      ['Three', 'Four'],
    ]
    expect(createTable(data)).toEqual([
      ['(index)', '0', '1'],
      ['0', 'One', 'Two'],
      ['1', 'Three', 'Four'],
    ])
  })

  it('should handle objects with different properties', () => {
    const data = [
      { a: 'One', b: 'Two' },
      { a: 'Three', c: 'Four' },
    ]
    expect(createTable(data)).toEqual([
      ['(index)', 'a', 'b', 'c'],
      ['0', 'One', 'Two', ''],
      ['1', 'Three', '', 'Four'],
    ])
  })

  it('should handle plain values mixed with objects', () => {
    const data = [
      { a: 'One', b: 'Two' },
      'Plain string',
    ]
    expect(createTable(data)).toEqual([
      ['(index)', 'a', 'b', 'Values'],
      ['0', 'One', 'Two', ''],
      ['1', '', '', 'Plain string'],
    ])
  })

  it('should handle plain values mixed with arrays', () => {
    const data = [
      ['a', 'b'],
      'Plain string',
    ]
    expect(createTable(data)).toEqual([
      ['(index)', '0', '1', 'Values'],
      ['0', 'a', 'b', ''],
      ['1', '', '', 'Plain string'],
    ])
  })

  it('should handle plain values mixed with objects and arrays', () => {
    const data = [
      { a: 'One', b: 'Two' },
      ['a', 'b'],
      'Plain string',
    ]
    expect(createTable(data)).toEqual([
      ['(index)', 'a', 'b', '0', '1', 'Values'],
      ['0', 'One', 'Two', '', '', ''],
      ['1', '', '', 'a', 'b', ''],
      ['2', '', '', '', '', 'Plain string'],
    ])
  })
})

describe('renderTable', () => {
  it ('should handle empty tables', () => {
    const data: string[] = []
    expect(renderTable(createTable(data), 40)).toBe(`
┏━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━┓
┃ (index)          ┃ Values            ┃
┗━━━━━━━━━━━━━━━━━━┻━━━━━━━━━━━━━━━━━━━┛
`.trim())
  })

  it ('should serialize nested arrays', () => {
    const data = [[['a', 'b']]]
    expect(renderTable(createTable(data), 40)).toBe(`
┏━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━┓
┃ (index)          ┃ 0                 ┃
┡━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━┩
│ 0                │ ["a","b"]         │
└──────────────────┴───────────────────┘
`.trim())
  })

  it ('should serialize nested objects', () => {
    const data = [[{ a: 'One' }]]
    expect(renderTable(createTable(data), 40)).toBe(`
┏━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━┓
┃ (index)          ┃ 0                 ┃
┡━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━┩
│ 0                │ {"a":"One"}       │
└──────────────────┴───────────────────┘
`.trim())
  })

  it ('should truncate cell content', () => {
    const data = ['This string is too long to fit in the cell']
    expect(renderTable(createTable(data), 40)).toBe(`
┏━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━┓
┃ (index)          ┃ Values            ┃
┡━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━┩
│ 0                │ This string is t… │
└──────────────────┴───────────────────┘
`.trim())
  })

  it ('should truncate amount of columns', () => {
    const data = [{ a: 'One', b: 'Two', c: 'Three', d: 'Four', e: 'Five', f: 'Six' }]
    expect(renderTable(createTable(data), 40)).toBe(`
┏━━━━━┳━━━━━┳━━━━━┳━━━━━┳━━━━━┳━━━━━━━━…
┃ (i… ┃ a   ┃ b   ┃ c   ┃ d   ┃ e      …
┡━━━━━╇━━━━━╇━━━━━╇━━━━━╇━━━━━╇━━━━━━━━…
│ 0   │ One │ Two │ Th… │ Fo… │ Five   …
└─────┴─────┴─────┴─────┴─────┴────────…
`.trim())
  })

  it ('should indent', () => {
    const data = ['a']
    expect(`» ${renderTable(createTable(data), 38, 2)}`).toBe(`
» ┏━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━┓
  ┃ (index)         ┃ Values           ┃
  ┡━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━┩
  │ 0               │ a                │
  └─────────────────┴──────────────────┘
`.trim())
  })
})
