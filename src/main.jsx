import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { InquiryBagProvider } from './contexts/InquiryBagContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <InquiryBagProvider>
        <App />
      </InquiryBagProvider>
    </AuthProvider>
  </React.StrictMode>,
)
