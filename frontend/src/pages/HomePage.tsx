import { FC } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '@solana/wallet-adapter-react';
import { ArrowRight, Zap, Shield, Coins, Globe } from 'lucide-react';

const HomePage: FC = () => {
  const { connected } = useWallet();

  return (
    <div className="space-y-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="text-center space-y-8">
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Support Creators with
              <br />
              <span className="text-primary-200">Web3 & USDC</span>
            </h1>
            <p className="text-xl lg:text-2xl text-primary-100 max-w-3xl mx-auto">
              The first decentralized creator platform powered by Solana. 
              Fast, secure, and transparent.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/explore" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg">
                Explore Creators
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              {connected && (
                <Link to="/dashboard" className="btn btn-outline border-white text-white hover:bg-white hover:text-primary-600 px-8 py-4 text-lg">
                  Create Profile
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Sosiol?</h2>
          <p className="text-xl text-gray-600">Built for the future of creator economy</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="card text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <Zap className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Lightning Fast</h3>
            <p className="text-gray-600">
              Built on Solana for instant transactions with minimal fees
            </p>
          </div>

          <div className="card text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
              <Shield className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Secure</h3>
            <p className="text-gray-600">
              Your funds are always in your custody with Web3 wallets
            </p>
          </div>

          <div className="card text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <Coins className="h-8 w-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Stable Payments</h3>
            <p className="text-gray-600">
              Use USDC stablecoin to avoid cryptocurrency volatility
            </p>
          </div>

          <div className="card text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 rounded-full mb-4">
              <Globe className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Global Access</h3>
            <p className="text-gray-600">
              No borders, no banks. Support creators anywhere in the world
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600">Simple, transparent, and powerful</p>
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
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-12 text-center text-white">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join the next generation of creator economy powered by blockchain technology
          </p>
          <Link to="/explore" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg inline-flex items-center">
            Explore Creators
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

