import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Ticker from './components/layout/Ticker';

// Pages
import HomePage from './pages/HomePage';
import ServiceDetailPage from './pages/ServiceDetailPage';
import ServicesPage from './pages/ServicesPage';
import BookingsPage from './pages/BookingsPage';
import TechniciansPage from './pages/TechniciansPage';
import InvoicePage from './pages/InvoicePage';
import TokenQueuePage from './pages/admin/TokenQueuePage';
import AdminSectorsPage from './pages/admin/AdminSectorsPage';
import AdminServicesPage from './pages/admin/AdminServicesPage';

// Routes
import PrivateRoute from './routes/PrivateRoute';
import AdminRoute from './routes/AdminRoute';
import ServiceCenterRoute from './routes/ServiceCenterRoute';
import TechnicianRoute from './routes/TechnicianRoute';
import TechnicianDashboard from './pages/technician/TechnicianDashboard';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Ticker />
          <Navbar />

          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:catId" element={<ServiceDetailPage />} />
              <Route path="/bookings" element={<PrivateRoute><BookingsPage /></PrivateRoute>} />
              <Route path="/technicians" element={<PrivateRoute><TechniciansPage /></PrivateRoute>} />
              <Route path="/invoice" element={<PrivateRoute><InvoicePage /></PrivateRoute>} />
              <Route path="/admin/bookings" element={<AdminRoute><TokenQueuePage /></AdminRoute>} />
              <Route path="/admin/sectors" element={<AdminRoute><AdminSectorsPage /></AdminRoute>} />
              <Route path="/admin/services" element={<AdminRoute><AdminServicesPage /></AdminRoute>} />
              <Route path="/service-center/bookings" element={<ServiceCenterRoute><TokenQueuePage /></ServiceCenterRoute>} />
              <Route path="/technician/bookings" element={<TechnicianRoute><TechnicianDashboard /></TechnicianRoute>} />
            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
