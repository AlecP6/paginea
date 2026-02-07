import Image from 'next/image';

export default function PageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="flex flex-col items-center space-y-6">
        {/* Logo avec animation heartbeat */}
        <div className="relative animate-heartbeat">
          <Image
            src="/logo.png"
            alt="Paginea Logo"
            width={120}
            height={120}
            className="drop-shadow-2xl"
            priority
          />
          {/* Effet de glow pulsant */}
          <div className="absolute inset-0 animate-pulse-glow">
            <div className="w-full h-full bg-primary-500/20 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Texte de chargement */}
        <div className="flex flex-col items-center space-y-2">
          <p className="text-white text-lg font-semibold animate-pulse">
            Chargement...
          </p>
          
          {/* Points de chargement animés */}
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
