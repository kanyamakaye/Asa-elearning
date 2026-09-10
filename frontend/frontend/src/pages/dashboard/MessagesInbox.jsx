import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {
  getConversationMessages,
  listConversations,
  markConversationRead,
  sendConversationMessage,
} from '../../lib/dashboardApi'
import { MESSAGES_CHANGED_EVENT } from '../../hooks/useUnreadMessages'
import { Avatar, ROLE_LABELS } from '../../components/dashboard/NewConversationModal'
import NewConversationModal from '../../components/dashboard/NewConversationModal'
import { IconArrowRight, IconChat, IconChevronLeft, IconPlus, IconSearch } from '../../components/icons'

function isSameDay(a, b) {
  return a.toDateString() === b.toDateString()
}

function formatMessageTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function formatConversationTime(iso) {
  const date = new Date(iso)
  const now = new Date()
  if (isSameDay(date, now)) return formatMessageTime(iso)
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (isSameDay(date, yesterday)) return 'Yesterday'
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function ConversationListItem({ conversation, active, onClick }) {
  const other = conversation.other_participants?.[0]
  const unread = conversation.unread_count > 0
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'true' : undefined}
      className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition-colors ${
        active ? 'bg-brand-50' : 'hover:bg-navy-50/70'
      }`}
    >
      <Avatar user={other ?? {}} size="h-11 w-11" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className={`truncate text-sm ${unread ? 'font-bold text-navy-900' : 'font-semibold text-navy-800'}`}>
            {other?.full_name ?? 'Unknown user'}
          </p>
          <span className="shrink-0 text-[11px] text-navy-700/45">
            {conversation.last_message ? formatConversationTime(conversation.last_message.created_at) : ''}
          </span>
        </div>
        <p className="text-[11px] font-medium uppercase tracking-wide text-navy-700/40">
          {ROLE_LABELS[other?.user_type] ?? other?.user_type}
        </p>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className={`truncate text-xs ${unread ? 'font-semibold text-navy-800' : 'text-navy-700/55'}`}>
            {conversation.last_message?.content ?? 'No messages yet'}
          </p>
          {unread && (
            <span className="flex h-5 min-w-[1.25rem] shrink-0 items-center justify-center rounded-full bg-brand-500 px-1.5 text-[10px] font-bold text-white">
              {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

function MessageBubble({ message, isOwn }) {
  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isOwn ? 'bg-navy-900 text-white' : 'bg-navy-50 text-navy-800'
        }`}
      >
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
        <p className={`mt-1 text-[10px] ${isOwn ? 'text-white/50' : 'text-navy-700/40'}`}>
          {formatMessageTime(message.created_at)}
        </p>
      </div>
    </div>
  )
}

export default function MessagesInbox() {
  const { accessToken, user } = useAuth()

  const [conversations, setConversations] = useState([])
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [conversationsError, setConversationsError] = useState('')
  const [query, setQuery] = useState('')
  const [search, setSearch] = useState('')

  const [activeConversation, setActiveConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [messagesError, setMessagesError] = useState('')
  const [hasMoreOlder, setHasMoreOlder] = useState(false)
  const [loadingOlder, setLoadingOlder] = useState(false)

  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

  const [newMessageOpen, setNewMessageOpen] = useState(false)

  const messagesContainerRef = useRef(null)
  const shouldScrollToBottomRef = useRef(false)

  // -- Conversation list ---------------------------------------------------

  useEffect(() => {
    const timer = setTimeout(() => setSearch(query), 300)
    return () => clearTimeout(timer)
  }, [query])

  function loadConversations() {
    setConversationsLoading(true)
    setConversationsError('')
    return listConversations(accessToken, search ? { search } : {})
      .then((data) => setConversations(data.results ?? data))
      .catch((err) => setConversationsError(err.message || 'Unable to load your conversations.'))
      .finally(() => setConversationsLoading(false))
  }

  useEffect(() => {
    loadConversations()
  }, [accessToken, search]) // eslint-disable-line react-hooks/exhaustive-deps

  // -- Active conversation's messages --------------------------------------

  function openConversation(conversation) {
    setActiveConversation(conversation)
    setSendError('')
    setDraft('')
  }

  useEffect(() => {
    if (!activeConversation) return
    let cancelled = false
    setMessagesLoading(true)
    setMessagesError('')
    getConversationMessages(activeConversation.id, accessToken)
      .then((data) => {
        if (cancelled) return
        setMessages(data.results)
        setHasMoreOlder(data.has_more)
        shouldScrollToBottomRef.current = true
      })
      .catch((err) => !cancelled && setMessagesError(err.message || 'Unable to load this conversation.'))
      .finally(() => !cancelled && setMessagesLoading(false))

    // Opening a conversation marks it read — updates this user's unread
    // count in the backend and the sidebar badge (Messages spec §12).
    markConversationRead(activeConversation.id, accessToken)
      .then(() => {
        if (cancelled) return
        setConversations((prev) => prev.map((c) => (c.id === activeConversation.id ? { ...c, unread_count: 0 } : c)))
        window.dispatchEvent(new Event(MESSAGES_CHANGED_EVENT))
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [activeConversation?.id, accessToken]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!shouldScrollToBottomRef.current) return
    const el = messagesContainerRef.current
    if (el) el.scrollTop = el.scrollHeight
    shouldScrollToBottomRef.current = false
  }, [messages])

  function loadOlderMessages() {
    if (!activeConversation || loadingOlder || messages.length === 0) return
    const el = messagesContainerRef.current
    const previousScrollHeight = el?.scrollHeight ?? 0
    const previousScrollTop = el?.scrollTop ?? 0

    setLoadingOlder(true)
    getConversationMessages(activeConversation.id, accessToken, { before: messages[0].id })
      .then((data) => {
        setMessages((prev) => [...data.results, ...prev])
        setHasMoreOlder(data.has_more)
        // Keep the reader anchored on what they were looking at instead of
        // jumping to the newest message (Messages spec §18).
        requestAnimationFrame(() => {
          const newEl = messagesContainerRef.current
          if (newEl) newEl.scrollTop = newEl.scrollHeight - previousScrollHeight + previousScrollTop
        })
      })
      .catch(() => {})
      .finally(() => setLoadingOlder(false))
  }

  function handleScroll() {
    const el = messagesContainerRef.current
    if (el && el.scrollTop < 80 && hasMoreOlder && !loadingOlder) {
      loadOlderMessages()
    }
  }

  // -- Sending --------------------------------------------------------------

  async function handleSend(e) {
    e?.preventDefault()
    const content = draft.trim()
    if (!content || sending || !activeConversation) return
    setSending(true)
    setSendError('')
    try {
      const message = await sendConversationMessage(activeConversation.id, content, accessToken)
      setMessages((prev) => [...prev, message])
      shouldScrollToBottomRef.current = true
      setDraft('')
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === activeConversation.id ? { ...c, last_message: { content, created_at: message.created_at, sender_id: user.id } } : c,
        )
        const moved = updated.find((c) => c.id === activeConversation.id)
        return moved ? [moved, ...updated.filter((c) => c.id !== activeConversation.id)] : updated
      })
      window.dispatchEvent(new Event(MESSAGES_CHANGED_EVENT))
    } catch (err) {
      // Keep the draft so the student/instructor doesn't have to retype it.
      setSendError(err.message || 'Message could not be sent.')
    } finally {
      setSending(false)
    }
  }

  function handleComposerKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  function handleCreated(conversation) {
    setNewMessageOpen(false)
    setConversations((prev) => {
      const exists = prev.some((c) => c.id === conversation.id)
      return exists ? prev.map((c) => (c.id === conversation.id ? conversation : c)) : [conversation, ...prev]
    })
    openConversation(conversation)
    window.dispatchEvent(new Event(MESSAGES_CHANGED_EVENT))
  }

  const otherParticipant = activeConversation?.other_participants?.[0]

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col overflow-hidden rounded-2xl bg-white ring-1 ring-navy-900/8 lg:flex-row">
      {/* Conversation list — hidden on mobile once a conversation is open */}
      <div className={`flex w-full flex-col border-r border-navy-900/8 lg:w-80 lg:shrink-0 ${activeConversation ? 'hidden lg:flex' : 'flex'}`}>
        <div className="flex items-center justify-between gap-2 border-b border-navy-900/8 px-4 py-3.5">
          <h1 className="text-base font-bold text-navy-900">Messages</h1>
          <button
            type="button"
            onClick={() => setNewMessageOpen(true)}
            aria-label="New message"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-900 text-white hover:bg-brand-500"
          >
            <IconPlus className="h-4 w-4" />
          </button>
        </div>

        <div className="px-4 py-3">
          <div className="relative">
            <IconSearch className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-700/35" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search messages…"
              aria-label="Search conversations"
              className="w-full rounded-full border border-navy-900/10 bg-navy-50/40 py-2 pl-9 pr-3 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-3">
          {conversationsLoading ? (
            <div className="space-y-2 px-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-xl bg-navy-50" />
              ))}
            </div>
          ) : conversationsError ? (
            <div className="px-3 py-8 text-center">
              <p className="text-sm text-red-600">{conversationsError}</p>
              <button type="button" onClick={loadConversations} className="mt-2 text-xs font-semibold text-brand-500 hover:text-navy-900">
                Retry
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <IconChat className="mx-auto h-7 w-7 text-navy-700/25" />
              {search ? (
                <>
                  <p className="mt-3 text-sm font-semibold text-navy-800">No conversations found.</p>
                  <p className="mt-1 text-xs text-navy-700/50">Try another search term.</p>
                </>
              ) : (
                <>
                  <p className="mt-3 text-sm font-semibold text-navy-800">No messages yet</p>
                  <p className="mt-1 text-xs text-navy-700/50">Start a conversation with your instructor or support team.</p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-0.5">
              {conversations.map((c) => (
                <ConversationListItem
                  key={c.id}
                  conversation={c}
                  active={activeConversation?.id === c.id}
                  onClick={() => openConversation(c)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Conversation panel */}
      <div className={`flex min-w-0 flex-1 flex-col ${activeConversation ? 'flex' : 'hidden lg:flex'}`}>
        {!activeConversation ? (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <IconChat className="h-9 w-9 text-navy-700/20" />
            <p className="mt-3 text-sm font-semibold text-navy-700/60">Select a conversation to start reading.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 border-b border-navy-900/8 px-4 py-3.5">
              <button
                type="button"
                onClick={() => setActiveConversation(null)}
                aria-label="Back to conversations"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-navy-700/60 hover:bg-navy-50 lg:hidden"
              >
                <IconChevronLeft className="h-4 w-4" />
              </button>
              <Avatar user={otherParticipant ?? {}} size="h-9 w-9" />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-navy-900">{otherParticipant?.full_name ?? 'Unknown user'}</p>
                <p className="text-xs text-navy-700/50">{ROLE_LABELS[otherParticipant?.user_type] ?? otherParticipant?.user_type}</p>
              </div>
            </div>

            <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messagesLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`h-12 w-2/3 animate-pulse rounded-2xl bg-navy-50 ${i % 2 ? 'ml-auto' : ''}`} />
                  ))}
                </div>
              ) : messagesError ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <p className="text-sm text-red-600">{messagesError}</p>
                  <button
                    type="button"
                    onClick={() => setActiveConversation({ ...activeConversation })}
                    className="mt-2 text-xs font-semibold text-brand-500 hover:text-navy-900"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  {loadingOlder && <p className="py-1 text-center text-xs text-navy-700/40">Loading older messages…</p>}
                  {messages.map((m) => (
                    <MessageBubble key={m.id} message={m} isOwn={m.sender.id === user.id} />
                  ))}
                </>
              )}
            </div>

            <form onSubmit={handleSend} className="border-t border-navy-900/8 p-3">
              {sendError && (
                <div className="mb-2 flex items-center justify-between gap-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                  <span>{sendError}</span>
                  <button type="button" onClick={handleSend} className="shrink-0 font-semibold underline">
                    Retry
                  </button>
                </div>
              )}
              <div className="flex items-end gap-2">
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={handleComposerKeyDown}
                  rows={1}
                  placeholder="Type a message…"
                  aria-label="Type a message"
                  className="max-h-32 flex-1 resize-none rounded-2xl border border-navy-900/10 px-4 py-2.5 text-sm text-navy-900 placeholder:text-navy-700/35 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || sending}
                  aria-label="Send message"
                  className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-navy-900 px-4 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-50"
                >
                  {sending ? 'Sending…' : (
                    <>
                      Send <IconArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </>
        )}
      </div>

      <NewConversationModal open={newMessageOpen} onClose={() => setNewMessageOpen(false)} onCreated={handleCreated} />
    </div>
  )
}
