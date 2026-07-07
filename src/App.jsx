import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import FindTutors from './pages/FindTutors';
import TeacherProfile from './pages/TeacherProfile';
import Bookings from './pages/Bookings';
import Wishlist from './pages/Wishlist';
import Chat from './pages/Chat';
import Notifications from './pages/Notifications';
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AccountSettings from './pages/AccountSettings';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/find-tutors" element={<FindTutors />} />
            <Route path="/teachers/:id" element={<TeacherProfile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route path="/student/dashboard" element={<ProtectedRoute role="student"><StudentDashboard /></ProtectedRoute>} />
            <Route path="/teacher/dashboard" element={<ProtectedRoute role="teacher"><TeacherDashboard /></ProtectedRoute>} />
            <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
            <Route path="/wishlist" element={<ProtectedRoute role="student"><Wishlist /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
            <Route path="/account-settings" element={<ProtectedRoute><AccountSettings /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
