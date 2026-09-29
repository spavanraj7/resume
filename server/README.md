# Resume reviewer API

Express API for extracting selectable text from PDF resumes. Files are held in memory for the request and are not written to disk.

## Start

```sh
npm install
npm run dev
```

The API listens on port `3001` by default. Set `PORT` to change it. `FRONTEND_ORIGINS` can be set to a comma-separated list of allowed browser origins; by default it allows Vite on `localhost:5173` and `127.0.0.1:5173`.

## Upload a resume

`POST /api/resume/upload` with `multipart/form-data`, using the field name `resume`. Only `.pdf` files are accepted, with a maximum size of 5 MB.

Successful response (`200`):

```json
{
  "success": true,
  "message": "Resume content extracted successfully.",
  "data": {
    "filename": "resume.pdf",
    "pages": 2,
    "text": "Extracted resume text..."
  }
}
```

Errors use a JSON shape with `success: false` and an `error` object containing a stable `code` and readable `message`. Scanned/image-only PDFs return `PDF_TEXT_NOT_FOUND`; OCR is not included.

Health check: `GET /api/health`.
