import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import DashBoardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import PageEditor from "./pages/PageEditor";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/navbar";

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

function App() {
  return (
    <>
      {/* we are making routes in the frontend that connects the pages and components */}
      <BrowserRouter>
        <Routes>
          {/* we use navigat in the  / cause dashboard is protected and if we simply  <dashboard people will surpass the authentication > */}
            <Route path="/login" element={<LoginPage></LoginPage>} />
            <Route path="/register" element={<RegisterPage></RegisterPage>} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

          <Route element={<Layout /> }>
            <Route path="/" element={<Navigate to="/dashboard"></Navigate>} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashBoardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/page/:id"
              element={
                <ProtectedRoute>
                  <PageEditor />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
