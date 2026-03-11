import React from 'react';
import { useNavigate } from 'react-router';
import { Layout } from '../components/ui/Layout';
import { HostSpaceListContent } from './HostSpaceList';

export default function HostSpaces() {
  const navigate = useNavigate();
  return (
    <Layout onLogoClick={() => navigate('/')}>
      <HostSpaceListContent />
    </Layout>
  );
}
