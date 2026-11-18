const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('서버에 연결하지 못했어요. Spring Boot가 8080번 포트에서 실행 중인지 확인해 주세요.', 0);
  }

  const raw = await response.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }

  if (!response.ok) {
    // Spring 오류 응답의 message는 길거나 추적 정보일 수 있어 사용자 노출을 제한합니다.
    const details = data && typeof data === 'object' ? data : {};
    const message = details.message || details.reason || details.error || `요청 실패 (HTTP ${response.status})`;
    const shortMessage = String(message).length <= 240 ? String(message) : `요청 실패 (HTTP ${response.status})`;
    throw new ApiError(shortMessage, response.status);
  }
  return data;
}

const query = (userId) => `?userId=${encodeURIComponent(userId)}`;

export const api = {
  login: (email, password) => request('/api/auth/login', { method: 'POST', body: { email, password } }),
  register: (email, password, nickname) => request('/api/auth/register', {
    method: 'POST', body: { email, password, nickname },
  }),
  me: (token) => request('/api/auth/me', { token }),
  getDocuments: (userId, token) => request(`/api/documents${query(userId)}`, { token }),
  getDocument: (id, userId, token) => request(`/api/documents/${encodeURIComponent(id)}${query(userId)}`, { token }),
  upload: (formData, token) => request('/api/documents/upload', { method: 'POST', body: formData, token }),
  analyze: (id, userId, token) => request(`/api/analysis/${encodeURIComponent(id)}${query(userId)}`, {
    method: 'POST', token,
  }),
  getAnalysis: (id, userId, token) => request(`/api/analysis/${encodeURIComponent(id)}${query(userId)}`, { token }),
  getHistory: (id, userId, token) => request(`/api/documents/${encodeURIComponent(id)}/chat${query(userId)}`, { token }),
  ask: (id, userId, question, token) => request(`/api/documents/${encodeURIComponent(id)}/chat${query(userId)}`, {
    method: 'POST', body: { question }, token,
  }),
};
