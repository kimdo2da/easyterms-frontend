import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, FileCheck2, FileText, MessageCircle, ScanText, ShieldCheck, Sparkles, UploadCloud, WandSparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function HomePage() {
  const { user } = useAuth();
  return <>
    <section className="hero">
      <div className="hero-glow"/>
      <div className="container hero-grid">
        <div className="hero-copy">
          <div className="hero-tag"><span className="tiny-dot"/> GENERATIVE AI · DOCUMENT ASSISTANT</div>
          <h1>어려운 계약서를,<br/><span>누구나 이해하기 쉽게.</span></h1>
          <p>복잡한 계약 조건부터 놓치기 쉬운 위약금까지.<br className="desktop-break"/> EasyTerms가 중요한 내용만 골라 쉽게 설명해 드려요.</p>
          <div className="hero-cta">
            <Link to={user ? '/upload' : '/register'} className="btn btn-primary btn-lg">무료로 분석 시작하기 <ArrowRight size={18}/></Link>
            <a href="#how" className="btn btn-outline btn-lg">이용 방법 보기</a>
          </div>
          <div className="hero-trust"><span><Check size={16}/> PDF · TXT 지원</span><span><Check size={16}/> 핵심 조건 요약</span><span><Check size={16}/> 후속 질문</span></div>
        </div>
        <div className="hero-visual" aria-label="EasyTerms 분석 화면 예시">
          <div className="floating-label"><Sparkles size={14}/> AI 계약서 분석</div>
          <div className="preview-document">
            <div className="preview-top"><div className="preview-mini-icon"><FileText size={18}/></div><div><strong>서비스 이용계약서.pdf</strong><span>PDF 문서 · 분석 완료</span></div><span className="success-dot"/></div>
            <div className="preview-lines"><div className="fake-line wide"/><div className="fake-line mid"/><div className="fake-line long"/><div className="fake-line small"/></div>
            <div className="highlight-block"><span>주요 조건 발견</span><div className="highlight-row"><Check size={15}/> 계약기간 12개월</div><div className="highlight-row"><Check size={15}/> 자동 갱신 조건 있음</div></div>
            <div className="preview-summary"><div className="preview-summary-title"><WandSparkles size={16}/> EasyTerms AI 요약</div><p>중도해지 시 위약금이 발생할 수 있어요. 해지 전 계약 조건을 꼭 확인하세요.</p></div>
          </div>
          <div className="floating-info"><div className="float-icon"><ShieldCheck size={19}/></div><div><strong>원문 기반 분석</strong><span>근거 조항까지 확인</span></div></div>
        </div>
      </div>
    </section>

    <section className="section container" id="features">
      <div className="section-header center"><div className="eyebrow">WHY EASYTERMS</div><h2>계약서 읽기가 더 쉬워져요</h2><p>길고 낯선 문서도, 중요한 내용을 놓치지 않도록.</p></div>
      <div className="feature-grid">
        <div className="feature-card"><div className="feature-icon mint"><ScanText size={26}/></div><h3>쉬운 말로 설명</h3><p>복잡한 법률·계약 표현을 읽기 쉬운 문장으로 풀어줘요.</p></div>
        <div className="feature-card"><div className="feature-icon blue"><FileCheck2 size={26}/></div><h3>핵심 조건 정리</h3><p>기간, 금액, 해지, 위약금, 자동 갱신을 한눈에 확인해요.</p></div>
        <div className="feature-card"><div className="feature-icon violet"><MessageCircle size={26}/></div><h3>문서에 바로 질문</h3><p>궁금한 내용을 물어보면 계약서 원문을 근거로 답변해요.</p></div>
      </div>
    </section>

    <section className="section section-tinted" id="how"><div className="container">
      <div className="section-header center"><div className="eyebrow">HOW IT WORKS</div><h2>딱 세 단계면 충분해요</h2><p>문서만 준비하면 어려운 설정은 필요 없어요.</p></div>
      <div className="steps-grid">
        <div className="step-card"><span className="step-number">01</span><div className="step-icon"><UploadCloud size={26}/></div><h3>문서 업로드</h3><p>PDF나 TXT 파일을 올리고 문서 유형을 선택하세요.</p></div>
        <div className="step-card"><span className="step-number">02</span><div className="step-icon"><WandSparkles size={26}/></div><h3>AI 분석 결과</h3><p>쉬운 설명과 주요 조건, 주의 사항, 용어를 확인해요.</p></div>
        <div className="step-card"><span className="step-number">03</span><div className="step-icon"><MessageCircle size={26}/></div><h3>추가 질문</h3><p>이해되지 않는 부분은 문서에 대해 바로 질문하세요.</p></div>
      </div>
    </div></section>

    <section className="section container"><div className="cta-panel"><div><div className="eyebrow eyebrow-light">START WITH EASYTERMS</div><h2>이제 계약서를 혼자 해석하지 마세요.</h2><p>중요한 조건을 이해하고, 필요한 질문까지 이어가세요.</p></div><Link to={user ? '/upload' : '/register'} className="btn btn-white">지금 시작하기 <ArrowRight size={18}/></Link></div></section>
  </>;
}
