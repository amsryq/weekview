Your task is to repair the UiTM ICRESS extraction logic when the university updates their portal to break bots. 

The target portal uses dynamic obfuscation. They inject hidden form fields with random, obfuscated IDs and values via a `<script>` tag right before submitting an AJAX request to a similarly obfuscated endpoint. 

When our scraper fails, it means the structure of this `<script>` block, the endpoint URL, the request flow, or the hidden field requirements have changed.

## Objectives
Update the extraction logic in `src/scraper.ts` or related files so that the scraper can successfully fetch a timetable using raw HTTP requests. 

## Workflow

1. **Establish the ground truth**
   - Use the best tool availble to you that simulates the browser and go to "https://icress.uitm.edu.my/" 
   - Fetch the list of available **campuses** and **faculties**.
   - Compare the values against the browser..
   - In the browser, select a campus and input an empty string for course field ("") to get all courses and click the search button.
   - Note the sessions, days, and times.

3. **Fetch from the scraper:**
   - Run `pnpm test:fetch --type campus` and `pnpm test:fetch --type faculty`. This will output a list of campuses and faculties in JSON format.
   - Run: `pnpm test:fetch --campus <CAMPUS_CODE> --course <COURSE_CODE>`. Use the values from where you got the ground truth to fetch the timetable for a specific course.

4. **Diagnose and repair:**
   - Compare JSON output against the browser Ground Truth.
   - If the output is missing or incorrect, figure out what has changed in the portal and update the scraper logic accordingly. This may involve:
     - Updating Regex patterns to match new hidden field IDs or values.
     - Adjusting the request flow to accommodate new AJAX endpoints or parameters.
     - Ensuring that any obfuscated tokens are correctly extracted and included in requests.

## Diagnostic Guidance

### 1. Diagnostic Logs
The library includes defensive logging in `src/scraper.ts`. If the scraper fails, check for these warning patterns:
- `Diagnostic: indexResultLocation not found in scripts.` (The URL for form submission has changed)
- `Diagnostic: campusSelectLocation not found in scripts.` (The URL for campus AJAX has changed)
- `Diagnostic: facultySelectLocation not found in scripts.` (The URL for faculty AJAX has changed)

### 2. Common Failure Patterns
- **Token Obfuscation:** The university frequently changes the `id` and `name` of hidden tokens (e.g., `lIIlllIl`). Always check the `<script>` tag for assignments like `document.getElementById('...').value = '...'`.
- **AJAX Endpoint Shifts:** The URLs for fetching campuses or faculties are often derived from script variables. Ensure the Regex in `extractAjaxUrl` is still matching correctly.
- **Mismatched Values:** The UiTM portal may return some legitimate-looking values that are actually fake. Always cross-check against the browser's ground truth.

## Constraints
- The final scraper code must run using standard Node.js `fetch`. 
