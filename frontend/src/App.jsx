import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import { TryOnPage } from './components/virtual';
import Login from './components/Login';
import Signup from './components/Signup';
import { AuthProvider, useAuth } from './AuthContext';

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
      <Route path="/try-on" element={<TryOnPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;