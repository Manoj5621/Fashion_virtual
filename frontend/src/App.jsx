import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import VirtualTryOnPage from './components/VirtualTryOnPage';
import Login from './components/Login';
import Signup from './components/Signup';
import { AuthProvider, useAuth } from './AuthContext';
import Gallery from './components/Gallery';
import { App as AntdApp } from 'antd';

function AppContent() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn && location.pathname !== '/signup') {
    return <Login />;
  }

  return (
    <Routes>
      <Route path="/signup" element={<Signup />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/try-on" element={<VirtualTryOnPage />} />
      <Route path="/gallery" element={<Gallery />} />
    </Routes>
  );
}

function App() {
  return (
    <AntdApp>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </AntdApp>
  );
}

export default App;