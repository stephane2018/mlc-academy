import { useState } from 'react'
import { createFileRoute, Link, useParams } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  X,
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Hand,
  ScreenShare,
  MessageSquare,
  Send,
  Quiz,
  Check,
  Volume2,
  Maximize,
  GraduationCap,
} from '@/components/icons'
import { Math as Maths } from '@/components/math'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { liveSessions, liveChat, profStudents, quizQuestions, type LiveChatMsg } from '@/lib/mock'

export const Route = createFileRoute('/eleve/salle/$id')({
  component: SallePage,
})

type Tab = 'chat' | 'quiz'

const ELAPSED = '12:34'
const STUDENT_PSEUDO = 'MaxLeBg'

function SallePage() {
  const { id } = useParams({ from: '/eleve/salle/$id' })
  const session = liveSessions.find((s) => s.id === id)

  if (!session) {
    return (
      <div className="grid min-h-dvh place-items-center bg-slate-950 px-6 text-center text-white">
        <div className="space-y-4">
          <p className="text-lg font-semibold">Séance introuvable</p>
          <p className="text-sm text-white/60">Cette salle n'existe pas ou est terminée.</p>
          <Button asChild className="rounded-xl">
            <Link to="/eleve/live">Retour aux cours live</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col bg-slate-950 text-white">
      {/* Barre haut */}
      <header className="flex items-center gap-3 border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-heading text-sm font-bold sm:text-base">{session.title}</h1>
          <p className="truncate text-xs text-white/50">{session.group} · {session.teacher}</p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-bold text-red-400">
          <span className="size-1.5 animate-pulse rounded-full bg-red-500" />
          En direct · {ELAPSED}
        </span>
        <Button
          asChild
          size="sm"
          variant="ghost"
          className="shrink-0 rounded-full text-white/70 hover:bg-white/10 hover:text-white"
        >
          <Link to="/eleve/live">
            <X className="size-4" /> Quitter
          </Link>
        </Button>
      </header>

      {/* Corps : scène + panneau */}
      <div className="flex flex-1 flex-col gap-4 p-4 sm:p-6 xl:flex-row">
        <Stage />
        <SidePanel />
      </div>

      {/* Barre de contrôle bas */}
      <ControlBar />
    </div>
  )
}

/* ----------------------------- Scène vidéo ----------------------------- */

function Stage() {
  const participants = profStudents

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-3">
      {/* Partage d'écran du prof */}
      <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-slate-900 ring-1 ring-white/10">
        <div className="absolute inset-0 grid place-items-center">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-white/15 backdrop-blur">
              <ScreenShare className="size-7 text-white" />
            </span>
            <div>
              <p className="font-heading text-lg font-bold">M. Minko</p>
              <p className="text-sm text-white/70">partage son écran</p>
            </div>
          </div>
        </div>
        {/* Badge "parle" */}
        <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 text-xs font-semibold backdrop-blur">
          <Volume2 className="size-3.5 text-teal" /> M. Minko parle
        </span>
        {/* Contrôles vidéo factices */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          <button
            type="button"
            className="grid size-8 place-items-center rounded-lg bg-black/40 text-white/80 backdrop-blur transition hover:bg-black/60"
            aria-label="Plein écran"
          >
            <Maximize className="size-4" />
          </button>
        </div>
      </div>

      {/* Vignettes participants */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 xl:grid-cols-4">
        {/* Le prof, en train de parler */}
        <Thumbnail avatar="👨‍🏫" pseudo="M. Minko" speaking teacher />
        {participants.map((p) => (
          <Thumbnail key={p.id} avatar={p.avatar} pseudo={p.pseudo} muted />
        ))}
      </div>
    </div>
  )
}

function Thumbnail({
  avatar,
  pseudo,
  muted,
  speaking,
  teacher,
}: {
  avatar: string
  pseudo: string
  muted?: boolean
  speaking?: boolean
  teacher?: boolean
}) {
  return (
    <div
      className={cn(
        'relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-slate-800 ring-1',
        speaking ? 'ring-2 ring-teal' : 'ring-white/10',
      )}
    >
      <span className="text-2xl">{avatar}</span>
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent px-1.5 py-1">
        <span className="truncate text-[10px] font-medium text-white/90">
          {teacher && <GraduationCap className="mr-0.5 inline size-3 text-teal" />}
          {pseudo}
        </span>
        {speaking ? (
          <Mic className="size-3 shrink-0 text-teal" />
        ) : muted ? (
          <MicOff className="size-3 shrink-0 text-white/50" />
        ) : null}
      </div>
    </div>
  )
}

/* --------------------------- Panneau latéral --------------------------- */

function SidePanel() {
  const [tab, setTab] = useState<Tab>('chat')

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl bg-slate-900 ring-1 ring-white/10 xl:w-[360px] xl:shrink-0">
      {/* Onglets */}
      <div className="flex shrink-0 gap-1 border-b border-white/10 p-1.5">
        <TabButton active={tab === 'chat'} onClick={() => setTab('chat')} icon={<MessageSquare className="size-4" />}>
          Chat
        </TabButton>
        <TabButton active={tab === 'quiz'} onClick={() => setTab('quiz')} icon={<Quiz className="size-4" />}>
          Quiz
        </TabButton>
      </div>

      {tab === 'chat' ? <ChatPanel /> : <QuizPanel />}
    </div>
  )
}

function TabButton({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition',
        active ? 'bg-white/10 text-white' : 'text-white/50 hover:bg-white/5 hover:text-white/80',
      )}
    >
      {icon}
      {children}
    </button>
  )
}

/* ------------------------------- Chat ---------------------------------- */

function ChatPanel() {
  const [messages, setMessages] = useState<LiveChatMsg[]>(liveChat)
  const [draft, setDraft] = useState('')

  function send(e: React.FormEvent) {
    e.preventDefault()
    const text = draft.trim()
    if (!text) return
    setMessages((m) => [
      ...m,
      {
        id: `me-${m.length}`,
        pseudo: STUDENT_PSEUDO,
        avatar: '🤖',
        text,
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      },
    ])
    setDraft('')
  }

  return (
    <div className="flex min-h-[22rem] flex-1 flex-col xl:min-h-0">
      <div className="flex-1 space-y-3 overflow-y-auto p-3.5">
        {messages.map((m) => {
          const isMe = m.pseudo === STUDENT_PSEUDO
          return (
            <div key={m.id} className="flex gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-full bg-white/10 text-base">
                {m.avatar}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-baseline gap-2">
                  <span className={cn('truncate text-xs font-semibold', isMe ? 'text-teal' : 'text-white/90')}>
                    {m.pseudo}
                  </span>
                  <span className="shrink-0 text-[10px] text-white/40">{m.time}</span>
                </p>
                <p className="text-sm text-white/80">{m.text}</p>
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={send} className="flex shrink-0 items-center gap-2 border-t border-white/10 p-2.5">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Écris un message…"
          className="min-w-0 flex-1 rounded-xl bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:bg-white/10 focus:outline-none"
        />
        <Button type="submit" size="icon" disabled={!draft.trim()} className="shrink-0 rounded-xl">
          <Send className="size-4" />
        </Button>
      </form>
    </div>
  )
}

/* ------------------------------- Quiz ---------------------------------- */

function QuizPanel() {
  const q = quizQuestions[0]
  const [selected, setSelected] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  return (
    <div className="flex min-h-[22rem] flex-1 flex-col gap-3 overflow-y-auto p-3.5 xl:min-h-0">
      <div className="rounded-xl bg-white/5 p-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-teal">
          Quiz en direct · {q.domain}
        </p>
        <p className="mt-2 text-sm font-medium leading-relaxed">{q.prompt}</p>
        {q.katex && (
          <div className="mt-3 rounded-lg bg-white/5 py-3 text-center text-lg text-white">
            <Maths expr={q.katex} display />
          </div>
        )}
      </div>

      <div className="space-y-2">
        {q.options.map((opt, i) => {
          const letter = String.fromCharCode(65 + i)
          const isSel = selected === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              disabled={sent}
              onClick={() => setSelected(opt.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border-2 p-2.5 text-left text-sm transition',
                isSel ? 'border-teal bg-teal/10' : 'border-white/10 hover:border-white/30',
                sent && !isSel && 'opacity-50',
              )}
            >
              <span
                className={cn(
                  'grid size-7 shrink-0 place-items-center rounded-lg text-xs font-bold',
                  isSel ? 'bg-teal text-white' : 'bg-white/10 text-white/60',
                )}
              >
                {letter}
              </span>
              <span className="font-semibold">{opt.label}</span>
            </button>
          )
        })}
      </div>

      {sent ? (
        <div className="flex items-center gap-2 rounded-xl bg-teal/15 px-3 py-2.5 text-sm font-semibold text-teal">
          <Check className="size-4" /> Réponse envoyée — le prof la voit en direct.
        </div>
      ) : (
        <Button
          disabled={!selected}
          onClick={() => {
            setSent(true)
            toast.success('Réponse envoyée au prof')
          }}
          className="mt-auto w-full rounded-xl"
        >
          Envoyer ma réponse
        </Button>
      )}
    </div>
  )
}

/* -------------------------- Barre de contrôle -------------------------- */

function ControlBar() {
  const [micOn, setMicOn] = useState(false)
  const [camOn, setCamOn] = useState(false)
  const [handUp, setHandUp] = useState(false)

  function toggleHand() {
    setHandUp((h) => {
      const next = !h
      toast(next ? 'Main levée ✋' : 'Main baissée')
      return next
    })
  }

  return (
    <footer className="border-t border-white/10 bg-slate-950/95 px-4 py-3 backdrop-blur sm:px-6">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-2">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          <ControlButton
            active={micOn}
            onClick={() => setMicOn((v) => !v)}
            label={micOn ? 'Micro' : 'Micro coupé'}
          >
            {micOn ? <Mic className="size-5" /> : <MicOff className="size-5" />}
          </ControlButton>
          <ControlButton
            active={camOn}
            onClick={() => setCamOn((v) => !v)}
            label={camOn ? 'Caméra' : 'Caméra coupée'}
          >
            {camOn ? <Camera className="size-5" /> : <CameraOff className="size-5" />}
          </ControlButton>
          <ControlButton active={handUp} onClick={toggleHand} highlight={handUp} label="Lever la main">
            <Hand className="size-5" />
          </ControlButton>
          <Button asChild variant="destructive" className="rounded-full px-4">
            <Link to="/eleve/live">
              <X className="size-4" /> Quitter
            </Link>
          </Button>
        </div>
        <p className="text-center text-[11px] text-white/40">
          Micro coupé par défaut — lève la main pour prendre la parole.
        </p>
      </div>
    </footer>
  )
}

function ControlButton({
  active,
  highlight,
  onClick,
  label,
  children,
}: {
  active?: boolean
  highlight?: boolean
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={label}
      className={cn(
        'grid size-11 place-items-center rounded-full transition',
        highlight
          ? 'bg-amber text-amber-foreground'
          : active
            ? 'bg-white/15 text-white'
            : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white',
      )}
    >
      {children}
    </button>
  )
}
