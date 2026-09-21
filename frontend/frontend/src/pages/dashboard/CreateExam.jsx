import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { createExam } from '../../lib/dashboardApi'
import useCourseOptions from '../../hooks/useCourseOptions'
import ExamForm, { EMPTY_EXAM_FORM } from '../../components/dashboard/ExamForm'
import Alert from '../../components/ui/Alert'
import Breadcrumb from '../../components/ui/Breadcrumb'
import Card from '../../components/ui/Card'
import PageHeader from '../../components/ui/PageHeader'

export default function CreateExam() {
  const navigate = useNavigate()
  const { accessToken } = useAuth()
  const { courses } = useCourseOptions()
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSave(form) {
    setSaving(true)
    try {
      // DRF's Date/TimeField reject an empty string outright (unlike a
      // missing key) — these are all optional, so blank out to null instead.
      const payload = {
        ...form,
        exam_date: form.exam_date || null,
        start_time: form.start_time || null,
        end_time: form.end_time || null,
      }
      await createExam(payload, accessToken)
      setSuccess(true)
      setTimeout(() => navigate('/dashboard/exams'), 1200)
    } finally {
      setSaving(false)
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl py-16">
        <Alert tone="success" title="Exam scheduled successfully.">Redirecting…</Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader
        breadcrumb={
          <Breadcrumb
            items={[
              { label: 'Dashboard', to: '/dashboard' },
              { label: 'Exams', to: '/dashboard/exams' },
              { label: 'Schedule Exam' },
            ]}
          />
        }
        title="Schedule Exam"
        description="Set up a new exam for a course, including timing and grading."
      />

      <Card title="Exam Details">
        <ExamForm
          initial={EMPTY_EXAM_FORM}
          courses={courses}
          onSave={handleSave}
          onCancel={() => navigate('/dashboard/exams')}
          saving={saving}
          submitLabel="Schedule Exam"
        />
      </Card>
    </div>
  )
}
