import { Route, Routes } from 'react-router-dom';
import './App.css';
import { TopPage, LoginPage, RegisterPage } from './pages/index';

function App() {
  return (
    <Routes>
      <Route path="/" element={<TopPage />} />
      <Route path="admin/login" element={<LoginPage />} />
    </Routes>
  );
}

export default App;
