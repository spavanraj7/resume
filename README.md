# Goodwork resume reviewer

Full-stack resume-to-job-description scoring app.

## Run locally

Start the API in one terminal:

```sh
cd server
npm install
npm run dev
```

Start the Vite app in another terminal:

```sh
cd front-end
npm install
npm run dev
```

The Vite development server proxies `/api` requests to `http://localhost:3001`. The API health check is available at `/api/health`.

## Use

Upload a selectable-text PDF resume (up to 5 MB), paste at least 30 characters of a job description, then choose **Score my resume**. The API extracts the PDF text in memory and returns a keyword match score, matched and missing terms, common resume section checks, and suggestions. Scanned PDFs need OCR and are not supported.

The score is a transparent heuristic based on job-description term coverage (80%) and the presence of Experience, Education, and Skills sections (20%). It is guidance for tailoring a resume, not an assessment of hiring eligibility.

## Deploy

The root `vercel.json` configures the `front-end` Vite site and `server` Express API as Vercel services. `/api/*` is routed to the API service; other paths go to the frontend. For local development, run both services as described above.
