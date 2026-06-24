import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutEmailPage from './pages/CheckoutEmailPage';
import CheckoutProfilePage from './pages/CheckoutProfilePage';
import AdminPage from './pages/admin/AdminPage';
import ConfigurarPrecosPage from './pages/admin/ConfigurarPrecosPage';
import InfosConsultaveisPage from './pages/admin/InfosConsultaveisPage';
import SettingsPage from './pages/admin/SettingsPage';
import ViewInfoPage from './pages/admin/ViewInfoPage';
import { Layout } from './components/Layout/Layout';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/*" element={<ProductPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/checkout/email" element={<CheckoutEmailPage />} />
        <Route path="/checkout/profile" element={<CheckoutProfilePage />} />

        <Route path="/admin" element={<AdminPage />} />
        <Route path="/configurar-precos" element={<ConfigurarPrecosPage />} />
        <Route path="/infos-consultaveis" element={<InfosConsultaveisPage />} />
        <Route path="/view-info" element={<ViewInfoPage />} />
        <Route path="/configuracoes" element={<SettingsPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
