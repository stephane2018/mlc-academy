import { createFileRoute, Link } from '@tanstack/react-router'
import { Loader } from '@/components/icons'
import { QuestionFormPage } from '@/components/admin/question-form'
import { useQuestion } from '@/hooks/use-questions'

export const Route = createFileRoute('/admin/questions/$questionId')({
  component: EditQuestionPage,
})

function EditQuestionPage() {
  const { questionId } = Route.useParams()
  const { data, isLoading, isError } = useQuestion(questionId)

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-sm text-muted-foreground">
        <Loader className="mr-2 size-5 animate-spin" /> Chargement de la question…
      </div>
    )
  }
  if (isError || !data) {
    return (
      <div className="space-y-4 py-10 text-center">
        <p className="text-sm text-destructive">Question introuvable.</p>
        <Link to="/admin/questions" className="text-sm font-semibold text-brand hover:underline">
          ← Retour aux questions
        </Link>
      </div>
    )
  }

  return <QuestionFormPage question={data} />
}
