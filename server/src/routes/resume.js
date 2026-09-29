import { Router } from 'express'
import multer from 'multer'
import { PDFParse } from 'pdf-parse'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const router = Router()

const SKILL_TERMS = [
  'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'sql', 'html', 'css',
  'react', 'angular', 'vue', 'node.js', 'express', 'next.js', 'django', 'flask', 'spring',
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'linux', 'git', 'github', 'jenkins',
  'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'graphql', 'rest api', 'microservices',
  'machine learning', 'deep learning', 'data analysis', 'data visualization', 'pandas', 'numpy',
  'power bi', 'tableau', 'excel', 'salesforce', 'project management', 'agile', 'scrum', 'communication',
  'leadership', 'problem solving', 'testing', 'automation', 'security', 'networking', 'figma',
]

const STOP_WORDS = new Set('about above after again against all also am an and any are as at be because been before being below between both but by can could did do does doing down during each few for from further had has have having he her here hers herself him himself his how i if in into is it its itself just more most my myself no nor not of off on once only or other our ours ourselves out over own same she should so some such than that the their theirs them themselves then there these they this those through to too under until up very was we were what when where which while who whom why will with would you your yours yourself yourselves required requirements responsibilities candidate team work year years'.split(' '))

function buildReview(resumeText, jobDescription) {
  const resume = resumeText.toLowerCase().replace(/[^a-z0-9+#.]+/g, ' ')
  const description = jobDescription.toLowerCase().replace(/[^a-z0-9+#.]+/g, ' ')
  const isPresent = (source, term) => new RegExp(`(^|[^a-z0-9])${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=$|[^a-z0-9])`).test(source)
  const skills = SKILL_TERMS.filter((term) => isPresent(description, term))
  const candidates = skills.length >= 4
    ? skills
    : [...new Set(`${description} ${description}`.split(/\s+/).filter((word) => word.length > 3 && !STOP_WORDS.has(word)))]
      .slice(0, 20)
  const matched = candidates.filter((term) => isPresent(resume, term))
  const missing = candidates.filter((term) => !isPresent(resume, term))
  const coverage = candidates.length ? Math.round((matched.length / candidates.length) * 100) : 0
  const sections = [
    { name: 'Experience', found: /experience|employment|work history/.test(resume) },
    { name: 'Education', found: /education|university|degree|college/.test(resume) },
    { name: 'Skills', found: /skills|technologies|technical/.test(resume) },
  ]
  const sectionScore = Math.round((sections.filter((section) => section.found).length / sections.length) * 100)
  const score = Math.round(coverage * 0.8 + sectionScore * 0.2)
  const feedback = []
  if (matched.length) feedback.push(`Your resume mentions ${matched.slice(0, 5).join(', ')} from the job description.`)
  if (missing.length) feedback.push(`Consider adding relevant evidence for ${missing.slice(0, 5).join(', ')} if you have that experience.`)
  const absentSections = sections.filter((section) => !section.found).map((section) => section.name.toLowerCase())
  if (absentSections.length) feedback.push(`Make sure your ${absentSections.join(' and ')} section${absentSections.length > 1 ? 's are' : ' is'} easy to find.`)
  if (!feedback.length) feedback.push('Your resume covers the main terms found in this job description. Add measurable outcomes to make your experience more compelling.')

  return { score, matchedSkills: matched, missingSkills: missing, sections, feedback, keywordCoverage: coverage }
}

async function extractPdf(file) {
  const signature = file.buffer.subarray(0, 5).toString('ascii')
  if (signature !== '%PDF-') throw new ApiError(415, 'INVALID_PDF', 'The uploaded file does not have a valid PDF signature.')
  const parser = new PDFParse({ data: file.buffer })
  try {
    const parsed = await parser.getText()
    const text = parsed.text?.trim() ?? ''
    if (!text) throw new ApiError(422, 'PDF_TEXT_NOT_FOUND', 'No selectable text was found. This PDF may be scanned or image-only.')
    return { text, pages: parsed.total }
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(422, 'PDF_PARSE_FAILED', 'The PDF could not be read. Try exporting it again and re-uploading it.')
  } finally {
    await parser.destroy().catch(() => {})
  }
}

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

    const { text, pages } = await extractPdf(req.file)

    return res.status(200).json({
      success: true,
      message: 'Resume content extracted successfully.',
      data: {
        filename: req.file.originalname,
        pages,
        text,
      },
    })
  } catch (error) {
    return next(error)
  }
})

router.post('/review', upload.single('resume'), async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError(400, 'FILE_REQUIRED', 'Attach a PDF resume to continue.')
    const jobDescription = typeof req.body.jobDescription === 'string' ? req.body.jobDescription.trim() : ''
    if (jobDescription.length < 30) {
      throw new ApiError(400, 'JOB_DESCRIPTION_REQUIRED', 'Paste a job description with at least 30 characters.')
    }
    if (jobDescription.length > 20_000) {
      throw new ApiError(413, 'JOB_DESCRIPTION_TOO_LONG', 'The job description must be 20,000 characters or shorter.')
    }
    const { text, pages } = await extractPdf(req.file)
    const review = buildReview(text, jobDescription)
    return res.json({ success: true, data: { filename: req.file.originalname, pages, ...review } })
  } catch (error) {
    return next(error)
  }
})

export default router
