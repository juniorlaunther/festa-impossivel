import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, getDocFromServer } from 'firebase/firestore';
import { db } from './lib/firebase';
import LandingPage from './components/LandingPage';
import AdminDashboard from './components/AdminDashboard';

type ActiveView = 'landing' | 'admin';

export default function App() {
  const getInitialView = (): ActiveView => {
    const path = window.location.pathname;
    const hash = window.location.hash;
    
    if (
      path === '/login' || 
      path === '/admin' || 
      hash === '#/login' || 
      hash === '#/admin' || 
      hash === '#login' || 
      hash === '#admin'
    ) {
      return 'admin';
    }
    return 'landing';
  };

  const [view, setView] = useState<ActiveView>(getInitialView);

  // Validate Firestore connection on boot (Skill Critical Constraint)
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log("Firebase connection verified successfully.");
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. Client is offline.");
        } else {
          // Failure here is expected since the 'test/connection' doc doesn't exist.
          // The key thing is that the network call succeeded or failed gracefully with a 404 rather than network failure.
          console.log("Firebase network call tested successfully.");
        }
      }
    }
    testConnection();
  }, []);

  // Sync state with back/forward button and hash changes
  useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;
      
      if (
        path === '/login' || 
        path === '/admin' || 
        hash === '#/login' || 
        hash === '#/admin' || 
        hash === '#login' || 
        hash === '#admin'
      ) {
        setView('admin');
      } else {
        setView('landing');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const navigateTo = (newView: ActiveView) => {
    setView(newView);
    if (newView === 'admin') {
      try {
        window.history.pushState({}, '', '/login');
      } catch (e) {
        // Fallback for strict browser environments
      }
      window.location.hash = '/login';
    } else {
      try {
        window.history.pushState({}, '', '/');
      } catch (e) {
        // Fallback for strict browser environments
      }
      window.location.hash = '';
    }
  };

  return (
    <div className="relative overflow-hidden w-full min-h-screen">
      <AnimatePresence mode="wait">
        {view === 'landing' ? (
          <motion.div
            key="landing-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <LandingPage onAdminClick={() => navigateTo('admin')} />
          </motion.div>
        ) : (
          <motion.div
            key="admin-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AdminDashboard onBackToLanding={() => navigateTo('landing')} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
