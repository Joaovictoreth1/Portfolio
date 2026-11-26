# João Victor Barros das Merces — Portfolio

[Live site](https://joaovictoreth1.github.io/Portfolio/) · [Quality checks](https://github.com/Joaovictoreth1/Portfolio/actions/workflows/ci.yml)

A static, bilingual software developer portfolio. The primary Portuguese content, skill cards, and contact link are usable without JavaScript. The browser modules add English, theme preferences, a keyboard-accessible email dialog, and clipboard feedback.

## Architecture

| Path                                     | Responsibility                                                                         |
| ---------------------------------------- | -------------------------------------------------------------------------------------- |
| `index.html`                             | Semantic Portuguese document, SEO metadata, fallback contact link, and resource policy |
| `src/main.js`                            | DOM events and progressive enhancement                                                 |
| `src/preferences.js`, `src/clipboard.js` | Validated browser preferences and clipboard result handling                            |
| `src/translations.js`                    | Portuguese and English UI copy                                                         |
| `src/styles.css`, `tailwind.config.js`   | Design tokens, motion preferences, and Tailwind 3 build input                          |
| `assets/site.css`                        | Generated, minified Tailwind stylesheet that GitHub Pages serves directly              |
| `assets/fonts/`, `assets/images/`        | Local fonts and media; no CDN is needed at runtime                                     |
| `_config.yml`                            | Excludes development files from the legacy GitHub Pages build                          |

There is no API, server-side state, build-time secret, or environment file. Runtime preferences are limited to the `theme` and `language` keys in local storage; failed storage access does not break the UI.

## Local development

Use Node.js 24 (see `.nvmrc`), npm, Python 3, and Git. Install Chromium with Playwright; on a fresh Linux machine, use `npx playwright install --with-deps chromium` if system libraries are missing.

```sh
npm ci
npx playwright install chromium
npm run build
npm run serve
```

Open <http://127.0.0.1:8000>. Don't open `index.html` via `file://`: native modules need HTTP, and the Clipboard API needs a secure context (loopback qualifies).

After changing markup, Tailwind configuration, or style sources, run `npm run build` and commit `assets/site.css` with the change. Tailwind is pinned to the original CDN version to preserve the design; its bundled Browserslist data advances only when Tailwind is upgraded. To reset preferences, clear the site's local storage or use a private window.

## Quality gates

| Command                                | What it checks                                                                                       |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `npm run lint`, `npm run format:check` | ESLint with zero warnings and Prettier                                                               |
| `npm run typecheck`                    | Strict TypeScript `checkJs` for source, scripts, and tests; no emit                                  |
| `npm run build:check`                  | Recompiles CSS and rejects missing or stale tracked output                                           |
| `npm run test:links`                   | Parses HTML, checks local assets/imports at the Pages project path and validates outbound URL syntax |
| `npm test`                             | Vitest; each preferences/clipboard module must reach 90% lines, branches, functions and statements   |
| `npm run test:browser`                 | Chromium interaction and fallback tests, including axe WCAG A/AA scans                               |
| `npm run test:lighthouse`              | Mobile and desktop Lighthouse budgets; JSON under `.lighthouse/`                                     |
| `npm run audit`                        | npm dependency advisory gate                                                                         |

`make install`, `make build`, `make serve`, and `make check` are shortcuts. CI runs all gates on pushes and pull requests. The link gate does not depend on external services being reachable; visit the GitHub, LinkedIn, and Alura destinations when updating them.

## Deployment and security

GitHub Pages publishes the root of `main` with HTTPS enforced. After checks pass, merge the PR, verify the Pages deployment, and open the live project URL. No artifact upload or settings change is required. Relative resource paths work under `/Portfolio/`; update the canonical and social URLs if the public URL changes.

The document's meta CSP allows scripts, styles, images, fonts, and connections only to the same origin and denies other resource types by default. The site uses no inline scripts or styles. GitHub Pages does not expose per-site response header configuration: header-only directives such as `frame-ancestors` and CSP reporting are not enforced by the meta policy. Use a host that supports custom headers if those controls become a requirement.

## Media credits

- Inter by Rasmus Andersson: [SIL Open Font License](assets/fonts/OFL.txt).
- Profile photo: [João Victor's GitHub profile](https://github.com/Joaovictoreth1). The local copy is WebP.
- Hero media: [original GIPHY animation](https://giphy.com/gifs/26tn33aiTi1jkl6H6); the site uses an optimized WebP and a still frame for users who prefer reduced motion.
- Skill artwork: [JavaScript](https://commons.wikimedia.org/wiki/File:JavaScript-logo.png), [Python](https://commons.wikimedia.org/wiki/File:Python-logo-notext.svg), [C#](https://commons.wikimedia.org/wiki/File:Csharp_Logo.png), and [HTML5](https://commons.wikimedia.org/wiki/File:HTML5_logo_and_wordmark.svg) via Wikimedia Commons. The Java cup and favicon were drawn for this site.
- Alura wordmark: [Alura](https://www.alura.com.br/). Logos identify their respective projects and organizations.
