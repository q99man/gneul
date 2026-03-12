import React from 'react';
import { useNavigate } from 'react-router';
import { HostSpaceListContent } from './HostSpaceList';
import { HostSpaceShell } from './HostSpaceShell';

export default function HostSpaces() {
  const navigate = useNavigate();
  return (
    <HostSpaceShell onClose={() => navigate('/')}>
      <div className="px-4 py-6 md:px-6 md:py-8">
        <div className="mx-auto w-full max-w-7xl">
          <HostSpaceListContent />
        </div>
      </div>
    </HostSpaceShell>
  );
}
