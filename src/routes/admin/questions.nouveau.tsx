import { createFileRoute } from '@tanstack/react-router'
import { QuestionFormPage } from '@/components/admin/question-form'

export const Route = createFileRoute('/admin/questions/nouveau')({
  component: () => <QuestionFormPage />,
})
