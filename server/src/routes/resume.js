import { Router } from 'express'
import multer from 'multer'
import { PDFParse } from 'pdf-parse'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const router = Router()

class ApiError extends Error {
  constructor(status, code, message) {
    super(message)
    this.status = status
    this.code = code
  }
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE, files: 1 },
  fileFilter(_req, file, callback) {
    const isPdf = file.mimetype === 'application/pdf'
      && file.originalname.toLowerCase().endsWith('.pdf')

    if (!isPdf) {
      return callback(new ApiError(415, 'PDF_ONLY', 'Upload a PDF file only.'))
    }
    return callback(null, true)
  },
})

router.post('/upload', upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'FILE_REQUIRED', 'Attach a PDF using the "resume" form field.')
    }

    const signature = req.file.buffer.subarray(0, 5).toString('ascii')
    if (signature !== '%PDF-') {
      throw new ApiError(415, 'INVALID_PDF', 'The uploaded file does not have a valid PDF signature.')
    }

    const parser = new PDFParse({ data: req.file.buffer })
    let parsed
    try {
      parsed = await parser.getText()
    } catch {
      throw new ApiError(422, 'PDF_PARSE_FAILED', 'The PDF could not be read. Try exporting it again and re-uploading it.')
    } finally {
      await parser.destroy().catch(() => {})
    }

    const text = parsed.text?.trim() ?? ''
    if (!text) {
      throw new ApiError(422, 'PDF_TEXT_NOT_FOUND', 'No selectable text was found. This PDF may be scanned or image-only.')
    }

    return res.status(200).json({
      success: true,
      message: 'Resume content extracted successfully.',
      data: {
        filename: req.file.originalname,
        pages: parsed.total,
        text,
      },
    })
  } catch (error) {
    return next(error)
  }
})

export default router
