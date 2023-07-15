import * as React from 'react'
import { Link } from 'gatsby'

import ButtonLink from '../button/buttonLink'

import * as styles from './navbar.module.scss'
import States from '../../types/states'

type NavbarProps = {
  props: {
    section: States.section,
    setSection: React.Dispatch<React.SetStateAction<States.section>>
  }
}

const smoothScrollToSection = (id: string, setSection: React.Dispatch<React.SetStateAction<States.section>>) => {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    setSection(id as States.section)
  }
}

const makeNavbarSticky = () => {
  const navbar = document.getElementById('navbar')

  if (!navbar) return

  if (document.documentElement.scrollTop > 0) {
    navbar.classList.add(styles.sticky)
  }
  else {
    navbar.classList.remove(styles.sticky)
  }

}



const Navbar = ({ props }: NavbarProps) => {
  return (
    <nav id="navbar">
      <h1>
        <Link 
          to='/#' 
          onClick={() => smoothScrollToSection('namesplash', props.setSection)}
          className={styles.name}
          >
          
          Nathan Rumsey
        </Link>
      </h1>
      <div className={styles.navigation}>
        <ul className={styles.navLinks}>
          <li>
            <Link to='/#about'
              onClick={() => smoothScrollToSection('about', props.setSection)}
              className={`${styles.navLink} ${props.section === 'about' ? styles.active : ''}`}
            >
              About
            </Link>
          </li>
          <li>
            <Link to='/#experience'
              onClick={() => smoothScrollToSection('experience', props.setSection)}
              className={`${styles.navLink} ${props.section === 'experience' ? styles.active : ''}`}
            >
              Experience
            </Link>
          </li>
          <li>
            <Link to='/#projects'
              onClick={() => smoothScrollToSection('projects', props.setSection)}
              className={`${styles.navLink} ${props.section === 'projects' ? styles.active : ''}`}
            >
              Projects
            </Link>
          </li>
          <li>
            <Link to='/#contact'
              onClick={() => smoothScrollToSection('contact', props.setSection)}
              className={`${styles.navLink} ${props.section === 'contact' ? styles.active : ''}`}
            >
              Contact
            </Link>
          </li>
        </ul>
        <ButtonLink props={{ to: '/resume.pdf', text: 'Resume' }} />
      </div>
    </nav>
  )
}

window.addEventListener('scroll', makeNavbarSticky)

export default Navbar