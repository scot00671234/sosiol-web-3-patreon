import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArrowRight, Zap, Shield, Coins, Globe } from 'lucide-react';

const HomePage: FC = () => {
  const { connected } = useWallet();

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center space-y-8">
            <h1 className="text-5xl lg:text-7xl font-semibold leading-tight tracking-tight text-gray-900 dark:text-white">
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
                <ArrowRight className="ml-2 h-5 w-5" />
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
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-semibold mb-3 text-gray-900 dark:text-white">Why Sosiol?</h2>
          <p className="text-lg text-gray-600 dark:text-gray-300">Built for the future of the creator economy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          <div className="card text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-3">
              <Zap className="h-7 w-7 text-gray-900 dark:text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Lightning fast</h3>
            <p className="text-gray-600 dark:text-gray-300">Solana speed with minimal fees.</p>
          </div>

          <div className="card text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-3">
              <Shield className="h-7 w-7 text-gray-900 dark:text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Secure</h3>
            <p className="text-gray-600 dark:text-gray-300">Self-custody wallets. You stay in control.</p>
          </div>

          <div className="card text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-3">
              <Coins className="h-7 w-7 text-gray-900 dark:text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Stable payments</h3>
            <p className="text-gray-600 dark:text-gray-300">Use USDC to avoid volatility.</p>
          </div>

          <div className="card text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-100 rounded-full mb-3">
              <Globe className="h-7 w-7 text-gray-900 dark:text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-1 text-gray-900 dark:text-white">Global access</h3>
            <p className="text-gray-600 dark:text-gray-300">Support creators anywhere in the world.</p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 dark:bg-[#0f1620] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-semibold mb-3 text-gray-900 dark:text-white">How it works</h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">Simple, transparent, and powerful</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full text-2xl font-bold mb-4">
                1
              </div>
              <h3 className="text-xl font-bold mb-2">Connect Wallet</h3>
              <p className="text-gray-600">
                Use Phantom, Slope, or any Solana wallet to get started
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full text-2xl font-bold mb-4">
                2
              </div>
              <h3 className="text-xl font-bold mb-2">Find Creators</h3>
              <p className="text-gray-600">
                Browse and discover amazing creators to support
              </p>
            </div>

            <div className="bg-white rounded-xl p-8 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full text-2xl font-bold mb-4">
                3
              </div>
              <h3 className="text-xl font-bold mb-2">Support with USDC</h3>
              <p className="text-gray-600">
                Send tips or subscribe with stable cryptocurrency
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gray-900 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-semibold mb-3">Ready to get started?</h2>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the next generation of creator economy powered by Solana.
          </p>
          <Link to="/explore" className="btn btn-primary px-8 py-4 text-base inline-flex items-center">
            Explore creators
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

