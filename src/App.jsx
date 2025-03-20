
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { UnsafeBurnerWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
    WalletModalProvider,
    WalletDisconnectButton,
    WalletMultiButton
} from '@solana/wallet-adapter-react-ui';

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';



import './App.css'
import { TokenLaunchpad } from './components/TokenLaunchpad'

function App() {
  return (
    <ConnectionProvider endpoint='https://api.devnet.solana.com'>
      <WalletProvider wallets={[]}>
        <WalletModalProvider>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: 20
        }}>
        <WalletMultiButton></WalletMultiButton>
        <WalletDisconnectButton></WalletDisconnectButton>
        </div>
        
           <TokenLaunchpad></TokenLaunchpad>

        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App
