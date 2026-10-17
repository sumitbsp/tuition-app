import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/mukta/latin-400.css'
import '@fontsource/mukta/latin-600.css'
import '@fontsource/mukta/latin-800.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
