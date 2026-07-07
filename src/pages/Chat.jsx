import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { chatApi } from '../api/chat';
import { unwrapList } from '../utils/unwrap';
import { extractErrorMessage } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

export default function Chat() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const scrollRef = useRef(null);

  const loadConversations = useCallback(() => {
    chatApi.listConversations()
      .then((res) => {
        const list = unwrapList(res).results;
        setConversations(list);
        const bookingParam = searchParams.get('booking');
        if (!activeId && list.length > 0) {
          const match = bookingParam ? list.find((c) => String(c.booking) === bookingParam) : null;
          setActiveId((match || list[0]).id);
        }
      })
      .catch((err) => showToast(extractErrorMessage(err), 'error'))
      .finally(() => setLoadingConvos(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { loadConversations(); }, [loadConversations]);

  const loadMessages = useCallback((silent) => {
    if (!activeId) return;
    if (!silent) setLoadingMessages(true);
    chatApi.listMessages(activeId)
      .then((res) => setMessages(unwrapList(res).results))
      .catch(() => {})
      .finally(() => setLoadingMessages(false));
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;
    loadMessages(false);
    chatApi.markRead(activeId).catch(() => {});
    const interval = setInterval(() => loadMessages(true), 4000);
    return () => clearInterval(interval);
  }, [activeId, loadMessages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const content = text;
    setText('');
    try {
      await chatApi.sendMessage({ conversation: activeId, content });
      loadMessages(true);
    } catch (err) {
      showToast(extractErrorMessage(err), 'error');
      setText(content);
    }
  };

  const activeConversation = conversations.find((c) => c.id === activeId);
  const otherParticipant = activeConversation?.participants?.find((p) => p.id !== user?.id);

  return (
    <div className="page-shell">
      <div className="container">
        <div className="page-header">
          <span className="eyebrow">Messages</span>
          <h1>Conversations</h1>
        </div>

        <div className="chat-shell card">
          <div className="chat-sidebar">
            {loadingConvos ? (
              <Loader label="Loading…" />
            ) : conversations.length === 0 ? (
              <EmptyState title="No conversations yet" message="Start a conversation from a booking." />
            ) : (
              conversations.map((c) => {
                const other = c.participants?.find((p) => p.id !== user?.id);
                return (
                  <button key={c.id} className={`chat-convo-item ${activeId === c.id ? 'active' : ''}`} onClick={() => setActiveId(c.id)}>
                    <span className="avatar-dot">{(other?.full_name || other?.username || '?').charAt(0).toUpperCase()}</span>
                    <span className="chat-convo-info">
                      <strong>{other?.full_name || other?.username}</strong>
                      <span className="text-sm text-muted chat-preview">{c.last_message?.content || 'No messages yet'}</span>
                    </span>
                    {c.unread_count > 0 && <span className="unread-dot">{c.unread_count}</span>}
                  </button>
                );
              })
            )}
          </div>

          <div className="chat-main">
            {!activeConversation ? (
              <EmptyState title="Select a conversation" />
            ) : (
              <>
                <div className="chat-header">
                  <strong>{otherParticipant?.full_name || otherParticipant?.username}</strong>
                </div>
                <div className="chat-messages" ref={scrollRef}>
                  {loadingMessages ? <Loader label="Loading messages…" /> : messages.map((m) => (
                    <div key={m.id} className={`chat-bubble ${m.sender === user?.id || m.sender?.id === user?.id ? 'mine' : ''}`}>
                      <p>{m.content}</p>
                      {m.image && <img src={m.image} alt="attachment" className="chat-attachment" />}
                      <span className="chat-timestamp">{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  ))}
                </div>
                <form className="chat-input-row" onSubmit={sendMessage}>
                  <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message…" />
                  <button className="btn btn-primary" type="submit">Send</button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
