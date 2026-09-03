import Categories from '../components/Categories'
import Courses from '../components/Courses'
import CTA from '../components/CTA'
import FAQ from '../components/FAQ'
import Features from '../components/Features'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import InstructorCTA from '../components/InstructorCTA'
import Instructors from '../components/Instructors'
import Testimonials from '../components/Testimonials'
import TrustStrip from '../components/TrustStrip'

export default function Home() {
  return (
    <>
      <Hero />
      <TrustStrip />
      <Features />
      <Categories />
      <Courses />
      <Instructors />
      <HowItWorks />
      <InstructorCTA />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  )
}
