import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, FileText, FolderOpen, Plus, Search, CalendarDays } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api } from '../lib/api.js';
import { Alert, EmptyState, Loading, PageHeading } from '../components/Layout.jsx';

const LABELS = { SUBSCRIPTION: '구독·서비스', RENTAL: '임대차', INSURANCE: '보험', LOAN: '대출·금융', OTHER: '기타' };

export default function DocumentsPage() {
  const { userId, token } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    let active = true;
    api.getDocuments(userId, token)
      .then((result) => { if (active) setDocuments(Array.isArray(result) ? result : result?.documents || []); })
      .catch((err) => { if (active) setError(err.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId, token]);

  const filtered = useMemo(() => documents.filter((doc) => {
    const matchText = (doc.title || '').toLowerCase().includes(search.toLowerCase());
    return matchText && (filter === 'ALL' || doc.documentType === filter);
  }), [documents, search, filter]);

  return <section className="container dashboard-page">
    <PageHeading eyebrow="MY DOCUMENTS" title="내 문서" description="업로드한 계약서와 분석 결과를 언제든 다시 확인할 수 있어요."
      actions={<Link to="/upload" className="btn btn-primary"><Plus size={18}/> 새 문서 분석</Link>}/>
    <div className="card docs-panel">
      <div className="docs-tools">
        <div className="search-wrap"><Search size={19}/><input placeholder="문서 제목 검색..." value={search} onChange={(e) => setSearch(e.target.value)}/></div>
        <select className="select-input" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="문서 유형 필터"><option value="ALL">전체 유형</option>{Object.entries(LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
      </div>
      <Alert>{error}</Alert>
      {loading ? <Loading text="저장된 문서를 불러오는 중이에요..."/> : filtered.length === 0 ?
        <EmptyState icon={FolderOpen} title={documents.length ? '검색 결과가 없어요' : '아직 등록한 문서가 없어요'} description={documents.length ? '검색어나 필터를 바꿔 보세요.' : '첫 계약서를 업로드하고 AI 분석을 시작해 보세요.'} action={!documents.length && <Link to="/upload" className="btn btn-primary">첫 문서 분석하기 <ArrowRight size={16}/></Link>}/>
        : <div className="doc-list">{filtered.map((doc) => <Link to={`/documents/${doc.id}`} className="doc-item" key={doc.id}>
          <div className="doc-file-icon"><FileText size={23}/></div>
          <div className="doc-meta"><strong>{doc.title}</strong><div className="doc-sub"><span className="type-badge">{LABELS[doc.documentType] || doc.documentType}</span><span><CalendarDays size={13}/> {doc.createdAt ? String(doc.createdAt).slice(0, 10) : '등록 날짜 없음'}</span><span>{doc.inputType === 'FILE' ? '파일 등록' : '텍스트 등록'}</span></div></div>
          <ArrowRight size={19} className="doc-arrow"/>
        </Link>)}</div>}
      {!loading && documents.length > 0 && <div className="docs-count">총 {documents.length}개 문서</div>}
    </div>
  </section>;
}
