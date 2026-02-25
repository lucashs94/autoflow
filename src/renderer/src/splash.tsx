import './globals.css'

import { createRoot } from 'react-dom/client'
import { SplashScreen } from './features/splash/SplashScreen'

createRoot(document.getElementById('splash-root')!).render(<SplashScreen />)
