import { Routes, Route } from 'react-router-dom';
import { Providers } from './providers';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import MyOrdersPage from './pages/MyOrdersPage';
import { AppHeader } from './components/AppHeader';

export default function App() {
  return (
    <Providers>
      <AppHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/my-orders" element={<MyOrdersPage />} />
      </Routes>
    </Providers>
  );
}