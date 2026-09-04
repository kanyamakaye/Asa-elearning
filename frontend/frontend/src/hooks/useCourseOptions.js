import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getCourses, getMyCourses } from '../services/courseService'

/** Instructors see only their own courses (matches backend ownership rules);
 * Admin/Academic Manager can manage any course, so they get the full list. */
export default function useCourseOptions() {
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const request = user?.user_type === 'instructor' ? getMyCourses() : getCourses({ page_size: 100 })
    request
      .then((data) => !cancelled && setCourses(data.results ?? data))
      .catch(() => {})
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [user?.user_type])

  return { courses, loading }
}
