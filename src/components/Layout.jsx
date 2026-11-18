import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FileText, Menu, LogOut, ArrowUpRight, BookOpen, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

export function Brand() {
  return <Link to="/" className="brand" aria-label="EasyTerms 홈">
    <span className="brand-icon"><FileText size={21} strokeWidth={2.3}/></span>
    <span>Easy<span className="brand-accent">Terms</span></span>
  </Link>;
}

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = React.useState(false);

  const signOut = () => { logout(); navigate('/'); setMenuOpen(false); };
  return <div className="app-shell">
    <header className="site-header">
      <div className="container nav-bar">
        <Brand />
        <button className="icon-btn mobile-menu" onClick={() => setMenuOpen((v) => !v)} aria-label="메뉴 열기"><Menu size={22}/></button>
        <nav className={`nav-links ${menuOpen ? 'nav-open' : ''}`}>
          <NavLink to="/" end onClick={() => setMenuOpen(false)}>홈</NavLink>
          {user && <>
            <NavLink to="/upload" onClick={() => setMenuOpen(false)}>문서 분석</NavLink>
            <NavLink to="/documents" onClick={() => setMenuOpen(false)}>내 문서</NavLink>
          </>}
        </nav>
        <div className="nav-actions">
          {user ? <>
            <span className="user-label">{user.nickname || user.name || '사용자'}님</span>
            <button className="btn btn-ghost btn-sm" onClick={signOut}><LogOut size={16}/> 로그아웃</button>
          </> : <>
            <Link to="/login" className="btn btn-ghost btn-sm">로그인</Link>
            <Link to="/register" className="btn btn-primary btn-sm">회원가입 <ArrowUpRight size={15}/></Link>
          </>}
        </div>
      </div>
    </header>
    <main className="page-main">{children}</main>
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-brand"><BookOpen size={17}/><strong>EasyTerms</strong><span>복잡한 계약, 쉬운 이해</span></div>
        <p>AI 분석은 이해를 돕는 참고 정보이며 법률 자문을 대신하지 않습니다.</p>
        <span>© 2026 EasyTerms</span>
      </div>
    </footer>
  </div>;
}

export function PageHeading({ eyebrow, title, description, actions }) {
  return <div className="page-heading">
    <div>
      {eyebrow && <div className="eyebrow"><Sparkles size={14}/>{eyebrow}</div>}
      <h1>{title}</h1>
      {description && <p>{description}</p>}
    </div>
    {actions && <div className="page-actions">{actions}</div>}
  </div>;
}

export function Loading({ text = '불러오는 중이에요...' }) {
  return <div className="loading-state"><span className="spinner"/><span>{text}</span></div>;
}

export function Alert({ children, tone = 'danger' }) {
  if (!children) return null;
  return <div className={`alert alert-${tone}`} role="alert">{children}</div>;
}

export function EmptyState({ icon: Icon = FileText, title, description, action }) {
  return <div className="empty-state">
    <div className="empty-icon"><Icon size={26}/></div>
    <h3>{title}</h3>
    {description && <p>{description}</p>}
    {action && <div>{action}</div>}
  </div>;
}
