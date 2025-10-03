import { FC, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Home, Compass, Moon, Sun } from 'lucide-react';
import { APP_NAME } from '../config/constants';
import { useEffect, useState } from 'react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const enableDark = saved ? saved === 'dark' : prefersDark;
    setIsDark(enableDark);
    document.documentElement.classList.toggle('dark', enableDark);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/explore', label: 'Explore', icon: Compass },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-transparent sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="my-3 bg-white backdrop-blur rounded-2xl border border-gray-200 shadow-md">
            <div className="flex items-center justify-between h-14 px-3 sm:px-4">
              {/* Left: Logo */}
              <Link to="/" className="flex items-center space-x-2">
                <img src="/logo.svg" alt="Logo" className="h-7 w-7" />
                <span className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900">{APP_NAME}</span>
              </Link>

              {/* Center: Nav */}
              <nav className="hidden md:flex items-center">
                <div className="flex items-center gap-2">
                  {[{ path: '/', label: 'Home' }, { path: '/dashboard', label: 'Creator' }, { path: '/explore', label: 'Explore' }].map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`px-6 py-2 text-sm font-medium transition-all ${
                          isActive
                            ? 'text-gray-900 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                            : 'text-gray-500 hover:text-gray-700 hover:shadow-[0_0_10px_rgba(14,165,233,0.2)]'
                        }`}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* Right: Toggle + Wallet */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={toggleTheme}
                  className="hidden md:inline-flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700"
                  aria-label="Toggle theme"
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <WalletMultiButton />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 dark:border-gray-800">
          <nav className="flex justify-around py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 ${
                    isActive
                      ? 'text-primary-600'
                      : 'text-gray-600 dark:text-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
            <button
              onClick={() => navigate('/dashboard')}
              className="flex flex-col items-center space-y-1 px-3 py-2 text-gray-600 dark:text-gray-300"
            >
              <span className="text-xs font-medium">Creator</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="/logo.svg" alt="Logo" className="h-6 w-6" />
                <span className="text-xl font-bold">{APP_NAME}</span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering creators with Web3 technology on Solana.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/explore" className="hover:text-white transition-colors">Explore Creators</Link></li>
                <li><Link to="/dashboard" className="hover:text-white transition-colors">Creator Dashboard</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Powered By</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Solana Blockchain</li>
                <li>USDC Stablecoin</li>
                <li>Web3 Wallets</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2025 {APP_NAME}. Built with ❤️ for creators.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;

