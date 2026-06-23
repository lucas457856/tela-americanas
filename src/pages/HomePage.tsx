import { CategoriesMenu } from '../components/CategoriesMenu/CategoriesMenu';
import { CategoryGrid } from '../components/CategoryGrid/CategoryGrid';
import { FestaJuninaFlags } from '../components/FestaJuninaFlags/FestaJuninaFlags';
import { Footer } from '../components/Footer/Footer';
import { Header } from '../components/Header/Header';
import { MobileHeader } from '../components/Header/MobileHeader';
import { HeroBanner } from '../components/HeroBanner/HeroBanner';
import { InitialOfferModal } from '../components/InitialOfferModal/InitialOfferModal';
import { RegionModal } from '../components/InitialOfferModal/RegionModal';
import { ProductCarousel } from '../components/ProductCarousel/ProductCarousel';
import { PromoIcons } from '../components/PromoIcons/PromoIcons';
import { useMemo, useState } from 'react';
import { useStoredProducts } from '../hooks/useStoredProducts';

export default function HomePage() {
  const [offerModalOpen, setOfferModalOpen] = useState(true);
  const [regionModalOpen, setRegionModalOpen] = useState(true);
  const { products } = useStoredProducts();
  const productSections = useMemo(
    () => [
      { title: 'ofertas do dia', products: products.slice(0, 6) },
      { title: 'mais vendidos', products: products.slice(6, 14) },
      { title: 'tecnologia', products: products.slice(14, 20) },
      { title: 'mercado', products: products.slice(20, 26) },
      { title: 'festival de limpeza com condições imperdíveis:', products: products.slice(26, 32) },
      { title: 'eletrodomésticos', products: products.slice(32, 38) },
    ],
    [products],
  );

  return (
    <>
      {offerModalOpen && <InitialOfferModal onClose={() => setOfferModalOpen(false)} />}
      {regionModalOpen && <RegionModal onClose={() => setRegionModalOpen(false)} />}

      <div className="max-md:hidden">
        <Header />
      </div>
      <div className="md:hidden">
        <MobileHeader />
      </div>
      <CategoriesMenu />
      <FestaJuninaFlags />
      <HeroBanner />
      <PromoIcons />
      <section className="offersIntro">
        <div className="offersIntroContainer">
          <p>as melhores ofertas</p>
          <strong>o que você viu está aqui!</strong>
        </div>
      </section>
      {productSections.map((section) => (
        <ProductCarousel
          key={section.title}
          title={section.title}
          products={section.products}
          isMobileHorizontal={true}
        />
      ))}
      <CategoryGrid />
      <Footer />
    </>
  );
}
