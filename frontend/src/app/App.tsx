import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthModalProvider } from './context/AuthModalContext';
import WelcomeIntro from './components/WelcomeIntro';
import { isLoggedIn } from './utils/auth';

const WELCOME_INTRO_KEY = 'welcome-intro-seen';
const MAIN_APPEAR_DURATION = 2.5;

export default function App() {
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (isLoggedIn()) {
      setShowIntro(false);
      return;
    }
    if (!sessionStorage.getItem(WELCOME_INTRO_KEY)) {
      setShowIntro(true);
    }
  }, []);

  const handleEnter = () => {
    sessionStorage.setItem(WELCOME_INTRO_KEY, 'true');
    setShowIntro(false);
  };

  if (showIntro) {
    return <WelcomeIntro onEnter={handleEnter} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: MAIN_APPEAR_DURATION, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <AuthModalProvider>
        <RouterProvider router={router} />
      </AuthModalProvider>
    </motion.div>
  );
}
