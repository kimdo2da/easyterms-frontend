import React, { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { ArrowRight, CheckCircle2, LockKeyhole, Mail, UserRound, WandSparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { api } from '../lib/api.js';
import { Alert } from '../components/Layout.jsx';

export default function AuthPage({ mode = 'login' }) {
  const isRegister = mode === 'register';
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  if (user) return <Navigate to="/documents" replace/>;

  async function submit(event) {
    event.preventDefault();
    setError(''); setBusy(true);
    try {
      if (isRegister) {
        await api.register(email.trim(), password, nickname.trim());
        navigate('/login', { replace: true, state: { registered: true } });
      } else {
        await login(email.trim(), password);
        navigate('/documents', { replace: true });
      }
    } catch (err) {
      setError(err.message || '요청 처리 중 오류가 발생했어요.');
    } finally { setBusy(false); }
  }

  return <div className="auth-section"><div className="container auth-grid">
    <div className="auth-aside">
      <div className="hero-tag"><span className="tiny-dot"/> GET STARTED</div>
      <h1>어려운 계약서를<br/><span>쉽게 이해하는 시작.</span></h1>
      <p>EasyTerms에서 문서를 분석하고,<br/>중요한 조항을 쉽게 확인해 보세요.</p>
      <div className="auth-benefits"><div><CheckCircle2 size={19}/> 쉬운 말로 계약서 정리</div><div><CheckCircle2 size={19}/> 핵심 조건과 위약금 한눈에</div><div><CheckCircle2 size={19}/> 계약서 기반 AI 후속 질문</div></div>
    </div>
    <div className="auth-card card">
      <div className="auth-symbol"><WandSparkles size={26}/></div>
      <h2>{isRegister ? '회원가입' : '다시 오신 걸 환영해요!'}</h2>
      <p>{isRegister ? '간단한 정보로 서비스를 시작해 보세요.' : '로그인하고 분석하던 계약서를 이어서 확인하세요.'}</p>
      <form onSubmit={submit} className="form-stack">
        {isRegister && <label className="field"><span>닉네임</span><div className="input-wrap"><UserRound size={18}/><input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="사용할 닉네임" required minLength={2} maxLength={40}/></div></label>}
        <label className="field"><span>이메일</span><div className="input-wrap"><Mail size={18}/><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" required autoComplete="email"/></div></label>
        <label className="field"><span>비밀번호</span><div className="input-wrap"><LockKeyhole size={18}/><input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="비밀번호 입력" required autoComplete={isRegister ? 'new-password' : 'current-password'}/><button type="button" className="password-toggle" onClick={() => setShowPassword((v) => !v)}>{showPassword ? '숨기기' : '보기'}</button></div></label>
        <Alert>{error}</Alert>
        <button className="btn btn-primary btn-full btn-lg" disabled={busy}>{busy ? '처리 중...' : isRegister ? '회원가입 완료' : '로그인'} <ArrowRight size={17}/></button>
      </form>
      <div className="auth-switch">{isRegister ? <>이미 계정이 있나요? <Link to="/login">로그인하기</Link></> : <>아직 계정이 없나요? <Link to="/register">회원가입하기</Link></>}</div>
    </div>
  </div></div>;
}
