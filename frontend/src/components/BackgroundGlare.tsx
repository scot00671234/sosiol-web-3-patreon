import { FC, ReactNode, useEffect, useRef } from 'react';

interface BackgroundGlareProps {
  children: ReactNode;
  centerBoost?: boolean;
}

const BackgroundGlare: FC<BackgroundGlareProps> = ({ children, centerBoost = false }) => {
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!layerRef.current) return;
      const y = window.pageYOffset * 0.5;
      layerRef.current.style.transform = `translateY(${y}px)`;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="relative">
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute inset-0 bg-white dark:bg-gray-900"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-900/30 dark:to-transparent"></div>
        <div ref={layerRef} className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/20 dark:bg-blue-500/50 rounded-full blur-3xl"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-blue-500/15 dark:bg-blue-400/40 rounded-full blur-3xl"></div>
          <div className="absolute bottom-40 left-1/4 w-80 h-80 bg-blue-600/10 dark:bg-blue-300/35 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-1/3 w-64 h-64 bg-blue-300/25 dark:bg-blue-600/45 rounded-full blur-3xl"></div>
          {centerBoost && (
            <>
              <div className="absolute top-1/3 -left-20 w-[34rem] h-[34rem] bg-blue-400/25 dark:bg-blue-500/45 rounded-full blur-[120px]"></div>
              <div className="absolute top-1/2 -right-24 w-[36rem] h-[36rem] bg-blue-300/25 dark:bg-blue-600/40 rounded-full blur-[130px]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-[60rem] h-[60rem] bg-blue-400/15 dark:bg-blue-500/25 rounded-full blur-[160px]"></div>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default BackgroundGlare;


