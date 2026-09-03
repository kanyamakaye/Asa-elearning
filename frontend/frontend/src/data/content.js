import {
  IconBriefcase,
  IconCalculator,
  IconCode,
  IconDatabase,
  IconGlobe,
  IconLaptop,
  IconMegaphone,
  IconTarget,
} from '../components/icons'

export const categories = [
  {
    id: 'it',
    name: 'Information Technology',
    icon: IconLaptop,
    count: 5,
    color: 'bg-navy-900',
    hex: '0a1440',
    image: 'https://images.pexels.com/photos/1181354/pexels-photo-1181354.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'dev',
    name: 'Software Development',
    icon: IconCode,
    count: 5,
    color: 'bg-brand-600',
    hex: '1d4fd8',
    image: 'https://images.pexels.com/photos/5483075/pexels-photo-5483075.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'data',
    name: 'Data Science',
    icon: IconDatabase,
    count: 5,
    color: 'bg-navy-700',
    hex: '142a6b',
    image: 'https://images.pexels.com/photos/6770610/pexels-photo-6770610.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'business',
    name: 'Business',
    icon: IconBriefcase,
    count: 5,
    color: 'bg-brand-500',
    hex: '2f5fff',
    image: 'https://images.pexels.com/photos/3862127/pexels-photo-3862127.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'accounting',
    name: 'Accounting',
    icon: IconCalculator,
    count: 5,
    color: 'bg-navy-800',
    hex: '0d1b4c',
    image: 'https://images.pexels.com/photos/6694492/pexels-photo-6694492.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'marketing',
    name: 'Digital Marketing',
    icon: IconMegaphone,
    count: 5,
    color: 'bg-brand-400',
    hex: '3b6bff',
    image: 'https://images.pexels.com/photos/267350/pexels-photo-267350.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'languages',
    name: 'Languages',
    icon: IconGlobe,
    count: 5,
    color: 'bg-navy-600',
    hex: '1c3a8f',
    image: 'https://images.pexels.com/photos/7583443/pexels-photo-7583443.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
  {
    id: 'pd',
    name: 'Professional Development',
    icon: IconTarget,
    count: 5,
    color: 'bg-navy-950',
    hex: '050b1f',
    image: 'https://images.pexels.com/photos/8348624/pexels-photo-8348624.jpeg?auto=compress&cs=tinysrgb&w=600',
  },
]

export const instructors = [
  {
    name: 'Grace Mwangi',
    initials: 'GM',
    title: 'Senior Full-Stack Engineer',
    students: '12.4k',
    courses: 8,
    rating: '4.9',
    image: 'https://images.pexels.com/photos/29852895/pexels-photo-29852895.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    name: 'Daniel Osei',
    initials: 'DO',
    title: 'Data Science Lead',
    students: '9.1k',
    courses: 6,
    rating: '4.8',
    image: 'https://images.pexels.com/photos/30767572/pexels-photo-30767572.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    name: 'Amara Bello',
    initials: 'AB',
    title: 'Digital Marketing Strategist',
    students: '15.8k',
    courses: 5,
    rating: '4.7',
    image: 'https://images.pexels.com/photos/34381970/pexels-photo-34381970.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    name: 'Samuel Kato',
    initials: 'SK',
    title: 'Cloud & DevOps Architect',
    students: '6.3k',
    courses: 4,
    rating: '4.9',
    image: 'https://images.pexels.com/photos/30004312/pexels-photo-30004312.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
]

// title, level, duration (hours), lessons, rating, reviews, students, price ('Free' or '$xx'), badge
const rows = {
  it: [
    ['Cloud Infrastructure & DevOps Essentials', 'Advanced', '26h 30m', 91, '4.9', '610', '1.8k', '$69', 'New', 'Samuel Kato', 'SK'],
    ['Cybersecurity Fundamentals for IT Professionals', 'Beginner', '10h 15m', 38, '4.7', '1.3k', '5.9k', 'Free', 'Free', 'Wanjiru Kamau', 'WK'],
    ['Networking & System Administration Basics', 'Beginner', '13h 40m', 47, '4.6', '520', '2.4k', '$39', null, 'Samuel Kato', 'SK'],
    ['IT Service Management with ITIL', 'Intermediate', '9h 00m', 30, '4.5', '290', '1.1k', '$45', null, 'Wanjiru Kamau', 'WK'],
    ['Introduction to Linux Server Administration', 'Intermediate', '15h 20m', 52, '4.8', '740', '3.0k', '$49', 'Bestseller', 'Samuel Kato', 'SK'],
  ],
  dev: [
    ['Full-Stack Web Development with React & Django', 'Beginner', '18h 40m', 64, '4.9', '1.2k', '3.2k', '$49', 'Bestseller', 'Grace Mwangi', 'GM'],
    ['Mobile App Development with React Native', 'Intermediate', '20h 00m', 70, '4.7', '520', '1.4k', '$54', 'New', 'Grace Mwangi', 'GM'],
    ['Python Programming from Zero to Hero', 'Beginner', '16h 10m', 58, '4.8', '2.4k', '8.1k', 'Free', 'Free', 'Ibrahim Musa', 'IM'],
    ['Advanced JavaScript & Modern ES6+', 'Intermediate', '12h 45m', 44, '4.8', '910', '2.7k', '$44', null, 'Ibrahim Musa', 'IM'],
    ['RESTful API Design with Node.js', 'Intermediate', '11h 30m', 39, '4.6', '380', '1.6k', '$42', null, 'Grace Mwangi', 'GM'],
  ],
  data: [
    ['Practical Machine Learning with Python', 'Intermediate', '22h 10m', 78, '4.8', '940', '2.6k', '$59', null, 'Daniel Osei', 'DO'],
    ['SQL & Data Analysis for Absolute Beginners', 'Beginner', '7h 30m', 26, '4.8', '1.9k', '6.7k', 'Free', 'Free', 'Daniel Osei', 'DO'],
    ['Data Visualization with Power BI', 'Beginner', '9h 50m', 33, '4.6', '410', '1.9k', '$35', null, 'Kwame Mensah', 'KM'],
    ['Deep Learning & Neural Networks Explained', 'Advanced', '24h 00m', 82, '4.9', '560', '1.2k', '$74', 'New', 'Kwame Mensah', 'KM'],
    ['Statistics for Data Science', 'Beginner', '10h 20m', 36, '4.7', '700', '2.8k', '$32', 'Bestseller', 'Daniel Osei', 'DO'],
  ],
  business: [
    ['Business Strategy & Planning Essentials', 'Beginner', '8h 15m', 29, '4.6', '480', '1.9k', '$35', null, 'Priya Anand', 'PA'],
    ['Project Management Fundamentals', 'Beginner', '10h 40m', 37, '4.8', '1.4k', '5.2k', '$45', 'Bestseller', 'Priya Anand', 'PA'],
    ['Entrepreneurship: From Idea to Launch', 'Intermediate', '13h 00m', 45, '4.7', '620', '2.1k', '$49', null, 'Victor Adeyemi', 'VA'],
    ['Business Communication Skills', 'Beginner', '6h 30m', 22, '4.6', '390', '2.4k', 'Free', 'Free', 'Victor Adeyemi', 'VA'],
    ['Supply Chain & Operations Management', 'Intermediate', '11h 50m', 40, '4.5', '260', '980', '$52', null, 'Priya Anand', 'PA'],
  ],
  accounting: [
    ['Financial Accounting for Beginners', 'Beginner', '11h 05m', 40, '4.6', '780', '2.9k', 'Free', 'Free', 'Lydia Chen', 'LC'],
    ['Managerial Accounting Essentials', 'Intermediate', '9h 30m', 33, '4.5', '310', '1.3k', '$39', null, 'Lydia Chen', 'LC'],
    ['Introduction to Bookkeeping', 'Beginner', '6h 45m', 24, '4.7', '540', '2.6k', '$25', null, 'Ana Ferreira', 'AF'],
    ['Taxation Principles & Practice', 'Intermediate', '10h 15m', 35, '4.6', '270', '1.0k', '$42', null, 'Ana Ferreira', 'AF'],
    ['Financial Statement Analysis', 'Advanced', '14h 20m', 48, '4.8', '390', '1.1k', '$56', 'New', 'Lydia Chen', 'LC'],
  ],
  marketing: [
    ['Digital Marketing Fundamentals', 'Beginner', '9h 15m', 32, '4.7', '2.1k', '4.1k', 'Free', 'Free', 'Amara Bello', 'AB'],
    ['Search Engine Optimization (SEO) Mastery', 'Intermediate', '12h 00m', 41, '4.8', '870', '2.5k', '$44', 'Bestseller', 'Amara Bello', 'AB'],
    ['Social Media Marketing Strategy', 'Beginner', '8h 40m', 30, '4.6', '650', '3.0k', '$32', null, 'Noah Bekele', 'NB'],
    ['Content Marketing & Copywriting', 'Beginner', '7h 20m', 27, '4.7', '480', '1.8k', '$29', null, 'Noah Bekele', 'NB'],
    ['Google Ads & PPC Advertising', 'Intermediate', '10h 50m', 36, '4.6', '320', '1.2k', '$47', null, 'Amara Bello', 'AB'],
  ],
  languages: [
    ['Conversational French for Travel & Work', 'Beginner', '14h 20m', 55, '4.8', '1.5k', '5.3k', '$29', 'Bestseller', 'Marc Dubois', 'MD'],
    ['Business English Communication', 'Intermediate', '9h 00m', 31, '4.7', '980', '4.4k', '$27', null, 'Sophie Laurent', 'SL'],
    ['Spanish for Beginners', 'Beginner', '12h 30m', 46, '4.8', '2.0k', '7.6k', 'Free', 'Free', 'Sophie Laurent', 'SL'],
    ['Mandarin Chinese Essentials', 'Beginner', '13h 10m', 48, '4.6', '410', '1.7k', '$34', null, 'Marc Dubois', 'MD'],
    ['German Language Foundations', 'Beginner', '11h 45m', 42, '4.6', '360', '1.5k', '$31', null, 'Sophie Laurent', 'SL'],
  ],
  pd: [
    ['Leadership & Team Management Skills', 'Intermediate', '8h 45m', 28, '4.9', '860', '2.2k', '$39', null, 'Fatima Njoroge', 'FN'],
    ['Public Speaking & Presentation Skills', 'Beginner', '6h 10m', 21, '4.8', '1.1k', '3.8k', 'Free', 'Free', 'Fatima Njoroge', 'FN'],
    ['Time Management & Productivity', 'Beginner', '5h 30m', 18, '4.7', '740', '3.1k', '$24', 'Bestseller', 'Chidi Okafor', 'CO'],
    ['Emotional Intelligence at Work', 'Beginner', '6h 50m', 23, '4.6', '410', '1.6k', '$27', null, 'Chidi Okafor', 'CO'],
    ['Negotiation Skills for Professionals', 'Intermediate', '7h 40m', 25, '4.7', '330', '1.2k', '$36', null, 'Fatima Njoroge', 'FN'],
  ],
}

let nextId = 1
export const courses = Object.entries(rows).flatMap(([categoryId, list]) =>
  list.map(
    ([title, level, duration, lessons, rating, reviews, students, price, badge, instructor, initials]) => ({
      id: nextId++,
      categoryId,
      title,
      level,
      duration,
      lessons,
      rating,
      reviews,
      students,
      price,
      badge,
      instructor,
      initials,
    }),
  ),
)

export const testimonials = [
  {
    quote:
      'Asa Academy made it possible for me to learn web development while working full time. The live classes and progress tracking kept me accountable.',
    name: 'Naledi Dube',
    role: 'Student, Software Development',
    initials: 'ND',
  },
  {
    quote:
      'As an instructor, the grading and analytics tools save me hours every week. I can see exactly where my students need help.',
    name: 'Peter Achebe',
    role: 'Instructor, Data Science',
    initials: 'PA',
  },
  {
    quote:
      'The certificate I earned was verifiable and helped me land my first data analyst role within a month of finishing the course.',
    name: 'Rita Owusu',
    role: 'Student, Data Science',
    initials: 'RO',
  },
  {
    quote:
      'I switched careers into digital marketing after two Asa Academy courses. The step-by-step lessons and quizzes made it click fast.',
    name: 'Tariq Hassan',
    role: 'Student, Business',
    initials: 'TH',
  },
  {
    quote:
      'The discussion forums are genuinely active. I got my assignment questions answered by instructors within hours, not days.',
    name: 'Chidinma Eze',
    role: 'Student, Accounting',
    initials: 'CE',
  },
  {
    quote:
      'Publishing my course was simple, and the built-in payments meant I could start earning from my expertise in the same week.',
    name: 'Marc Dubois',
    role: 'Instructor, Languages',
    initials: 'MD',
  },
]

export const faqs = [
  {
    q: 'Is Asa Academy free to use?',
    a: 'Creating an account and browsing the course catalog is completely free. Many courses are free, while others are paid and priced individually by their instructors.',
  },
  {
    q: 'Will I receive a certificate after completing a course?',
    a: 'Yes. Once you meet a course’s completion requirements, Asa Academy issues a certificate with a unique verification code you can share with employers.',
  },
  {
    q: 'Can I learn at my own pace?',
    a: 'Absolutely. Most courses are self-paced, though some include scheduled live classes you can join or catch later via recordings.',
  },
  {
    q: 'How do I become an instructor?',
    a: 'Sign up for an instructor account, complete your profile, and submit your first course for review. Once approved, you can publish and start teaching.',
  },
  {
    q: 'Can I access Asa Academy on my phone?',
    a: 'Yes, the platform is fully responsive and works in any mobile browser, so you can learn from your phone, tablet, or laptop.',
  },
  {
    q: 'What payment methods are supported?',
    a: 'We support major cards and mobile money for paid courses. All transactions are processed securely and refunds follow each course’s policy.',
  },
]
