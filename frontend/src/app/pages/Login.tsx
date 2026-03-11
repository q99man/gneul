import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Layout } from '../components/ui/Layout';
import { LoginForm } from '../components/auth/LoginForm';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (searchParams.get('signedup') === '1') {
      setSuccessMessage('회원가입이 완료되었습니다. 로그인해 주세요.');
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <Layout onLogoClick={() => navigate('/')}>
      <div className="w-full max-w-md mx-auto flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <LoginForm successMessage={successMessage || undefined} />
      </div>
    </Layout>
  );
}
