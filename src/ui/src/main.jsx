import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Game from './Game.jsx'
import { ToastProvider } from './ToastContext.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <ToastProvider>
            <Game />
        </ToastProvider>
    </StrictMode>,
)
