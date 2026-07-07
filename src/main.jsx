import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/global.css';
import './styles/layout.css';
import './styles/auth.css';
import './styles/home.css';
import './styles/find-tutors.css';
import './styles/teacher-detail.css';
import './styles/bookings.css';
import './styles/dashboard.css';
import './styles/chat.css';
import './styles/notifications.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
