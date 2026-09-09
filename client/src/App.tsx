import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { LanguagePage } from "./pages/LanguagePage";
import { RolePage } from "./pages/RolePage";
import { MarketPage } from "./pages/MarketPage";
import { ProductPage } from "./pages/ProductPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderPage } from "./pages/OrderPage";
import { SellerLayout } from "./pages/seller/SellerLayout";
import { PhotosPage } from "./pages/seller/PhotosPage";
import { VoicePage } from "./pages/seller/VoicePage";
import { DescriptionPage } from "./pages/seller/DescriptionPage";
import { PricePage } from "./pages/seller/PricePage";
import { PromotionPage } from "./pages/seller/PromotionPage";
import { PublishPage } from "./pages/seller/PublishPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<LanguagePage />} />
        <Route path="/role" element={<RolePage />} />
        <Route path="/market" element={<MarketPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order/:id" element={<OrderPage />} />
        <Route path="/sell" element={<SellerLayout />}>
          <Route index element={<Navigate to="photos" replace />} />
          <Route path="photos" element={<PhotosPage />} />
          <Route path="voice" element={<VoicePage />} />
          <Route path="description" element={<DescriptionPage />} />
          <Route path="price" element={<PricePage />} />
          <Route path="promotion" element={<PromotionPage />} />
          <Route path="publish" element={<PublishPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
