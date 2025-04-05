import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from "./App";
import PasswordResetPage from "./PasswordresetPage";
import Hostel from "./Hostel";
import HDash from "./HDash";
import SDash from "./SDash";
import SProfile from "./SProfile";
import WProfile from "./WProfile";
import Wmain from "./Wmain";
import PDash from "./PDash";
import ProtectedRoute from './auth/ProtectedRoute';
import { AuthProvider } from './auth/AuthContext';

const AppRouter = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/passwordreset" element={<PasswordResetPage />} />
        <Route path="/reset" element={<PasswordResetPage />} />

        {/* Student */}
        <Route path="/SDash" element={
          <ProtectedRoute allowedRoles={['student']}>
            <SDash />
          </ProtectedRoute>
        } />
        <Route path="/SProfile" element={
          <ProtectedRoute allowedRoles={['student']}>
            <SProfile />
          </ProtectedRoute>
        } />

        {/* Warden */}
        <Route path="/Wmain" element={
          <ProtectedRoute allowedRoles={['warden']}>
            <Wmain />
          </ProtectedRoute>
        } />
        <Route path="/WProfile" element={
          <ProtectedRoute allowedRoles={['warden']}>
            <WProfile />
          </ProtectedRoute>
        } />

        {/* Hostel Staff */}
        <Route path="/HDash" element={
          <ProtectedRoute allowedRoles={['hostel_staff']}>
            <HDash />
          </ProtectedRoute>
        } />
        <Route path="/hostel" element={
          <ProtectedRoute allowedRoles={['hostel_staff']}>
            <Hostel />
          </ProtectedRoute>
        } />

        {/* Worker */}
        <Route path="/PDash" element={
          <ProtectedRoute allowedRoles={['worker']}>
            <PDash />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  </AuthProvider>
);

export default AppRouter;
