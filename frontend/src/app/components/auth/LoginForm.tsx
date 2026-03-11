import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Toast } from '../ui/Toast';
import type { ToastAnchor } from '../ui/Toast';
import { login as apiLogin } from '../../api/member';
import { ApiError } from '../../api/ApiError';
import { setUserName } from '../../utils/auth';

const BACKEND_ORIGIN =
  (import.meta.env.VITE_BACKEND_URL as string | undefined) ?? 'http://localhost:8080';
const GOOGLE_LOGIN_URL = `${BACKEND_ORIGIN}/oauth2/authorization/google`;
const NAVER_LOGIN_URL = `${BACKEND_ORIGIN}/oauth2/authorization/naver`;
const KAKAO_LOGIN_URL = `${BACKEND_ORIGIN}/oauth2/authorization/kakao`;

const socialButtonBase =
  'w-full inline-flex items-center justify-center gap-3 rounded-full border font-medium py-3.5 px-5 shadow-sm cursor-pointer transition-colors';

type LoginFormProps = {
  /** 모달에서 사용 시 성공 시 호출 (미전달이면 navigate + auth-login) */
  onSuccess?: () => void;
  /** 회원가입으로 전환 (모달에서 사용) */
  onSwitchToSignup?: () => void;
  /** 초기 성공 메시지 (회원가입 완료 후 등) */
  successMessage?: string;
  /** 모달 내부 여부 (스타일/닫기 노출) */
  embedded?: boolean;
};

export function LoginForm({
  onSuccess,
  onSwitchToSignup,
  successMessage: initialSuccessMessage,
  embedded = false,
}: LoginFormProps) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(initialSuccessMessage ?? '');
  const [loading, setLoading] = useState(false);
  const [showLoginSuccessToast, setShowLoginSuccessToast] = useState(false);
  const [loginToastAnchor, setLoginToastAnchor] = useState<ToastAnchor | null>(null);
  const submitButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialSuccessMessage) setSuccessMessage(initialSuccessMessage);
  }, [initialSuccessMessage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 입력해 주세요.');
      return;
    }
    setLoading(true);
    try {
      const res = await apiLogin({ email: email.trim(), password });
      localStorage.setItem('token', res.token);
      if (res.name) setUserName(res.name);
      window.dispatchEvent(new CustomEvent('auth-login'));
      const rect = submitButtonRef.current?.getBoundingClientRect();
      if (rect) setLoginToastAnchor({ x: rect.x, y: rect.y, width: rect.width, height: rect.height });
      setShowLoginSuccessToast(true);
      if (onSuccess) onSuccess();
      else navigate('/', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        // 백엔드에서 보낸 JSON 객체 { message: "..." } 처리
        const data = err.data as any;
        const message = typeof data === 'object' && data?.message 
          ? data.message 
          : (typeof data === 'string' ? data : err.message);
        setError(message || '로그인에 실패했습니다.');
      } else {
        setError('로그인에 실패했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => { window.location.href = GOOGLE_LOGIN_URL; };
  const handleNaverLogin = () => { window.location.href = NAVER_LOGIN_URL; };
  const handleKakaoLogin = () => { window.location.href = KAKAO_LOGIN_URL; };

  return (
    <>
      <Toast
        message="로그인 성공"
        visible={showLoginSuccessToast}
        onDismiss={() => { setShowLoginSuccessToast(false); setLoginToastAnchor(null); }}
        anchor={loginToastAnchor}
        placement="above"
      />
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center space-y-1">
        <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-gray-800">
          로그인
        </h2>
        <p className="text-sm text-gray-500">
          아이디와 비밀번호를 입력하거나 소셜 계정으로 로그인하세요.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-[320px] flex flex-col gap-4">
        {successMessage && (
          <p className="text-sm text-green-600 text-center" role="status">{successMessage}</p>
        )}
        {error && (
          <p className="text-sm text-red-600 text-center" role="alert">{error}</p>
        )}
        <div className="space-y-2">
          <label htmlFor="login-email" className="text-sm font-medium text-gray-700">이메일</label>
          <Input
            id="login-email"
            type="email"
            placeholder="이메일을 입력하세요"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            className="h-11 rounded-lg border-gray-300"
            disabled={loading}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="login-password" className="text-sm font-medium text-gray-700">비밀번호</label>
          <Input
            id="login-password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="h-11 rounded-lg border-gray-300"
            disabled={loading}
          />
        </div>
        <div ref={submitButtonRef} className="w-full">
          <Button type="submit" size="lg" className="w-full h-11 rounded-lg font-medium" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </div>
      </form>

      <div className="w-full max-w-[320px] flex items-center justify-center gap-2">
        <span className="text-sm text-gray-500">아직 회원이 아니신가요?</span>
        {onSwitchToSignup ? (
          <button type="button" onClick={onSwitchToSignup} className="text-sm font-semibold text-gray-800 hover:text-black underline underline-offset-2 cursor-pointer">
            회원가입
          </button>
        ) : (
          <button type="button" onClick={() => navigate('/signup')} className="text-sm font-semibold text-gray-800 hover:text-black underline underline-offset-2 cursor-pointer">
            회원가입
          </button>
        )}
      </div>

      <div className="w-full max-w-[320px] flex flex-col gap-3">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-white px-3 text-gray-500">또는</span>
          </div>
        </div>
        <p className="text-center text-sm font-medium text-gray-600">소셜 로그인</p>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={handleGoogleLogin} className={`${socialButtonBase} bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400`}>
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Google로 로그인
          </button>
          <button type="button" onClick={handleNaverLogin} className={`${socialButtonBase} bg-[#03C75A] border-[#03C75A] text-white hover:bg-[#02b350] hover:border-[#02b350]`}>
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M16.273 12.845 7.376 0H0v24h7.727V11.155L16.624 24H24V0h-7.727v12.845z" /></svg>
            네이버로 로그인
          </button>
          <button type="button" onClick={handleKakaoLogin} className={`${socialButtonBase} bg-[#FEE500] border-[#FEE500] text-[#191919] hover:bg-[#f5dc00] hover:border-[#f5dc00]`}>
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden><path fill="currentColor" d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-2.727-.28c-1.458.992-3.722 1.892-6.364 2.597-.238.065-.476.028-.657-.123a.654.654 0 0 1-.248-.727l.954-3.494C2.042 10.41 1.5 8.906 1.5 7.185 1.5 3.664 6.201 3 12 3z" /></svg>
            카카오로 로그인
          </button>
        </div>
      </div>

      {!embedded && (
        <button type="button" onClick={() => navigate('/')} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
          홈으로 돌아가기
        </button>
      )}
    </div>
    </>
  );
}
