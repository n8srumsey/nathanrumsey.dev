import * as React from "react"
import type { HeadFC, PageProps } from "gatsby"

import Navbar from "../components/navbar/navbar"
import Footer from "../components/footer/footer"

import NameSplash from "../components/sections/namesplash"
import AboutSection from "../components/sections/about"
import ExperienceSection from "../components/sections/experience"
import ProjectsSection from "../components/sections/projects"
import ContactSection from "../components/sections/contact"

import '../styles/index.css'

import States from "../types/states"

const IndexPage: React.FC<PageProps> = () => {
  const [section, setSection] = React.useState<States.section>("namesplash")

  return (
    <body>
      <NameSplash />
      <Navbar props={{section: section, setSection: setSection}}/>
      <main>
        <AboutSection />
        <ExperienceSection />
        <ProjectsSection />
        <ContactSection />
      </main>
      <Footer />
    </body>
  )
}

export default IndexPage

export const Head: HeadFC = () => <title>Home Page</title>
