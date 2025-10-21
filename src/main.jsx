//import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { RootProvider } from './components/RootProvider.jsx'

createRoot(document.getElementById('root')).render(
  <RootProvider>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </RootProvider>,
)
