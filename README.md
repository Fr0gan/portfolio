# Logan Loftus · Portfolio

Personal portfolio site, live at **https://fr0gan.github.io/portfolio/**.

Everything is hand-written HTML, CSS and JavaScript. There are no frameworks, libraries or build steps, so every page works by opening it in a browser.

## Projects

| Project | What it does | Highlights |
| --- | --- | --- |
| [Weather](https://fr0gan.github.io/portfolio/projects/weather/) | Current conditions, 24-hour and 7-day forecasts for any city | Open-Meteo APIs, accessible search combobox, geolocation |
| [Budget Tracker](https://fr0gan.github.io/portfolio/projects/budget-tracker/) | Monthly income, spending and category budgets | `Intl` formatting, CSV export, localStorage |
| [Cedar & Cairn](https://fr0gan.github.io/portfolio/projects/cedar-and-cairn/) | Concept website for a fictional hiking outfitter | Trip filters, rental estimate calculator, validated booking form |
| [Contrast Checker](https://fr0gan.github.io/portfolio/projects/contrast-checker/) | Checks text and background colors against WCAG 2.2 | Luminance math, suggested fixes, shareable links |
| [Pixel Studio](https://fr0gan.github.io/portfolio/projects/pixel-studio/) | Pixel-art editor with PNG export | Flood fill, Bresenham lines, undo/redo |
| [Speed Typer](https://fr0gan.github.io/portfolio/projects/typing-test/) | Typing speed and accuracy test | Input-event handling that works with phone keyboards |

## Run it locally

Any static file server works. From the repository root:

```sh
python3 -m http.server 8000
```

Then open http://localhost:8000/.

The custom `404.html` uses root-relative links (`/portfolio/...`) because GitHub Pages serves it for missing URLs at any depth. To preview it locally, serve the folder that contains `portfolio/` and open http://localhost:8000/portfolio/404.html.

## Structure

```
index.html            Homepage
style.css, script.js  Homepage styles and navigation
404.html              Page shown for missing URLs on GitHub Pages
favicon.svg           Site icon
images/projects/      Project screenshots used on the homepage
projects/
  projects.css        Shared styles for every project page (light and dark themes)
  <project>/index.html  Each project is a single self-contained page
```

## Conventions

- Colors come from the design tokens at the top of `style.css` and `projects/projects.css`. Both define a light theme and a dark theme that follows the visitor's system setting.
- Pages must work at 375px wide without sideways scrolling, and must be usable with a keyboard.
- Nothing is sent to a server. Projects that save data use `localStorage` in the visitor's browser.
