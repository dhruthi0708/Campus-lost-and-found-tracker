import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Sparkles, ShieldCheck, QrCode, Bell, MapPin, ArrowRight, CheckCircle2, FilePlus2, Users, Zap, Clock } from 'lucide-react'

const features = [
  { icon: Sparkles, title: 'Smart matching', text: 'Lost and found reports are compared automatically so likely matches surface in seconds.' },
  { icon: ShieldCheck, title: 'Verified claims', text: 'Staff review every claim so belongings only go back to their rightful owners.' },
  { icon: QrCode, title: 'QR handover', text: 'Approved claims get a secure QR code that is scanned at the help desk on pickup.' },
  { icon: Bell, title: 'Instant alerts', text: 'Get notified the moment a match appears or your claim status changes.' },
  { icon: MapPin, title: 'Campus-wide board', text: 'Browse every reported item by category, location and date in one clean place.' },
  { icon: Users, title: 'Built for campus', text: 'Separate workspaces for students, security staff and admins with real analytics.' },
]

const steps = [
  { icon: FilePlus2, title: 'Report', text: 'Post a lost or found item with photo, place and date.' },
  { icon: Sparkles, title: 'Match', text: 'We suggest the best candidates and notify both sides.' },
  { icon: ShieldCheck, title: 'Verify', text: 'Submit a claim and staff confirm ownership.' },
  { icon: CheckCircle2, title: 'Reunite', text: 'Show your QR code and collect your item.' },
]

export default function Landing() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal')
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('reveal--in'); io.unobserve(e.target) }
    }), { threshold: 0.15 })
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <div className="landing">
      <header className="l-nav">
        <Link to="/" className="brand"><span className="brand__mark"><Search size={18} /></span>CampusFind</Link>
        <nav className="l-nav__links">
          <a href="#features">Features</a>
          <a href="#how">How it works</a>
        </nav>
        <div className="l-nav__cta">
          <Link to="/login" className="btn btn--ghost">Log in</Link>
          <Link to="/register" className="btn btn--primary">Get started</Link>
        </div>
      </header>

      <section className="l-hero">
        <div className="l-hero__glow" aria-hidden="true" />
        <div className="l-hero__copy">
          <span className="pill"><Zap size={14} /> The smarter campus lost &amp; found</span>
          <h1>Lost something? <span className="grad">Let's bring it home.</span></h1>
          <p>CampusFind connects students and staff to recover belongings faster, with smart matching, verified claims and QR handovers.</p>
          <div className="l-hero__actions">
            <Link to="/register" className="btn btn--primary btn--lg">Create free account <ArrowRight size={16} /></Link>
            <Link to="/login" className="btn btn--ghost btn--lg">Try demo login</Link>
          </div>
          <div className="l-hero__trust"><CheckCircle2 size={16} /> No setup needed · Works on any device</div>
        </div>
        <div className="l-hero__visual" aria-hidden="true">
          <div className="float-card float-card--a">
            <div className="float-card__icon"><Sparkles size={18} /></div>
            <div><strong>94% match found</strong><span>Black backpack · Library</span></div>
          </div>
          <div className="float-card float-card--b">
            <div className="float-card__icon float-card__icon--green"><ShieldCheck size={18} /></div>
            <div><strong>Claim approved</strong><span>Collect with your QR</span></div>
          </div>
          <div className="mock">
            <div className="mock__bar"><i /><i /><i /></div>
            <div className="mock__row"><span className="mock__tag mock__tag--lost">Lost</span><b>Blue water bottle</b><em>Cafeteria</em></div>
            <div className="mock__row"><span className="mock__tag mock__tag--found">Found</span><b>Student ID card</b><em>Block C</em></div>
            <div className="mock__row"><span className="mock__tag mock__tag--lost">Lost</span><b>AirPods case</b><em>Gym</em></div>
            <div className="mock__chart"><span style={{ height: '40%' }} /><span style={{ height: '65%' }} /><span style={{ height: '50%' }} /><span style={{ height: '85%' }} /><span style={{ height: '70%' }} /><span style={{ height: '95%' }} /></div>
          </div>
        </div>
      </section>

      <section className="l-stats reveal">
        {[['3x', 'faster recovery'], ['100%', 'verified handovers'], ['24/7', 'online reporting'], ['< 1 min', 'to report an item']].map(([v, l]) => (
          <div key={l}><b>{v}</b><span>{l}</span></div>
        ))}
      </section>

      <section id="features" className="l-section">
        <div className="l-section__head reveal">
          <span className="pill pill--soft">Features</span>
          <h2>Everything you need to reunite people with their things</h2>
          <p>A complete workflow from first report to final handover.</p>
        </div>
        <div className="l-grid">
          {features.map(({ icon: Icon, title, text }, i) => (
            <article key={title} className="l-card reveal" style={{ transitionDelay: `${i * 60}ms` }}>
              <span className="l-card__icon"><Icon size={22} /></span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="l-section l-section--tint">
        <div className="l-section__head reveal">
          <span className="pill pill--soft"><Clock size={14} /> How it works</span>
          <h2>Four simple steps</h2>
        </div>
        <div className="l-steps">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="l-step reveal" style={{ transitionDelay: `${i * 80}ms` }}>
              <span className="l-step__num">{i + 1}</span>
              <Icon size={22} />
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="l-cta reveal">
        <h2>Ready to find what's yours?</h2>
        <p>Join your campus community and make lost items a thing of the past.</p>
        <Link to="/register" className="btn btn--white btn--lg">Get started free <ArrowRight size={16} /></Link>
      </section>

      <footer className="l-footer">
        <Link to="/" className="brand"><span className="brand__mark"><Search size={16} /></span>CampusFind</Link>
        <span>© {new Date().getFullYear()} CampusFind. Find what's lost. Reunite what's found.</span>
      </footer>
    </div>
  )
}
