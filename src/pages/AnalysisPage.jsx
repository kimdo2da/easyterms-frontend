import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, CheckCheck, CircleAlert, ClipboardCheck, FileText, ListChecks, MessageCircle, RotateCw, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api } from '../lib/api.js';
import { Alert, EmptyState, Loading, PageHeading } from '../components/Layout.jsx';

const TABS = [
  { id: 'easy', label: '쉬운 설명', icon: Sparkles },
  { id: 'conditions', label: '핵심 조건', icon: ListChecks },
  { id: 'checks', label: '확인할 사항', icon: ClipboardCheck },
  { id: 'terms', label: '용어 정리', icon: BookOpen },
];

function Citation({ source }) {
  if (!source) return null;
  return <details className="source-accordion"><summary>원문 근거 보기</summary><blockquote>{source}</blockquote></details>;
}

export default function AnalysisPage() {
  const { id } = useParams();
  const { userId, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [document, setDocument] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [tab, setTab] = useState('easy');
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(location.state?.uploadError || '');
  const [notAnalyzed, setNotAnalyzed] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.allSettled([
      api.getDocuments(userId, token),
      api.getAnalysis(id, userId, token),
    ]).then(([docResult, analysisResult]) => {
      if (!active) return;
      if (docResult.status === 'fulfilled') {
        const docs = Array.isArray(docResult.value) ? docResult.value : docResult.value?.documents || [];
        setDocument(docs.find((item) => String(item.id) === String(id)) || null);
      } else setError(docResult.reason.message);
      if (analysisResult.status === 'fulfilled') {
        setAnalysis(analysisResult.value);
        setNotAnalyzed(false);
      } else {
        setNotAnalyzed(true);
        if (![404, 400].includes(analysisResult.reason?.status)) setError(analysisResult.reason.message);
      }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, userId, token]);

  async function rerun() {
    setRunning(true); setError('');
    try {
      const result = await api.analyze(id, userId, token);
      setAnalysis(result);
      setNotAnalyzed(false);
      setTab('easy');
    } catch (err) { setError(err.message); }
    finally { setRunning(false); }
  }

  if (loading) return <section className="container dashboard-page"><Loading text="계약서 분석 결과를 불러오고 있어요..."/></section>;

  return <section className="container dashboard-page">
    <div className="back-line"><Link to="/documents"><ArrowLeft size={17}/> 내 문서로 돌아가기</Link></div>
    <PageHeading eyebrow="ANALYSIS RESULT" title="계약서 분석 결과" description={document?.title || `문서 #${id}`}
      actions={<>
        <button className="btn btn-outline" onClick={() => setShowOriginal((v) => !v)}><FileText size={17}/> {showOriginal ? '원문 닫기' : '추출 원문 보기'}</button>
        <Link to={`/documents/${id}/chat`} className="btn btn-primary"><MessageCircle size={17}/> AI에게 질문하기</Link>
      </>}/>
    {showOriginal && <section className="card original-panel"><div className="panel-heading"><h2>PDF/TXT에서 추출한 원문</h2><span>실제 원본 파일 뷰어는 다음 개발 단계에서 추가 가능</span></div><pre>{document?.content || '원문이 없어요.'}</pre></section>}
    <Alert>{error}</Alert>
    {!analysis ? <div className="card"><EmptyState icon={CircleAlert} title="아직 분석 결과가 없어요" description="분석이 저장되지 않았거나 결과 조회에 실패했어요. 문서 분석을 다시 실행할 수 있어요." action={<button className="btn btn-primary" onClick={rerun} disabled={running}>{running ? <><span className="spinner spinner-light"/> 분석 중...</> : <><RotateCw size={16}/> GPT-6 Luna 분석 실행</>}</button>}/></div>
      : <>
        <div className="analysis-banner"><div className="analysis-check"><CheckCheck size={22}/></div><div><strong>AI 분석이 완료되었습니다.</strong><p>계약서의 주요 조건과 주의할 사항을 쉽게 정리했어요.</p></div><span className="analysis-count">핵심 조건 {analysis.keyConditions?.length || 0}개</span></div>
        <div className="analysis-tabs" role="tablist" aria-label="분석 결과 분류">{TABS.map(({ id: tabId, label, icon: Icon }) => <button type="button" role="tab" aria-selected={tab === tabId} key={tabId} className={tab === tabId ? 'active' : ''} onClick={() => setTab(tabId)}><Icon size={18}/>{label}</button>)}</div>
        <div className="card result-panel">
          {tab === 'easy' && <><div className="result-heading"><div className="result-heading-icon"><Sparkles size={21}/></div><div><h2>쉬운 말로 정리한 계약서</h2><p>전체 내용을 쉽게 풀어서 설명했어요.</p></div></div><div className="easy-text">{analysis.easyExplanation || '생성된 설명이 없습니다.'}</div><div className="info-strip"><CircleAlert size={18}/><span>AI의 설명은 원문 이해를 돕는 참고 정보입니다. 중요한 결정 전에는 원문과 관련 전문가의 조언을 확인하세요.</span></div></>}
          {tab === 'conditions' && <><div className="result-heading"><div className="result-heading-icon blue-icon"><ListChecks size={21}/></div><div><h2>핵심 계약 조건</h2><p>금액, 계약기간, 해지 조건 등을 한눈에 확인하세요.</p></div></div><div className="condition-list">{(analysis.keyConditions || []).map((item, index) => <div className="condition-row" key={index}><div className="condition-name">{item.itemName}</div><div className="condition-body"><strong>{item.itemValue}</strong><Citation source={item.sourceExcerpt}/></div></div>)}</div></>}
          {tab === 'checks' && <><div className="result-heading"><div className="result-heading-icon orange-icon"><ClipboardCheck size={21}/></div><div><h2>꼭 확인할 사항</h2><p>놓치기 쉬운 조건이나 불확실한 내용을 살펴보세요.</p></div></div><div className="check-card-list">{(analysis.checkItems || []).map((item, index) => <div className="check-card" key={index}><div className="check-no">{String(index + 1).padStart(2, '0')}</div><div><h3>{item.title}</h3><p>{item.explanation}</p><Citation source={item.sourceExcerpt}/></div></div>)}</div></>}
          {tab === 'terms' && <><div className="result-heading"><div className="result-heading-icon purple-icon"><BookOpen size={21}/></div><div><h2>어려운 용어 쉽게 이해하기</h2><p>계약서에 나온 표현을 쉬운 말로 풀어드려요.</p></div></div><div className="terms-grid">{(analysis.terms || []).map((item, index) => <article className="term-card" key={index}><div className="term-word">{item.term}</div><p>{item.explanation}</p><Citation source={item.sourceExcerpt}/></article>)}</div></>}
        </div>
        <div className="next-step"><div><strong>더 궁금한 내용이 있나요?</strong><p>방금 분석한 계약서에 대해 AI에게 바로 물어보세요.</p></div><button className="btn btn-primary" onClick={() => navigate(`/documents/${id}/chat`)}>후속 질문하기 <ArrowRight size={17}/></button></div>
      </>}
  </section>;
}
