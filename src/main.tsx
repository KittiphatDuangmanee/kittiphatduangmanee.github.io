import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.tsx'
import { forcedReducedMotion } from './lib/motion-preference.ts'
import './styles/index.css'

if (forcedReducedMotion) {
  document.documentElement.setAttribute('data-motion', 'reduce')
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
