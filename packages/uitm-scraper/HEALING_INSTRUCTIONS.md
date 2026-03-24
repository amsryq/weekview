# UiTM Timetable Scraper - Self-Healing Protocol

You are an expert scraping engineer agent. Your job is to repair the `uitm-scraper` extraction logic when the university updates their portal to break bots. 

## The Target Threat
The target portal uses dynamic obfuscation. They inject hidden form fields with random, obfuscated IDs and values via a `<script>` tag right before submitting an AJAX request to a similarly obfuscated endpoint. 

When our scraper fails, it means the structure of this `<script>` block, the endpoint URL, or the hidden field requirements have changed.

## Your Objective
Update the extraction logic in `src/scraper.ts` or related files so that the scraper can successfully fetch a timetable using raw HTTP requests. 

## The Workflow

1. **Establish Ground Truth (Metadata):**
   - Use `browser-use --headed open <URL>` to navigate the portal.
   - Fetch the list of available **campuses** and **faculties** from the `<select>` or `select2` dropdowns.
   - Run `pnpm test:fetch --type campus` and `pnpm test:fetch --type faculty`.
   - **Audit:** Compare the programmatic IDs and labels against the browser. Check for "Error" responses in the terminal.

2. **Establish Ground Truth (Schedules):**
   - In the browser, select a campus (e.g., "J") and input an empty string for course field ("") to get all courses.
   - Click Search and open the resulting timetable in a new tab if necessary (`browser-use switch 1`).
   - Note the sessions, days, and times. Take a screenshot if needed: `browser-use screenshot ground_truth.png`.

3. **Run Programmatic Fetch:**
   - Run the fetch script: `pnpm test:fetch --campus <CAMPUS_CODE> --course <COURSE_CODE>`.
   - Example: `pnpm test:fetch --campus J --course ACC036`.

4. **Diagnose and Repair:**
   - Compare JSON output against the browser Ground Truth.
   - If broken, inspect the page source for the `check_form_before_submit()` function using `browser-use eval`.
   - Look for multiple token assignments: `document.getElementById('token1').value = '...'`.
   - Update `src/scraper.ts` to capture all dynamic tokens, ensuring fields sharing the same ID are correctly mapped.
   - Check if AJAX URLs in `.select2()` calls or `$.ajax` calls have changed and update `extractAjaxUrl` regex if needed.

5. **Verify:**
   - Repeat steps 1, 3, and 4.
   - Run `pnpm typecheck` to ensure code validity.
   - `browser-use close` when finished.

## Diagnostic Guidance

### 1. Diagnostic Logs
The library includes defensive logging in `src/scraper.ts`. If the scraper fails, check for these warning patterns:
- `Diagnostic: indexResultLocation not found in scripts.` (The URL for form submission has changed)
- `Diagnostic: campusSelectLocation not found in scripts.` (The URL for campus AJAX has changed)
- `Diagnostic: facultySelectLocation not found in scripts.` (The URL for faculty AJAX has changed)

### 2. Common Failure Patterns
- **Token Obfuscation:** The university frequently changes the `id` and `name` of hidden tokens (e.g., `lIIlllIl`). Always check the `<script>` tag for assignments like `document.getElementById('...').value = '...'`.
- **AJAX Endpoint Shifts:** The URLs for fetching campuses or faculties are often derived from script variables. Ensure the Regex in `extractAjaxUrl` is still matching correctly.

## Constraints
- The final scraper code must run using standard Node.js `fetch`. 
- `browser-use` is strictly for establishing your Ground Truth during this healing process.
