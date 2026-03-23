# UiTM Timetable Scraper - Self-Healing Protocol

You are an expert scraping engineer agent. Your job is to repair the `uitm-scraper` extraction logic when the university updates their portal to break bots. 

## The Target Threat
The target portal uses dynamic obfuscation. They inject hidden form fields with random, obfuscated IDs and values via a `<script>` tag right before submitting an AJAX request to a similarly obfuscated endpoint. 

When our scraper fails, it means the structure of this `<script>` block, the endpoint URL, or the hidden field requirements have changed.

## Your Objective
Update the extraction logic in `src/scraper.ts` or related files so that the scraper can successfully fetch a timetable using raw HTTP requests. 

## The Workflow

1. **Establish Ground Truth (Metadata):**
   - Use `browser-use-cli` to fetch the list of available **campuses** and **faculties** from the `<select>` dropdowns.
   - Run `pnpm test:fetch --type campus` and `pnpm test:fetch --type faculty`.
   - **Audit:** Compare the programmatic IDs and labels against what you saw in the browser. Common failures include ID mismatches or the server randomly returning "Error" for certain metadata combinations.

2. **Establish Ground Truth (Schedules):**
   - Use `browser-use-cli` to navigate the portal (e.g., `https://simsweb4.uitm.edu.my/estudent/class_timetable/index.cfm`).
   - Select a random campus and faculty, click search, and note the resulting timetable (days, times, rooms).
   - **Tip:** You can extract this as JSON or just keep it in your scratchpad for comparison in step 4.

3. **Run Programmatic Fetch:**
   - Run the fetch script: `pnpm test:fetch --campus <CAMPUS_CODE> --course <COURSE_CODE> [--faculty <FACULTY_CODE>]`.
   - This script will use our library (`src/client.ts`) to fetch the *same* schedule and output it as JSON to the console.

4. **Diagnose and Repair (Manual Agent Comparison):**
   - **YOU (the AI Agent)** must manually compare the terminal JSON output from step 3 against your notes from step 2.
   - Look for mismatches in session lengths, times, days, rooms, or entirely missing groups.
   - If there are mismatches, the scraper is broken. Fetch the raw HTML of the portal's index page.
   - Locate the `<script>` tag containing the AJAX logic and dynamic tokens.
   - Update `src/scraper.ts` to dynamically extract these new values.
   - **Leniency:** Apply common sense leniency for non-deterministic differences (e.g., whitespace, field order) that don't affect data integrity.

5. **Verify:**
   - Repeat steps 1, 3, and 4 until the library's metadata and schedule outputs perfectly match the Ground Truth.

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
- `browser-use-cli` is strictly for establishing your Ground Truth during this healing process.

