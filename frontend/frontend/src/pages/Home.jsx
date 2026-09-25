import CareerOutcomes from '../components/CareerOutcomes'
import CategoryExplorer from '../components/CategoryExplorer'
import Courses from '../components/Courses'
import CTA from '../components/CTA'
import FAQ from '../components/FAQ'
import Features from '../components/Features'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import InstructorCTA from '../components/InstructorCTA'
import Instructors from '../components/Instructors'
import LearningPaths from '../components/LearningPaths'
import Pricing from '../components/Pricing'
import Testimonials from '../components/Testimonials'
import TrustStrip from '../components/TrustStrip'
import StudentPortal from '../components/StudentPortal'
import Reveal from '../components/ui/Reveal'

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Reveal><CategoryExplorer /></Reveal>
      <Reveal><Features /></Reveal>
      <Reveal><HowItWorks /></Reveal>
      <Reveal><Courses /></Reveal>
      <Reveal><LearningPaths /></Reveal>
      <Reveal><CareerOutcomes /></Reveal>
      <Reveal><StudentPortal /></Reveal>
      <Reveal><Testimonials /></Reveal>
      <Reveal><Instructors /></Reveal>
      <Reveal><InstructorCTA /></Reveal>
      <Reveal><Pricing /></Reveal>
      <Reveal><FAQ /></Reveal>
      <Reveal><CTA /></Reveal>
    </>
  )
}
