import React from 'react';
import { Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Layout, { Loading } from './components/Layout.jsx';
import { useAuth } from './contexts/AuthContext.jsx';
import HomePage from './pages/HomePage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import UploadPage from './pages/UploadPage.jsx';
import DocumentsPage from './pages/DocumentsPage.jsx';
import AnalysisPage from './pages/AnalysisPage.jsx';
import ChatPage from './pages/ChatPage.jsx';

function ProtectedRoute({ children }) {
  const { user, loading, userId } = useAuth();
  const location = useLocation();
  if (loading) return <div className="container dashboard-page"><Loading text="로그인 상태를 확인하고 있어요..."/></div>;
  if (!user || !userId) return <Navigate to="/login" replace state={{ from: location.pathname }}/>
  return children;
}

export default function App() {
  return <Layout>
    <Routes>
      <Route path="/" element={<HomePage/>}/>
      <Route path="/login" element={<AuthPage key="login" mode="login"/>}/>
      <Route path="/register" element={<AuthPage key="register" mode="register"/>}/>
      <Route path="/upload" element={<ProtectedRoute><UploadPage/></ProtectedRoute>}/>
      <Route path="/documents" element={<ProtectedRoute><DocumentsPage/></ProtectedRoute>}/>
      <Route path="/documents/:id" element={<ProtectedRoute><AnalysisPage/></ProtectedRoute>}/>
      <Route path="/documents/:id/chat" element={<ProtectedRoute><ChatPage/></ProtectedRoute>}/>
      <Route path="*" element={<section className="container not-found"><h1>페이지를 찾을 수 없어요</h1><p>입력한 주소를 다시 확인해 주세요.</p><Link className="btn btn-primary" to="/"><ArrowLeft size={16}/> 홈으로</Link></section>}/>
    </Routes>
  </Layout>;
}
