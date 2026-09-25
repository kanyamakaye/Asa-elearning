import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { getExam } from '../../lib/dashboardApi'
import QuizPlayer from '../../components/QuizPlayer'
import Alert from '../../components/ui/Alert'
import Breadcrumb from '../../components/ui/Breadcrumb'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import PageHeader from '../../components/ui/PageHeader'

export default function TakeExam() {
  const { id } = useParams()
  const { accessToken } = useAuth()
  const { t } = useLanguage()
  const [exam, setExam] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getExam(id, accessToken)
      .then((data) => !cancelled && setExam(data))
      .catch((err) => !cancelled && setError(err.message))
      .finally(() => !cancelled && setLoading(false))
    return () => { cancelled = true }
  }, [id, accessToken])

  if (loading) return <LoadingSpinner label={t('dashboardStudent.takeExam.loading')} />
  if (error || !exam) return <Alert tone="error">{error || t('dashboardStudent.takeExam.unavailable')}</Alert>

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumb={<Breadcrumb items={[{ label: t('dashboardStudent.takeExam.breadcrumbDashboard'), to: '/dashboard' }, { label: t('dashboardStudent.takeExam.breadcrumbExams'), to: '/dashboard/exams' }, { label: exam.title }]} />}
      />
      <QuizPlayer quiz={exam} accessToken={accessToken} kind="exam" />
    </div>
  )
}
