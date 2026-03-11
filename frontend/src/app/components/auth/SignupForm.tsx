import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { signup as apiSignup } from '../../api/member';
import { ApiError } from '../../api/ApiError';

const PHONE_REGEX = /^01(?:0|1|[6-9])-(?:\d{3}|\d{4})-\d{4}$/;

type SignupFormProps = {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
  embedded?: boolean;
};

export function SignupForm({ onSuccess, onSwitchToLogin, embedded = false }: SignupFormProps) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) { setError('이름을 입력해 주세요.'); return; }
    if (!email.trim()) { setError('이메일을 입력해 주세요.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('올바른 이메일 형식이 아닙니다.'); return; }
    if (!password) { setError('비밀번호를 입력해 주세요.'); return; }
    if (password.length < 8 || password.length > 16) { setError('비밀번호는 8자 이상 16자 이하로 입력해 주세요.'); return; }
    if (!address.trim()) { setError('주소를 입력해 주세요.'); return; }
    if (!phoneNumber.trim()) { setError('전화번호를 입력해 주세요.'); return; }
    if (!PHONE_REGEX.test(phoneNumber.trim())) { setError('전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)'); return; }

    setLoading(true);
    try {
      await apiSignup({ name: name.trim(), email: email.trim(), password, address: address.trim(), phoneNumber: phoneNumber.trim() });
      if (onSuccess) onSuccess();
      else navigate('/login?signedup=1', { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        const message = typeof err.data === 'string' ? err.data : err.message;
        setError(message || '회원가입에 실패했습니다.');
      } else setError('회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="text-center space-y-1">
        <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-gray-800">회원가입</h2>
        <p className="text-sm text-gray-500">아래 항목을 입력해 주세요.</p>
      </div>

      <form onSubmit={handleSubmit} className="w-full max-w-[320px] flex flex-col gap-4">
        {error && <p className="text-sm text-red-600 text-center" role="alert">{error}</p>}
        <div className="space-y-2">
          <label htmlFor="signup-name" className="text-sm font-medium text-gray-700">이름 <span className="text-red-500">*</span></label>
          <Input id="signup-name" type="text" placeholder="이름을 입력하세요" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className="h-11 rounded-lg border-gray-300" disabled={loading} />
        </div>
        <div className="space-y-2">
          <label htmlFor="signup-email" className="text-sm font-medium text-gray-700">이메일 <span className="text-red-500">*</span></label>
          <Input id="signup-email" type="email" placeholder="example@email.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className="h-11 rounded-lg border-gray-300" disabled={loading} />
        </div>
        <div className="space-y-2">
          <label htmlFor="signup-password" className="text-sm font-medium text-gray-700">비밀번호 <span className="text-red-500">*</span></label>
          <Input id="signup-password" type="password" placeholder="8자 이상 16자 이하" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" className="h-11 rounded-lg border-gray-300" disabled={loading} />
        </div>
        <div className="space-y-2">
          <label htmlFor="signup-address" className="text-sm font-medium text-gray-700">주소 <span className="text-red-500">*</span></label>
          <Input id="signup-address" type="text" placeholder="주소를 입력하세요" value={address} onChange={(e) => setAddress(e.target.value)} autoComplete="street-address" className="h-11 rounded-lg border-gray-300" disabled={loading} />
        </div>
        <div className="space-y-2">
          <label htmlFor="signup-phone" className="text-sm font-medium text-gray-700">전화번호 <span className="text-red-500">*</span></label>
          <Input id="signup-phone" type="tel" placeholder="010-1234-5678" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} autoComplete="tel" className="h-11 rounded-lg border-gray-300" disabled={loading} />
        </div>
        <Button type="submit" size="lg" className="w-full h-11 rounded-lg font-medium" disabled={loading}>
          {loading ? '가입 처리 중...' : '회원가입'}
        </Button>
      </form>

      {onSwitchToLogin ? (
        <button type="button" onClick={onSwitchToLogin} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
          이미 계정이 있으신가요? 로그인
        </button>
      ) : (
        <button type="button" onClick={() => navigate('/login')} className="text-sm text-gray-500 hover:text-gray-700 cursor-pointer">
          이미 계정이 있으신가요? 로그인
        </button>
      )}
    </div>
  );
}
