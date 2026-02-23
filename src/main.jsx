import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import GCPQuestRPG from '../GCPQuestRPG.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GCPQuestRPG />
  </StrictMode>
)
