import { useEffect } from 'react'
import { Link } from 'react-router-dom'

import '../styles/about.css'

const AboutPage = () => {
  useEffect(() => {
    document.body.classList.add('about-body')
    return () => {
      document.body.classList.remove('about-body')
    }
  }, [])

  return (
    <main className="about-main">
      <section className="about-section">
        <div className="about-section__inner">
          <header className="about-section__head">
            <Link to="/" className="about-section__logo">
              PRAGMATICS
            </Link>
            <span className="about-section__tagline">CONTACTS | ABOUT US</span>
          </header>

          <div className="about-section__content">
            <div className="about-quote">
              We are stands on the <br /> frontlines of your desires <br /> to&nbsp;perform it with
              <br /> the creative and technologies <br /> to reality
            </div>
          </div>

          <div className="about-team">
            <div className="about-team__member">
              <div className="about-team__role">EXECUTIVE PRODUCER</div>
              <div className="about-team__name">Okhotnikov Nikita</div>
              <a href="mailto:nick@pragmatics.pro" className="about-team__email">
                nick@pragmatics.pro
              </a>
            </div>
            <div className="about-team__member">
              <div className="about-team__role">EXECUTIVE PRODUCER</div>
              <div className="about-team__name">Ivan Stepin</div>
              <a href="mailto:stepin@pragmatics.pro" className="about-team__email">
                stepin@pragmatics.pro
              </a>
            </div>
          </div>

          <ul className="about-social">
            <li>
              <a href="https://vimeo.com/prgmtcs" className="about-social__link" target="_blank" rel="noreferrer">
                VIMEO
              </a>
            </li>
            <li>
              <a href="https://www.facebook.com" className="about-social__link" target="_blank" rel="noreferrer">
                FACEBOOK
              </a>
            </li>
            <li>
              <a href="https://www.instagram.com" className="about-social__link" target="_blank" rel="noreferrer">
                INSTAGRAM
              </a>
            </li>
          </ul>
        </div>
      </section>
    </main>
  )
}

export default AboutPage
