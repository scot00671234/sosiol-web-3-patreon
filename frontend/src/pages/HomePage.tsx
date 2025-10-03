import { FC, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { Zap, Shield, Coins } from 'lucide-react';
import BackgroundGlare from '../components/BackgroundGlare';

const HomePage: FC = () => {
  const { connected } = useWallet();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (containerRef.current) {
        const scrolled = window.pageYOffset;
        const parallax = scrolled * 0.5;
        containerRef.current.style.transform = `translateY(${parallax}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <BackgroundGlare>
      <div className="space-y-20">
      {/* Hero Section */}
      <section className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center space-y-8">
            <h1 className="text-5xl lg:text-7xl font-arial leading-tight tracking-tight text-gray-900 dark:text-white">
              Support creators.
              <br />
              Simple. Fast. On Solana.
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Tip and subscribe with USDC. A minimal, modern experience for fans and creators.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <Link to="/explore" className="btn btn-primary px-8 py-4 text-base">
                Explore creators
              </Link>
              {connected && (
                <Link to="/dashboard" className="btn btn-outline px-8 py-4 text-base">
                  Creator
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-4xl lg:text-5xl font-light mb-6 text-gray-900 dark:text-white">Why Sosiol?</h2>
          <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">Built for the future of the creator economy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(14,165,233,0.3)] group-hover:shadow-[0_12px_40px_rgba(14,165,233,0.4)] transition-all duration-300">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-medium mb-4 text-gray-900 dark:text-white">Lightning fast</h3>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">Solana speed with minimal fees. Transactions complete in seconds, not minutes.</p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(34,197,94,0.3)] group-hover:shadow-[0_12px_40px_rgba(34,197,94,0.4)] transition-all duration-300">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-medium mb-4 text-gray-900 dark:text-white">Secure</h3>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">Self-custody wallets. You stay in complete control of your funds.</p>
          </div>

          <div className="text-center group">
            <div className="w-16 h-16 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-[0_8px_30px_rgba(168,85,247,0.3)] group-hover:shadow-[0_12px_40px_rgba(168,85,247,0.4)] transition-all duration-300">
              <Coins className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-medium mb-4 text-gray-900 dark:text-white">Stable payments</h3>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">Use USDC to avoid volatility. Your support maintains its value.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl lg:text-5xl font-light mb-6 text-gray-900 dark:text-white">How it works</h2>
            <p className="text-xl text-gray-500 dark:text-gray-400">Simple, transparent, and powerful</p>
          </div>

          <div className="space-y-16">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-[0_8px_30px_rgba(14,165,233,0.3)]">
                  <span className="text-2xl font-bold text-white">1</span>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl font-medium mb-4 text-gray-900 dark:text-white">Connect Wallet</h3>
                <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                  Use Phantom, Slope, or any Solana wallet to get started. Your keys, your crypto.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row-reverse items-center gap-12">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center shadow-[0_8px_30px_rgba(34,197,94,0.3)]">
                  <span className="text-2xl font-bold text-white">2</span>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl font-medium mb-4 text-gray-900 dark:text-white">Find Creators</h3>
                <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                  Browse and discover amazing creators to support. From artists to educators.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="flex-shrink-0">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-[0_8px_30px_rgba(168,85,247,0.3)]">
                  <span className="text-2xl font-bold text-white">3</span>
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-3xl font-medium mb-4 text-gray-900 dark:text-white">Support with USDC</h3>
                <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed">
                  Send tips or subscribe with stable cryptocurrency. No volatility, just value.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-16 text-center text-white shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
          <h2 className="text-4xl lg:text-5xl font-light mb-6">Ready to get started?</h2>
          <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the next generation of creator economy powered by Solana.
          </p>
          <Link to="/explore" className="btn btn-primary px-10 py-4 text-lg inline-flex items-center shadow-[0_8px_30px_rgba(14,165,233,0.4)] hover:shadow-[0_12px_40px_rgba(14,165,233,0.5)]">
            Explore creators
          </Link>
        </div>
      </section>
      </div>
    </BackgroundGlare>
  );
};

export default HomePage;

