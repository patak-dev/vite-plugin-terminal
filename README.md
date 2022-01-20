# vite-plugin-terminal

[![NPM version](https://img.shields.io/npm/v/vite-plugin-terminal?color=a1b858&label=)](https://www.npmjs.com/package/vite-plugin-terminal)

Log in the node terminal from the browser

![](https://github.com/patak-dev/vite-plugin-terminal/blob/76fb5c2656e99a8619986be2bff5c26414273a66/vite-plugin-terminal.png)

[Open a playground online in StackBlitz](https://stackblitz.com/edit/vitejs-vite-c8dfaq?file=main.js&terminal=dev)

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
- `terminal.log(obj)`
- `terminal.info(obj)`
- `terminal.warn(obj)`
- `terminal.error(obj)`
- `terminal.assert(assertion, obj)`

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
