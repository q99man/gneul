import React from 'react';
import { useNavigate } from 'react-router';
import { Layout } from '../components/ui/Layout';
import { SignupForm } from '../components/auth/SignupForm';

export default function Signup() {
  const navigate = useNavigate();

  return (
    <Layout onLogoClick={() => navigate('/')}>
      <div className="w-full max-w-md mx-auto flex flex-col items-center min-h-[60vh] gap-6 py-8">
        <SignupForm />
      </div>
    </Layout>
  );
}
