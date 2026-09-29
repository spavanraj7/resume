import React, { useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ArrowDown, ArrowRight, Check, ChevronDown, ChevronRight, CircleCheck, Clock3, FileText, FileUp, Gauge, Menu, Play, ShieldCheck, Sparkles, Target, X } from 'lucide-react'
import './style.css'

function App() {
  const inputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [reviewed, setReviewed] = useState(false)
  const [openSection, setOpenSection] = useState('review')
  const [menuOpen, setMenuOpen] = useState(false)

  const acceptFile = (nextFile) => {
    if (nextFile && (nextFile.type === 'application/pdf' || nextFile.name.toLowerCase().endsWith('.docx'))) {
      setFile(nextFile)
      setReviewed(false)
    }
  }

  const toggle = (id) => setOpenSection(openSection === id ? '' : id)

  return (
    <div className="app-shell min-h-screen">
      <header className="topbar">
        <a className="top-brand" href="#top" aria-label="Goodwork home"><span className="brand-symbol"><span /></span><span className="brand-name">goodwork<span className="brand-dot">.</span></span></a>
        <div className="course-heading"><span className="course-mark"><Sparkles size={16}/></span><span>Resume review workspace</span></div>
        <button className="profile-button"><span className="profile-avatar">P</span><span className="profile-name">Your workspace</span><ChevronDown size={15}/></button>
        <button className="mobile-menu" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}><Menu size={20}/></button>
        {menuOpen && <div className="mobile-nav"><a href="#upload" onClick={() => setMenuOpen(false)}>Upload resume</a><a href="#feedback" onClick={() => setMenuOpen(false)}>What we check</a></div>}
      </header>

      <main id="top" className="workspace-layout">
        <section className="workspace-main">
          <div className="welcome-line"><span className="eyebrow">YOUR NEXT CHAPTER, STARTS HERE</span><span className="private-label"><ShieldCheck size={14}/> Private workspace</span></div>
          <h1>Make your resume <span>work harder.</span></h1>
          <p className="intro-copy">A thoughtful review can make all the difference. Drop in your resume and get a clear score with practical ways to stand out.</p>

          <div id="upload" className="resume-stage">
            <div className="stage-top"><div><span className="step-label">STEP 01 <span>—</span> YOUR RESUME</span><h2>Start with your resume</h2></div><span className="stage-icon"><FileUp size={19}/></span></div>
            <div role="button" tabIndex={0} onClick={() => inputRef.current?.click()} onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragging(true) }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); acceptFile(e.dataTransfer.files?.[0]) }} className={`drop-zone ${dragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''}`}>
              <input ref={inputRef} type="file" accept=".pdf,.docx,application/pdf" className="hidden" onChange={(e) => acceptFile(e.target.files?.[0])}/>
              {file ? <><span className="upload-icon"><FileText size={24}/></span><strong className="file-name">{file.name}</strong><span className="upload-hint">{(file.size / (1024 * 1024)).toFixed(2)} MB · Ready for your review</span><button className="remove-file" onClick={(e) => { e.stopPropagation(); setFile(null); setReviewed(false) }}><X size={13}/> Remove file</button></> : <><span className="upload-icon"><FileUp size={24}/></span><strong>Drop your resume to begin</strong><span className="upload-hint">Drag and drop, or <span className="browse-link">browse your files</span></span><span className="file-types">PDF OR DOCX <i/> UP TO 10 MB</span></>}
            </div>
            <div className="stage-actions"><span className="secure-note"><ShieldCheck size={14}/> Your file stays private and secure</span><button disabled={!file} onClick={() => setReviewed(true)} className="review-button">{reviewed ? <><Check size={16}/> Resume added</> : <>Get my free review <ArrowRight size={16}/></>}</button></div>
            {reviewed && <div className="status-message"><CircleCheck size={16}/> Your resume is ready. Connect a review service to get your personalized score.</div>}
          </div>

          <div id="feedback" className="below-stage"><div className="tabs"><a className="tab active" href="#feedback">What we check</a><a className="tab" href="#how-it-works">How it works</a></div><div className="feedback-summary"><h3>A review that gets to the point.</h3><p>Get a clearer picture of what recruiters see, then decide what to improve first.</p><div className="summary-chips"><span><Gauge size={14}/> Overall score</span><span><Target size={14}/> Role alignment</span><span><Sparkles size={14}/> Clear next steps</span></div></div></div>
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
