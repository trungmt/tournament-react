import { Route, Routes } from 'react-router-dom';
import './App.css';
import { TopPage, LoginPage, RegisterPage } from './pages/index';
import RequireAuth from './components/RequireAuth/RequireAuth';

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
    </Routes>
  );
}

export default App;
