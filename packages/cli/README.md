# @russfranky/shadcss-cli

The CLI for [shadcss](https://github.com/russfranky/shadcss-ui) — a zero-runtime, HTML/CSS-only clone of the shadcn/ui aesthetic.

It gives you **both** consumption models shadcn users ask for: own the code *and* keep it updatable.

```bash
npx @russfranky/shadcss-cli <command>
```

## Commands

| Command | What it does |
| --- | --- |
| `list` | List all available components |
| `info <component>` | Show a component's classes, deps, and example markup |
| `add <component...>` | Copy component CSS (and its deps) into your project |
| `diff <component>` | Show how your local copy has drifted from upstream |
| `check <file.html ...>` | Lint HTML for known a11y/markup foot-guns |

## Why `diff` matters

shadcn's biggest complaint is *"you own the code, so upstream bug/a11y fixes never reach you."* With shadcss you copy components the same way — but `shadcss diff <component>` shows exactly what changed upstream versus your copy, so you can pull fixes deliberately instead of never noticing them.

```bash
npx @russfranky/shadcss-cli add button card dialog   # copy into ./shadcss
npx @russfranky/shadcss-cli diff button              # what changed upstream?
npx @russfranky/shadcss-cli check ./index.html       # any markup foot-guns?
```

## Options

| Flag | Default | Description |
| --- | --- | --- |
| `--dir <path>` | `./shadcss` | Target (and local-copy) directory for `add` / `diff` |
| `--from <dir>` | — | Read from a local shadcss checkout instead of the CDN |
| `--version <v>` | latest shipped | Framework version to pull from the CDN |
| `--force` | `false` | Overwrite existing files on `add` |

The CLI has **zero dependencies** and fetches components from the jsDelivr CDN (the published `@russfranky/shadcss` package), so it works without installing the framework.

## License

MIT
