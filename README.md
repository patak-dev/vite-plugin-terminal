# vite-plugin-terminal

[![NPM version](https://img.shields.io/npm/v/vite-plugin-terminal?color=a1b858&label=)](https://www.npmjs.com/package/vite-plugin-terminal)

Log in the node terminal from the browser

![](https://github.com/patak-dev/vite-plugin-terminal/blob/76fb5c2656e99a8619986be2bff5c26414273a66/vite-plugin-terminal.png)

[Open a playground online in StackBlitz](https://stackblitz.com/fork/github-bdbxen-madd1h?file=module.js&terminal=dev)

## Install

```bash
npm i -D vite-plugin-terminal
```

Add plugin to your `vite.config.ts`:

```ts
// vite.config.ts
import Terminal from 'vite-plugin-terminal'

export default {
  plugins: [
    Terminal()
  ]
}
```

## Usage

In your source code import `terminal`, and use it like you do with `console.log`.

```ts
import { terminal } from 'virtual:terminal'

terminal.log('Hey terminal! A message from the browser')
```

The terminal log calls will be removed when building the app.

## API

Supported methods:
- `terminal.log(obj1 [, obj2, ..., objN])`
- `terminal.info(obj1 [, obj2, ..., objN])`
- `terminal.warn(obj1 [, obj2, ..., objN])`
- `terminal.error(obj1 [, obj2, ..., objN])`
- `terminal.assert(assertion, obj1 [, obj2, ..., objN])`
- `terminal.group()`
- `terminal.groupCollapsed()`
- `terminal.groupEnd()`
- `terminal.table(obj)`
- `terminal.time(id)`
- `terminal.timeLog(id, obj1 [, obj2, ..., objN])`
- `terminal.timeEnd(id)`
- `terminal.clear()`
- `terminal.count(label)`
- `terminal.countReset(label)`
- `terminal.dir(obj)` 
- `terminal.dirxml(obj)` 

These methods will work but use the console

- `terminal.trace(...args: any[])`
- `terminal.profile(...args: any[])`
- `terminal.profileEnd(...args: any[])`

## Redirect `console` logs to the terminal

If you want the standard `console` logs to appear in the terminal, you can use the `console: 'terminal'` option in your `vite.config.ts`:

```ts
// vite.config.ts
import Terminal from 'vite-plugin-terminal'

export default {
  plugins: [
    Terminal({
      console: 'terminal'
    })
  ]
}
```

In this case, you don't need to import the virtual terminal to use the plugin.

```ts
console.log('Hey terminal! A message from the browser')
```

You can also overwrite it in your `index.html` head manually in case you would like more control.

```html
  <script type="module">
    // Redirect console logs to the terminal
    import terminal from 'virtual:terminal'
    globalThis.console = terminal
  </script>
```

Check the [Console playground](./playground/console) for a full example.

## Log in both the terminal and the console

You can use the `output` option to define where the `terminal` logs should be logged. Accepts `terminal`, `console`, or an array with both.

```ts
// vite.config.ts
import Terminal from 'vite-plugin-terminal'

export default {
  plugins: [
    Terminal({
      output: ['terminal', 'console']
    })
  ]
}
```

## Examples

- **[Basic](https://stackblitz.com/fork/github-bdbxen-madd1h?file=module.js&terminal=dev)** - Playground using every available method.
- **[Console](https://stackblitz.com/fork/github-bdbxen-madd1h?file=module.js&terminal=dev)** - Redirect standard console logs to the terminal.
- **[Auto Import](https://stackblitz.com/fork/github-ejosid?file=main.ts&terminal=dev)** - Use [unplugin-auto-import](https://github.com/antfu/unplugin-auto-import) to make `terminal` global in your app.
- **[Vue](https://stackblitz.com/fork/github-gzl5vm?file=src%2FApp.vue&terminal=dev)** - Example of logging to the terminal from a Vue App.

## Options

### `console`

Type: `'terminal' | undefined`<br>
Default: `undefined`<br>

Set to `'terminal'` to make `globalThis.console` equal to the `terminal` object in your app.

### `output`

Type: `'terminal' | 'console' | ['terminal', 'console']`<br>
Default: `terminal`<br>

Define where the output for the logs.

### `strip`

Type: `boolean`<br>
Default: `true`<br>

Strip `terminal.*()` when bundling for production.

### `include`

Type: `String | RegExp | Array[...String|RegExp]`<br>
Default: `/.+\.(js|ts|mjs|cjs|mts|cts)/`<br>
Example: `include: '**/*.(mjs|js)',`<br>

A pattern, or array of patterns, which specify the files in the build the plugin should operate on when removing calls for production.

### `exclude`

Type: `String | RegExp | Array[...String|RegExp]`<br>
Default: `[]`<br>
Example: `exlude: 'tests/**/*',`<br>

A pattern, or array of patterns, which specify the files in the build the plugin should _ignore_ when removing calls for production.

## Credits

- Original idea from [Domenic Elm](https://twitter.com/elmd_)
- Project setup from [@antfu's vite-plugin-inspect](https://github.com/antfu/vite-plugin-inspect)
- Bundling by [unbuild](https://github.com/unjs/unbuild)
- Strip functions during build uses [rollup-plugin-strip](https://github.com/rollup/plugins/tree/master/packages/strip)

## Sponsors

<p align="center">
  <a href="https://patak.dev/sponsors.svg">
    <img src="https://patak.dev/sponsors.svg"/>
  </a>
</p>

## License

[MIT](./LICENSE) License © 2022-present [Matias Capeletto](https://github.com/patak-dev)
