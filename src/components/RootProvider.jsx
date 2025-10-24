import { ReactNode } from 'react';
import { base } from 'viem/chains';
import { OnchainKitProvider } from '@coinbase/onchainkit';
import '@coinbase/onchainkit/styles.css';
import { ThemeProvider } from '../contexts/ThemeContext';
import { FirebaseProvider } from '../contexts/FirebaseContext';
import ToastProvider from './Toast'

export function RootProvider({ children }) {
  return (
    <ThemeProvider>
      <OnchainKitProvider
        apiKey={import.meta.env.VITE_ONCHAINKIT_API_KEY}
        chain={base}
        config={{
          appearance: {
            mode: 'auto',
          },
          wallet: {
            display: 'modal',
          },
        }}
      >
        <FirebaseProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </FirebaseProvider>
      </OnchainKitProvider>
    </ThemeProvider>
  );
}
