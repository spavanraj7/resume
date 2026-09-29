import React, { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowDown, ArrowRight, Check, ChevronDown, ChevronRight, CircleCheck, Clock3, FileText, FileUp, Gauge, LoaderCircle, Menu, Play, ShieldCheck, Sparkles, Target, X } from 'lucide-react'
import './style.css'

function App() {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [dragging, setDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [openSection, setOpenSection] = useState('review')
  const [menuOpen, setMenuOpen] = useState(false)

  const acceptFile = (nextFile) => {
    if (!nextFile) return
    if (!(nextFile.type === 'application/pdf' || nextFile.name.toLowerCase().endsWith('.pdf'))) {
      setError('Please choose a PDF file.')
      return
    }
    if (nextFile.size > 5 * 1024 * 1024) {
      setError('Your PDF must be 5 MB or smaller.')
      return
    }
    setFile(nextFile)
    setResult(null)
    setError('')
  }

  const submitReview = async () => {
    if (!file || jobDescription.trim().length < 30) return
    setLoading(true)
    setError('')
    setResult(null)
    const form = new FormData()
    form.append('resume', file)
    form.append('jobDescription', jobDescription)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || ''}/api/resume/review`, { method: 'POST', body: form })
      const payload = await response.json()
      if (!response.ok || !payload.success) throw new Error(payload.error?.message || 'The review could not be completed. Please try again.')
      setResult(payload.data)
    } catch (requestError) {
      setError(requestError.message || 'Could not connect to the review service. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggle = (id) => setOpenSection(openSection === id ? '' : id)

  return (
    <div className="app-shell min-h-screen">
      <header className="topbar">
        <a className="top-brand" href="#top" aria-label="Goodwork home"><span className="brand-symbol"><span /></span><span className="brand-name">goodwork<span className="brand-dot">.</span></span></a>
        <div className="course-heading"><span className="course-mark"><Sparkles size={16}/></span><span>Resume review workspace</span></div>
        <div className="profile-button"><span className="profile-avatar">P</span><span className="profile-name">Your workspace</span><ChevronDown size={15}/></div>
        <button className="mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={20}/></button>
        {menuOpen && <div className="mobile-nav"><a href="#upload" onClick={() => setMenuOpen(false)}>Upload resume</a><a href="#feedback" onClick={() => setMenuOpen(false)}>What we check</a></div>}
      </header>
      <main id="top" className="workspace-layout">
        <section className="workspace-main">
          <div className="welcome-line"><span className="eyebrow">YOUR NEXT CHAPTER, STARTS HERE</span><span className="private-label"><ShieldCheck size={14}/> Private workspace</span></div>
          <h1>Make your resume <span>work harder.</span></h1>
          <p className="intro-copy">Compare your resume with a real job description. Get a clear match score and practical ways to strengthen your application.</p>
          <div id="upload" className="resume-stage">
            <div className="stage-top"><div><span className="step-label">STEP 01 <span>—</span> YOUR RESUME</span><h2>Start with your resume</h2></div><span className="stage-icon"><FileUp size={19}/></span></div>
            <div role="button" tabIndex={0} onClick={() => inputRef.current?.click()} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); acceptFile(e.dataTransfer.files?.[0]) }} className={`drop-zone ${dragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''}`}>
              <input ref={inputRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={(e) => { acceptFile(e.target.files?.[0]); e.target.value = '' }}/>
              {file ? <><span className="upload-icon"><FileText size={24}/></span><strong className="file-name">{file.name}</strong><span className="upload-hint">{(file.size / (1024 * 1024)).toFixed(2)} MB · PDF ready</span><button className="remove-file" onClick={(e) => { e.stopPropagation(); setFile(null); setResult(null) }}><X size={13}/> Remove file</button></> : <><span className="upload-icon"><FileUp size={24}/></span><strong>Drop your resume to begin</strong><span className="upload-hint">Drag and drop, or <span className="browse-link">browse your files</span></span><span className="file-types">PDF <i/> UP TO 5 MB</span></>}
            </div>
            <label className="jd-label" htmlFor="job-description">STEP 02 — THE JOB DESCRIPTION</label>
            <textarea id="job-description" className="jd-input" value={jobDescription} onChange={(e) => { setJobDescription(e.target.value); setResult(null) }} placeholder="Paste the job description you’re applying for…" maxLength={20000}/>
            <div className="jd-meta">{jobDescription.length.toLocaleString()} / 20,000 characters · Paste at least 30 characters</div>
            <div className="stage-actions"><span className="secure-note"><ShieldCheck size={14}/> Resume processed in memory</span><button disabled={!file || jobDescription.trim().length < 30 || loading} onClick={submitReview} className="review-button">{loading ? <><LoaderCircle size={16} className="spin"/> Reviewing…</> : result ? <><Check size={16}/> Review complete</> : <>Score my resume <ArrowRight size={16}/></>}</button></div>
            {error && <div className="error-message" role="alert">{error}</div>}
            {result && <div className="result-panel" aria-live="polite"><div className="result-heading"><div><span className="eyebrow">YOUR JOB MATCH</span><h3>Resume score</h3></div><div className="score-badge">{result.score}<small>/100</small></div></div><p className="result-caption">Keyword coverage: {result.keywordCoverage}% · {result.pages} page{result.pages === 1 ? '' : 's'} analyzed</p><div className="result-columns"><div><strong>Matched keywords</strong><div className="keyword-list">{result.matchedSkills.length ? result.matchedSkills.map((skill) => <span className="keyword good" key={skill}>{skill}</span>) : <span className="muted">No direct matches found</span>}</div></div><div><strong>Keywords to consider</strong><div className="keyword-list">{result.missingSkills.length ? result.missingSkills.slice(0, 12).map((skill) => <span className="keyword" key={skill}>{skill}</span>) : <span className="muted">No priority gaps found</span>}</div></div></div><div className="result-feedback"><strong>Next steps</strong>{result.feedback.map((item, index) => <p key={index}><CircleCheck size={14}/>{item}</p>)}</div><small className="score-note">This score compares text keywords and common resume sections. It is a guide, not a hiring decision.</small></div>}
          </div>
          <div id="feedback" className="below-stage"><div className="tabs"><a className="tab active" href="#feedback">What we check</a><a className="tab" href="#how-it-works">How it works</a></div><div className="feedback-summary"><h3>A review that gets to the point.</h3><p>We compare resume keywords to your target role and check for core resume sections.</p><div className="summary-chips"><span><Gauge size={14}/> Overall score</span><span><Target size={14}/> Role alignment</span><span><Sparkles size={14}/> Clear next steps</span></div></div></div>
        </section>
        <aside className="workspace-sidebar">
          <div className="sidebar-heading"><div><span className="eyebrow">YOUR REVIEW</span><h2>What’s inside</h2></div><span className="sidebar-count">03</span></div>
          <ReviewCard id="score" open={openSection === 'score'} onToggle={toggle} icon={<Gauge size={18}/>} title="Resume score" detail="A clear snapshot of your strengths" number="01"/>
          <ReviewCard id="match" open={openSection === 'match'} onToggle={toggle} icon={<Target size={18}/>} title="Role alignment" detail="See how well your skills line up" number="02"/>
          <ReviewCard id="review" open={openSection === 'review'} onToggle={toggle} icon={<Sparkles size={18}/>} title="Helpful feedback" detail="Practical ideas to improve your story" number="03"/>
          <div className="sidebar-foot"><div className="foot-icon"><ShieldCheck size={16}/></div><div><strong>Your privacy comes first</strong><span>Files are handled with care.</span></div></div>
          <a className="sidebar-link" href="#upload" onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}>Ready when you are <ArrowRight size={14}/></a>
        </aside>
      </main>
      <footer className="footer"><span>goodwork<span className="brand-dot">.</span></span><span>Helpful feedback for whatever comes next.</span><span>© 2025 Goodwork</span></footer>
    </div>
  )
}

function ReviewCard({ id, open, onToggle, icon, title, detail, number }) {
  return <div className={`review-card ${open ? 'expanded' : ''}`}><button className="review-card-head" onClick={() => onToggle(id)} aria-expanded={open}><span className="review-icon">{icon}</span><span className="review-title-wrap"><strong>{title}</strong><small>{detail}</small></span><span className="review-chevron">{open ? <ChevronDown size={17}/> : <ChevronRight size={17}/>}</span></button>{open && <div className="review-card-content"><div className="review-divider"/><span className="review-points"><Play size={12}/> 2 quick insights <Clock3 size={13}/> 1 min <CircleCheck size={14}/> <span>Ready</span></span><p>Simple guidance to help you put your best experience forward.</p><span className="card-index">CHECK {number} <ArrowDown size={12}/></span></div>}</div>
}

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>)
