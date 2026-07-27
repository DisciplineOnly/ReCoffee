import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { purgeRetiredStorage } from './lib/legacyStorage'

// Before React mounts: drop storage keys the app no longer writes. The one that
// matters is `recoffee_last_order`, which parked customer PII in localStorage
// indefinitely — it has to be deleted from browsers that already have it, not
// just stopped at the source.
purgeRetiredStorage()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
