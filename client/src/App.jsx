import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import {
  LayoutDashboard,
  ClipboardList,
  UtensilsCrossed,
  UserCircle,
  Users,
  Store,
  Wallet,
} from "lucide-react";

import MainLayout from "./layouts/MainLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import CatererListingPage from "./pages/CatererListingPage";
import CatererDetailsPage from "./pages/CatererDetailsPage";
import BookingDetailsPage from "./pages/BookingDetailsPage";
import MyBookingsPage from "./pages/MyBookingsPage";
import HowItWorksPage from "./pages/HowItWorksPage";
import NotFoundPage from "./pages/NotFoundPage";
import { AboutPage, ContactPage, TermsPage } from "./pages/StaticPages";

import CustomerDashboardPage from "./pages/customer/CustomerDashboardPage";

import CatererDashboardPage from "./pages/caterer/CatererDashboardPage";
import CatererBookingsPage from "./pages/caterer/CatererBookingsPage";
import CatererMenuPage from "./pages/caterer/CatererMenuPage";
import CatererProfilePage from "./pages/caterer/CatererProfilePage";

import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminCaterersPage from "./pages/admin/AdminCaterersPage";
import AdminBookingsPage from "./pages/admin/AdminBookingsPage";

const catererLinks = [
  { to: "/caterer/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/caterer/bookings", label: "Bookings", icon: ClipboardList },
  { to: "/caterer/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/caterer/profile", label: "Profile", icon: UserCircle },
];

const adminLinks = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/caterers", label: "Caterers", icon: Store },
  { to: "/admin/bookings", label: "Bookings", icon: Wallet },
];

function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { fontSize: "14px" } }} />
      <Routes>
        {/* Public site */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/caterers" element={<CatererListingPage />} />
          <Route path="/caterers/:id" element={<CatererDetailsPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/terms" element={<TermsPage />} />

          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute allowedRoles={["customer"]}>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings/:id"
            element={
              <ProtectedRoute>
                <BookingDetailsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Customer dashboard */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <DashboardLayout
                title="Customer"
                links={[
                  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
                  { to: "/my-bookings", label: "My Bookings", icon: ClipboardList },
                  { to: "/caterers", label: "Find Caterers", icon: UtensilsCrossed },
                ]}
              />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<CustomerDashboardPage />} />
        </Route>

        {/* Caterer dashboard */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["caterer"]}>
              <DashboardLayout title="Caterer" links={catererLinks} />
            </ProtectedRoute>
          }
        >
          <Route path="/caterer/dashboard" element={<CatererDashboardPage />} />
          <Route path="/caterer/bookings" element={<CatererBookingsPage />} />
          <Route path="/caterer/menu" element={<CatererMenuPage />} />
          <Route path="/caterer/profile" element={<CatererProfilePage />} />
        </Route>

        {/* Admin dashboard */}
        <Route
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout title="Admin" links={adminLinks} />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/caterers" element={<AdminCaterersPage />} />
          <Route path="/admin/bookings" element={<AdminBookingsPage />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
