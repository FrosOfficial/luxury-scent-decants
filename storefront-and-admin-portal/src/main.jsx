import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { InquiryBagProvider } from './contexts/InquiryBagContext'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <InquiryBagProvider>
        <App />
        <Analytics />
        <SpeedInsights />
      </InquiryBagProvider>
    </AuthProvider>
  </React.StrictMode>,
)
