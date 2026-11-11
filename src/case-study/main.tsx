import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/inter'
import '../index.css'
import { CaseStudy } from './CaseStudy.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CaseStudy />
  </StrictMode>,
)
