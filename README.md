<div align="center">
	<br />
	<picture>
		<source media="(prefers-color-scheme: dark)" srcset="apps/web/public/images/logo-dark.svg">
		<source media="(prefers-color-scheme: light)" srcset="apps/web/public/images/logo-light.svg">
		<img height="150" alt="weekview" src="apps/web/public/images/logo-light.svg" />
	</picture>
	<br />
	<p align="center">A modern web application for generating and customizing weekly schedules for students.</p>

[![Code Size](https://img.shields.io/github/languages/code-size/amsryq/weekview?color=blue)](https://github.com/amsryq/weekview)
[![License](https://img.shields.io/github/license/amsryq/weekview?color=007ec6)](https://github.com/amsryq/weekview/blob/master/LICENSE)

</div>

---

**weekview** is a web application for generating, organizing, and customizing weekly class schedules for students.

It streamlines timetable creation with direct schedule importing from UiTM portals, intuitive course management, visual customization options, and high-resolution exports.

## Features

- **UiTM Timetable Importer**\
  Import class schedules directly using student IDs or course codes from UiTM iCress and MyStudent portals.

- **Interactive Timetable Grid**\
  View weekly class schedules in a clean, visual grid with automatic time positioning and overlap detection.

- **Course & Session Management**\
  Add, edit, or customize courses, class groups, room locations, and time slots with ease.

- **Visual Customization**\
  Personalize timetable appearance with custom color themes, course color pickers, and light/dark modes.

- **Export & Download**\
  Export timetables directly to high-resolution PNG or SVG images for saving or sharing.

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the development server:
   ```bash
   pnpm dev
   ```

3. Open the application in your browser.

## Development

- `pnpm dev` starts the web development server.
- `pnpm build` builds the application for production.
- `pnpm lint:write` checks and formats code using Biome.
- `pnpm typecheck` performs TypeScript type checking across all workspace packages.
- `pnpm db:up` starts the local Turso / SQLite database.

### License

weekview is licensed under the [MIT License](./LICENSE).
