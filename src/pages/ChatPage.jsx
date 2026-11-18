import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUp, FileText, MessageCircle, Sparkles, UserRound } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api } from '../lib/api.js';
import { Alert, Loading, PageHeading } from '../components/Layout.jsx';

const SUGGESTIONS = [
  '중도해지하면 위약금이 얼마나 발생해?',
  '자동 갱신을 막으려면 어떻게 해야 해?',
  '환불은 언제 받을 수 있어?',
];

function renderText(value) {
  // AI의 **강조** 표현을 React 텍스트 노드로만 처리(XSS 방지)
  return String(value || '').split(/(\*\*[^*]+\*\*)/g).map((part, i) => part.startsWith('**') && part.endsWith('**')
    ? <strong key={i}>{part.slice(2, -2)}</strong> : <React.Fragment key={i}>{part}</React.Fragment>);
}

export default function ChatPage() {
  const { id } = useParams();
  const { userId, token } = useAuth();
  const [messages, setMessages] = useState([]);
  const [document, setDocument] = useState(null);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    let active = true;
    Promise.allSettled([api.getHistory(id, userId, token), api.getDocuments(userId, token)])
      .then(([historyResult, docsResult]) => {
        if (!active) return;
        if (historyResult.status === 'fulfilled') setMessages(Array.isArray(historyResult.value) ? historyResult.value : []);
        else setError(historyResult.reason.message);
        if (docsResult.status === 'fulfilled') {
          const docs = Array.isArray(docsResult.value) ? docsResult.value : docsResult.value?.documents || [];
          setDocument(docs.find((item) => String(item.id) === String(id)) || null);
        }
      }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, userId, token]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, busy]);

  async function ask(event, suggested) {
    event?.preventDefault?.();
    const text = (suggested || question).trim();
    if (!text || text.length > 500 || busy) return;
    setError(''); setBusy(true); setQuestion('');
    // 임시 메시지는 전송 실패 시에도 남기고 재입력할 수 있게 처리
    const temp = { id: `pending-${Date.now()}`, role: 'USER', content: text };
    setMessages((prev) => [...prev, temp]);
    try {
      const result = await api.ask(id, userId, text, token);
      setMessages((prev) => [...prev.filter((msg) => msg.id !== temp.id),
        { id: `q-${Date.now()}`, role: 'USER', content: text },
        { id: `a-${Date.now()}`, role: 'ASSISTANT', content: result.answer }]);
    } catch (err) {
      setMessages((prev) => prev.filter((msg) => msg.id !== temp.id));
      setQuestion(text);
      setError(err.message);
    } finally { setBusy(false); }
  }

  return <section className="container dashboard-page chat-page">
    <div className="back-line"><Link to={`/documents/${id}`}><ArrowLeft size={17}/> 분석 결과로 돌아가기</Link></div>
    <PageHeading eyebrow="AI FOLLOW-UP" title="계약서에게 질문하기" description="문서 내용에 대한 궁금한 점을 AI에게 물어보세요."/>
    <div className="chat-layout">
      <div className="card chat-container">
        <div className="chat-topbar"><div className="chat-ai-icon"><Sparkles size={19}/></div><div><strong>EasyTerms AI</strong><span>계약서 원문 기반 질문 답변</span></div><div className="chat-online"><span/> 응답 준비</div></div>
        <div className="chat-scroll">
          {loading ? <Loading text="대화 기록을 불러오는 중이에요..."/> : <>
            <div className="chat-intro"><div className="chat-intro-icon"><MessageCircle size={25}/></div><h3>무엇이 궁금하세요?</h3><p>계약서의 내용을 바탕으로 쉽게 답변해 드릴게요.</p></div>
            {messages.length === 0 && <div className="chat-suggestions">{SUGGESTIONS.map((text) => <button type="button" key={text} onClick={() => ask(null, text)} disabled={busy}>{text} <ArrowUp size={14}/></button>)}</div>}
            <div className="message-list">{messages.map((message) => <div className={`chat-message ${message.role === 'USER' ? 'from-user' : 'from-assistant'}`} key={message.id}>
              {message.role !== 'USER' && <div className="message-avatar ai-avatar"><Sparkles size={16}/></div>}
              <div className="bubble"><div className="bubble-content">{renderText(message.content)}</div></div>
              {message.role === 'USER' && <div className="message-avatar person-avatar"><UserRound size={16}/></div>}
            </div>)}</div>
            {busy && <div className="chat-message from-assistant"><div className="message-avatar ai-avatar"><Sparkles size={16}/></div><div className="bubble typing"><span className="spinner"/> 계약서를 읽고 답변하고 있어요...</div></div>}
            <div ref={bottomRef}/>
          </>}
        </div>
        <div className="chat-composer"><Alert>{error}</Alert><form onSubmit={ask} className="compose-row"><textarea rows={2} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="계약서에 대해 궁금한 내용을 입력하세요..." maxLength={500} disabled={loading || busy} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); ask(e); } }}/><button className="send-btn" type="submit" disabled={!question.trim() || busy || loading} aria-label="메시지 전송"><ArrowUp size={21}/></button></form><div className="compose-meta"><span>문서에 없는 내용은 정확히 답변하지 못할 수 있어요.</span><span>{question.length}/500 · Enter 전송</span></div></div>
      </div>
      <aside className="chat-sidebar"><div className="card current-doc"><div className="sidebar-title"><FileText size={19}/> 현재 분석 문서</div><h3>{document?.title || `문서 #${id}`}</h3><p>이 문서 내용만을 근거로 답변해요.</p><Link to={`/documents/${id}`} className="btn btn-outline btn-full">분석 결과 다시 보기</Link></div><div className="sidebar-note"><Sparkles size={17}/><p>질문에 대한 답변은 AI가 생성합니다. 계약에 관한 최종 판단은 원문을 참고하세요.</p></div></aside>
    </div>
  </section>;
}
