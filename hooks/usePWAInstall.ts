import { useState, useEffect } from 'react';
import { Platform } from 'react-native';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => void;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface PWAInstallHook {
  canInstall: boolean;         // true si le prompt natif est disponible (Android/desktop)
  isInstalled: boolean;        // true si déjà installée en mode standalone
  isIOS: boolean;              // true si on est sur iOS (instructions manuelles)
  showIOSInstructions: boolean; // true si on doit afficher les instructions iOS
  handleInstall: () => void;   // déclenche le prompt ou affiche les instructions
  dismissIOSInstructions: () => void;
}

export const usePWAInstall = (): PWAInstallHook => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  const isIOS = Platform.OS === 'web' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    // Détecter si déjà installée en standalone
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Écouter le prompt d'installation (Chrome/Android/desktop)
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setCanInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (isIOS) {
      // Sur iOS, afficher les instructions manuelles
      setShowIOSInstructions(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setCanInstall(false);
      }
      setDeferredPrompt(null);
    }
  };

  const dismissIOSInstructions = () => {
    setShowIOSInstructions(false);
  };

  return {
    canInstall,
    isInstalled,
    isIOS,
    showIOSInstructions,
    handleInstall,
    dismissIOSInstructions,
  };
};
