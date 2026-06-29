import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'

// Font Awesome 아이콘 전체 스타일 임포트
import '@fortawesome/fontawesome-free/css/all.min.css';
// BootStrap icons 전체 스타일 임포트
import 'bootstrap-icons/font/bootstrap-icons.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)