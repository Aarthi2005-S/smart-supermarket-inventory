import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from '../components/Layout';
import Products from '../pages/Products';
import AddProduct from '../pages/AddProduct';
import ProductDetails from '../pages/ProductDetails';
import ReceiveStock from '../pages/ReceiveStock';
import Dashboard from '../pages/Dashboard';
import Inventory from '../pages/Inventory';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/receive-stock" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="receive-stock" element={<ReceiveStock />} />
        <Route path="products" element={<Products />} />
        <Route path="products/add" element={<AddProduct />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route path="*" element={<Navigate to="/receive-stock" replace />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
