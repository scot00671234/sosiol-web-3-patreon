import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from './context/WalletContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import CreatorPage from './pages/CreatorPage';
import DashboardPage from './pages/DashboardPage';
import ExplorePage from './pages/ExplorePage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <WalletProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/creator/:username" element={<CreatorPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </WalletProvider>
  );
}

export default App;

