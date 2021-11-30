import { Route, Routes } from 'react-router-dom';
import './App.css';
import { TopPage, LoginPage, RegisterPage, AdminTopPage } from './pages/index';
import { RequireAuth } from './components/index';

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <RequireAuth>
            <TopPage />
          </RequireAuth>
        }
      />
      <Route path="admin/login" element={<LoginPage />} />
      <Route path="register" element={<RegisterPage />} />

      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminTopPage />
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
