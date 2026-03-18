import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { X, Download, Monitor, Smartphone } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the customized install prompt after a short delay
      const hasDismissed = localStorage.getItem('pwa-prompt-dismissed');
      if (!hasDismissed) {
        setTimeout(() => setIsVisible(true), 3000);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Remember dismissal for 7 days
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString());
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center pointer-events-none p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-md pointer-events-auto"
        >
          <div className="w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden group">
          {/* Decorative gradient overlay */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
          
          <button 
            onClick={handleDismiss}
            className="absolute top-4 right-4 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 animate-pulse">
              <img 
                src="pwa-192x192.png" 
                alt="App Icon" 
                className="w-12 h-12 rounded-lg shadow-md group-hover:scale-110 transition-transform duration-300"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'favicon.svg';
                }}
              />
            </div>
            
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                Kigezi Vet
                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">Native App</span>
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Install our app for a faster experience, offline access, and instant veterinary notifications.
              </p>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleInstallClick}
                  className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl py-5 shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Install Now
                </Button>
                <div className="hidden sm:flex items-center gap-2 text-[10px] text-muted-foreground">
                    <div className="flex flex-col items-center">
                        <Smartphone className="w-3 h-3" />
                        <span>Mobile</span>
                    </div>
                    <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800" />
                    <div className="flex flex-col items-center">
                        <Monitor className="w-3 h-3" />
                        <span>Desktop</span>
                    </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-muted-foreground italic">
            <span>Free • No storage limit • Updates automatically</span>
          </div>
        </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default InstallPrompt;
