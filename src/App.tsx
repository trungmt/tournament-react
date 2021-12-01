import { Route, Routes } from 'react-router-dom';
import './App.css';
import { TopPage, LoginPage, RegisterPage, AdminTopPage } from './pages/index';
import { RequireAuth } from './components/index';
import ThemeConfig from './theme';

function App() {
  return (
    <ThemeConfig>
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
    </ThemeConfig>
  );
}

export default App;
