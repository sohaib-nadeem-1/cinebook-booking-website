import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout.jsx';
import AdminLayout from '../layouts/AdminLayout.jsx';
import { RequireAdmin, RequireCustomer, RequirePermission } from './guards.jsx';
import { PageLoader } from '../components/common/States.jsx';

const L = (fn) => lazy(fn);
const Home = L(() => import('../pages/customer/HomePage.jsx'));
const Movies = L(() => import('../pages/customer/MoviesPage.jsx'));
const MovieDetails = L(() => import('../pages/customer/MovieDetailsPage.jsx'));
const Seats = L(() => import('../pages/customer/SeatSelectionPage.jsx'));
const Checkout = L(() => import('../pages/customer/CheckoutPage.jsx'));
const Confirmation = L(() => import('../pages/customer/ConfirmationPage.jsx'));
const MyBookings = L(() => import('../pages/customer/MyBookingsPage.jsx'));
const Profile = L(() => import('../pages/customer/ProfilePage.jsx'));
const Login = L(() => import('../pages/auth/LoginPage.jsx'));
const Register = L(() => import('../pages/auth/RegisterPage.jsx'));
const AdminLogin = L(() => import('../pages/auth/AdminLoginPage.jsx'));
const NotFound = L(() => import('../pages/NotFoundPage.jsx'));
const Dashboard = L(() => import('../pages/admin/DashboardPage.jsx'));
const AdminMovies = L(() => import('../pages/admin/MoviesPage.jsx'));
const AdminShowtimes = L(() => import('../pages/admin/ShowtimesPage.jsx'));
const AdminBookings = L(() => import('../pages/admin/BookingsPage.jsx'));
const AdminUsers = L(() => import('../pages/admin/UsersPage.jsx'));
const AdminSettings = L(() => import('../pages/admin/SettingsPage.jsx'));

const guard = (perm, el) => <RequirePermission perm={perm}>{el}</RequirePermission>;

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route element={<CustomerLayout />}>
          <Route index element={<Home />} />
          <Route path="movies" element={<Movies />} />
          <Route path="movies/:slug" element={<MovieDetails />} />
          <Route path="booking/:showtimeId/seats" element={<Seats />} />
          <Route element={<RequireCustomer allowGuest />}>
            <Route path="checkout" element={<Checkout />} />
            <Route path="booking-confirmation" element={<Confirmation />} />
          </Route>
          <Route element={<RequireCustomer />}>
            <Route path="my-bookings" element={<MyBookings />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        <Route path="/admin" element={<RequireAdmin />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={guard('dashboard', <Dashboard />)} />
            <Route path="movies" element={guard('movies', <AdminMovies />)} />
            <Route path="showtimes" element={guard('showtimes', <AdminShowtimes />)} />
            <Route path="bookings" element={guard('bookings', <AdminBookings />)} />
            <Route path="users" element={guard('users', <AdminUsers />)} />
            <Route path="settings" element={guard('settings', <AdminSettings />)} />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>
        <Route element={<CustomerLayout />}><Route path="*" element={<NotFound />} /></Route>
      </Routes>
    </Suspense>
  );
}
