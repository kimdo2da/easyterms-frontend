import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, FileText, FileUp, Info, ShieldCheck, Sparkles, UploadCloud, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api } from '../lib/api.js';
import { Alert, PageHeading } from '../components/Layout.jsx';

const TYPES = [
  { value: 'SUBSCRIPTION', label: '구독·서비스 계약서', detail: '서비스 구독 및 이용약관' },
  { value: 'RENTAL', label: '임대차 계약서', detail: '주택·상가 등 임대 관련' },
  { value: 'INSURANCE', label: '보험 계약서', detail: '보험 상품·보장 관련' },
  { value: 'LOAN', label: '대출·금융 계약서', detail: '대출·상환 조건 관련' },
  { value: 'OTHER', label: '기타 계약서', detail: '그 밖의 계약 문서' },
];

const MAX_SIZE = 5 * 1024 * 1024;

export default function UploadPage() {
  const { userId, token } = useAuth();
  const navigate = useNavigate();
  const fileInput = useRef(null);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [documentType, setDocumentType] = useState('SUBSCRIPTION');
  const [drag, setDrag] = useState(false);
  const [step, setStep] = useState('');
  const [error, setError] = useState('');

  const busy = Boolean(step);
  function selectFile(next) {
    if (!next) return;
    setError('');
    const extension = next.name.toLowerCase().split('.').pop();
    if (!['pdf', 'txt'].includes(extension)) { setError('PDF 또는 TXT 파일만 올릴 수 있어요.'); return; }
    if (next.size > MAX_SIZE) { setError('파일은 최대 5MB까지만 업로드할 수 있어요.'); return; }
    setFile(next);
    setTitle((current) => current || next.name.replace(/\.[^.]+$/, ''));
  }

  async function submit(event) {
    event.preventDefault();
    if (!file) { setError('먼저 PDF 또는 TXT 파일을 선택해 주세요.'); return; }
    if (!title.trim()) { setError('문서 제목을 입력해 주세요.'); return; }
    setError('');
    const form = new FormData();
    form.append('userId', String(userId));
    form.append('title', title.trim());
    form.append('documentType', documentType); // DocumentService.TYPES의 정확한 값
    form.append('file', file);
    let id;
    try {
      setStep('upload');
      const uploaded = await api.upload(form, token);
      id = uploaded?.id ?? uploaded?.documentId;
      if (!id) throw new Error('업로드 응답에 문서 ID가 없어요.');
      setStep('analyze');
      await api.analyze(id, userId, token);
      navigate(`/documents/${id}`, { replace: true });
    } catch (err) {
      setError(err.message || '처리에 실패했어요.');
      setStep('');
      // 업로드만 성공했을 때는 중복 업로드를 막고 분석 화면으로 이동할 수 있게 안내
      if (id) navigate(`/documents/${id}`, { state: { analyzeError: true, uploadError: err.message } });
    }
  }

  return <section className="container dashboard-page">
    <PageHeading eyebrow="DOCUMENT ANALYSIS" title="계약서 분석하기" description="계약서 파일을 올리고 유형을 선택하면, AI가 중요한 내용을 정리해 드려요."/>
    <form onSubmit={submit} className="upload-layout">
      <div className="upload-main">
        <div className="card upload-panel">
          <div className="card-heading"><div className="step-pill">STEP 01</div><h2>계약서 파일 선택</h2><p>PDF 또는 TXT 파일을 업로드해 주세요.</p></div>
          <div className={`dropzone ${drag ? 'drag-active' : ''} ${file ? 'has-file' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDrag(false); }}
            onDrop={(e) => { e.preventDefault(); setDrag(false); selectFile(e.dataTransfer.files[0]); }}>
            <input ref={fileInput} type="file" accept=".pdf,.txt,application/pdf,text/plain" className="sr-only" onChange={(e) => selectFile(e.target.files[0])}/>
            {file ? <><div className="drop-icon"><FileText size={30}/></div><strong className="uploaded-filename">{file.name}</strong><span>{(file.size / 1024).toFixed(1)} KB · 업로드 준비 완료</span><button type="button" className="btn btn-outline btn-sm" onClick={() => { setFile(null); setTitle(''); if (fileInput.current) fileInput.current.value = ''; }} disabled={busy}><X size={15}/> 파일 변경</button></>
              : <><div className="drop-icon"><UploadCloud size={32}/></div><strong>파일을 여기에 끌어다 놓거나</strong><span>아래 버튼을 눌러 파일을 선택하세요.</span><button type="button" className="btn btn-outline" onClick={() => fileInput.current?.click()}><FileUp size={17}/> 파일 선택하기</button><small>PDF, TXT · 최대 5MB</small></>}
          </div>
          <label className="field file-title-field"><span>문서 제목</span><input className="text-input" placeholder="예: 에듀브릿지 구독서비스 이용계약서" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={150} required/></label>
        </div>
        <div className="card upload-panel">
          <div className="card-heading"><div className="step-pill">STEP 02</div><h2>문서 유형 선택</h2><p>문서의 성격에 맞는 유형을 선택해 주세요.</p></div>
          <div className="type-grid">{TYPES.map((item) => <label className={`type-option ${documentType === item.value ? 'type-selected' : ''}`} key={item.value}>
            <input type="radio" name="documentType" value={item.value} checked={documentType === item.value} onChange={() => setDocumentType(item.value)}/>
            <span className="radio-display"/><strong>{item.label}</strong><small>{item.detail}</small>
          </label>)}</div>
        </div>
        <Alert>{error}</Alert>
        <button type="submit" className="btn btn-primary btn-lg analyze-btn" disabled={busy || !file}>{step === 'upload' ? <>파일 등록 중... <span className="spinner spinner-light"/></> : step === 'analyze' ? <>GPT-6 Luna 분석 중... <span className="spinner spinner-light"/></> : <>문서 업로드 및 AI 분석 <ArrowRight size={19}/></>}</button>
        {busy && <p className="analyze-wait"><Sparkles size={16}/> 분석 중에는 이 화면을 닫거나 새로고침하지 마세요. 계약서 길이에 따라 시간이 걸릴 수 있어요.</p>}
      </div>
      <aside className="upload-aside">
        <div className="card guide-card"><div className="guide-top"><ShieldCheck size={24}/><h3>EasyTerms 이용 안내</h3></div><p>계약서에서 다음 내용을 중점적으로 찾아요.</p><div className="guide-list"><span>✓ 계약기간과 만료일</span><span>✓ 요금·납부·환불 조건</span><span>✓ 중도해지·위약금</span><span>✓ 자동 갱신 여부</span><span>✓ 꼭 확인할 주의사항</span></div></div>
        <div className="disclaimer"><Info size={18}/><span>개인정보가 포함된 실제 계약서는 공개 테스트에 사용하지 않는 것을 권장해요. 분석 결과는 법률 자문이 아니에요.</span></div>
      </aside>
    </form>
  </section>;
}
