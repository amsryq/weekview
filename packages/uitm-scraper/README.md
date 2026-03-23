# @weekview/uitm-scraper

A fast, fully-typed screen scraping library to fetch and parse UiTM course, campus, faculty, and student timetable data from iCress and MyStudent APIs.

## Features

- **Dynamic Scraping**: Extracts runtime-generated form tokens and AJAX endpoint URLs dynamically from root scripts.
- **Robust Parsing**: Parses complex HTML layouts and AJAX responses into clean, structured JSON.
- **Unified Time Formats**: Seamlessly converts various time formats (12hr/24hr) into standardized 24hr strings or `Clock` objects.
- **State Management**: Maintains active persistent sessions using a customizable `StorageAdapter`.
- **Dual API Support**: Supports both legacy iCress (campus/faculty/course search) and modern MyStudent (CDN-based student timetables).

## Installation

This is an internal package in the monorepo workspace. To use it in another package:

```bash
pnpm add @weekview/uitm-scraper --workspace
```

## Usage

### 1. Implement StorageAdapter

The scraper requires a storage mechanism for caching tokens and session cookies.

```typescript
import { StorageAdapter } from "@weekview/uitm-scraper";

const myStorage: StorageAdapter = {
  get: async (key) => { /* fetch from Redis/Database/LocalStorage */ },
  set: async (key, value, ttlSeconds) => { /* save with optional TTL */ },
  delete: async (key) => { /* remove key */ },
};
```

### 2. Initialize and Use Scraper

```typescript
import { UiTMScraper } from "@weekview/uitm-scraper";

const scraper = new UiTMScraper({ storage: myStorage });

// Get all campuses
const campuses = await scraper.getCampuses("campus");

// Get courses for a specific campus
const courses = await scraper.getCourses("B", "FSKTM");

// Get groups for a specific course (using the path)
const groups = await scraper.getGroups(courses[0].path);

// Get student timetable by ID
const timetable = await scraper.getStudentTimetable("2023123456");
```

## API Reference

### `UiTMScraper`

The main entry point for the library.

| Method | Parameters | Description |
| :--- | :--- | :--- |
| `getCampuses` | `mode: "campus" \| "faculty"` | Fetches list of campuses or faculties. |
| `getCourses` | `campus: string, faculty?: string` | Fetches courses available for a campus/faculty. |
| `getGroups` | `path: string` | Parses specific course group sessions from an iCress path. |
| `getStudentTimetable` | `studentId: string` | Fetches a student's public timetable from MyStudent CDN. |

### Types

- `Campus`: `{ code: string; name: string; requireFaculty: boolean; }`
- `Course`: `{ code: string; campusCode: string; facultyCode: string | null; path: string; }`
- `Group`: `{ code: string; sessions: Session[]; }`
- `Session`: `{ groupCode: string; room?: string; day: number; start: string; end: string; ... }`

## Internals

The library uses `node-html-parser` for DOM traversal and `tough-cookie` for session management. It targets the following endpoints:
- **iCress**: `https://simsweb4.uitm.edu.my/estudent/class_timetable/`
- **MyStudent**: `https://cdn.uitm.edu.my/jadual/baru/`

## Development

```bash
pnpm build      # Build the package
pnpm typecheck  # Run type checking
```
