import { ExternalLink, Settings } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AdminDrawer } from './components/AdminDrawer';
import { AdminHeader } from './components/AdminHeader';
import { Product } from '../../data/products';
import { saveProducts } from '../../data/productStorage';
import { useStoredProducts } from '../../hooks/useStoredProducts';
import { getProductPath } from '../../utils/productUrl';

function SideFloatingButton() {
  return (
    <div
      aria-hidden="true"
      className="fixed right-[-12px] top-[55%] z-40 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-[#FF7A00]"
    >
      <div className="h-2 w-2 rounded-full bg-[#ff0048]" />
    </div>
  );
}

function SettingsButton() {
  return (
    <button
      aria-label="Configurações"
      className="fixed bottom-6 right-3 z-40 flex h-[42px] w-[42px] items-center justify-center rounded-[8px] bg-[#1A1F28] text-white shadow-lg hover:bg-[#202631]"
      type="button"
    >
      <Settings className="h-5 w-5" strokeWidth={2} />
    </button>
  );
}

function WelcomeSection() {
  return (
    <section className="px-5 pt-20">
      <h1 className="text-base font-medium leading-6 text-white sm:text-[18px] sm:leading-7">
        Olá abobora, você está em / ConfigurarPreços
      </h1>
      <p className="mt-1 text-[13px] leading-5 text-[#7A7F89]">
        Seu serial vence NUNCA
      </p>
    </section>
  );
}

function parsePercentage(value: string) {
  return Number.parseFloat(value.replace('%', '').replace(',', '.'));
}

function PriceFormCard() {
  const [productPercentage, setProductPercentage] = useState('0');
  const [productId, setProductId] = useState('');
  const [allProductsPercentage, setAllProductsPercentage] = useState('0');
  const [message, setMessage] = useState('');
  const { products, setProducts } = useStoredProducts();

  const handleProductPriceChange = () => {
    const numericId = Number(productId);
    const percentage = parsePercentage(productPercentage);

    console.log('Produtos:', products);
    console.log('ID digitado:', productId);
    console.log('ID convertido:', numericId);

    const product = products.find((item) => item.id === numericId);

    console.log('Produto encontrado:', product);

    if (!Number.isFinite(numericId) || !Number.isFinite(percentage)) {
      setMessage('Informe um ID válido e uma porcentagem válida.');
      return;
    }

    if (!product) {
      setMessage('Produto não encontrado.');
      return;
    }

    const nextProducts = products.map((item) => {
      if (item.id !== numericId) {
        return item;
      }

      return {
        ...item,
        price: Number((item.price * (1 + percentage / 100)).toFixed(2)),
      };
    });

    setProducts(nextProducts);
    saveProducts(nextProducts);
    setProductId('');
    setProductPercentage('0');
    setMessage('Preço atualizado com sucesso.');
  };

  const handleAllProductsPriceChange = () => {
    const percentage = parsePercentage(allProductsPercentage);

    if (!Number.isFinite(percentage)) {
      setMessage('Informe uma porcentagem válida.');
      return;
    }

    const nextProducts = products.map((product) => ({
      ...product,
      price: Number((product.price * (1 + percentage / 100)).toFixed(2)),
    }));

    setProducts(nextProducts);
    saveProducts(nextProducts);
    setAllProductsPercentage('0');
    setMessage('Preços atualizados com sucesso.');
  };

  return (
    <section className="mx-4 mt-5 rounded-[8px] border border-white/5 bg-[#1A1F28] p-5 sm:mx-5 sm:p-[20px]">
      <div className="border-b border-white/5 pb-3">
        <h2 className="text-base font-medium leading-6 text-[#BFC5D0]">
          Configurar preços
        </h2>
      </div>

      <div className="divide-y divide-white/5">
        <div className="py-4">
          <h3 className="text-sm font-medium leading-5 text-[#BFC5D0]">
            Alterar valor produto
          </h3>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <input
              aria-label="Porcentagem do produto"
              className="h-10 rounded border border-white/5 bg-[#12161E] px-3 text-[13px] leading-5 text-white outline-none placeholder:text-[#5E6573] focus:border-white/20"
              onChange={(event) => setProductPercentage(event.target.value)}
              placeholder="0%"
              type="text"
              value={productPercentage}
            />
            <input
              aria-label="ID do produto"
              className="h-10 rounded border border-white/5 bg-[#12161E] px-3 text-[13px] leading-5 text-white outline-none placeholder:text-[#5E6573] focus:border-white/20"
              onChange={(event) => setProductId(event.target.value)}
              placeholder="id produto"
              type="text"
              value={productId}
            />
          </div>

          <div className="mt-3 flex justify-end">
            <button
              className="rounded bg-[#3DD4B9] px-5 py-2 text-sm font-semibold leading-5 text-[#071311] hover:bg-[#31c4aa]"
              onClick={handleProductPriceChange}
              type="button"
            >
              Aplicar
            </button>
          </div>
        </div>

        <div className="py-4">
          <h3 className="text-sm font-medium leading-5 text-[#BFC5D0]">
            Alterar valor de todos produto
          </h3>

          <div className="mt-3 grid grid-cols-[1fr_auto] items-center gap-2">
            <input
              aria-label="Porcentagem de todos os produtos"
              className="h-10 rounded border border-white/5 bg-[#12161E] px-3 text-[13px] leading-5 text-white outline-none placeholder:text-[#5E6573] focus:border-white/20"
              onChange={(event) => setAllProductsPercentage(event.target.value)}
              placeholder="0%"
              type="text"
              value={allProductsPercentage}
            />
            <button
              className="rounded bg-[#3DD4B9] px-5 py-2 text-sm font-semibold leading-5 text-[#071311] hover:bg-[#31c4aa]"
              onClick={handleAllProductsPriceChange}
              type="button"
            >
              Aplicar
            </button>
          </div>
        </div>
      </div>

      {message && (
        <p className="mt-4 rounded border border-white/5 bg-[#12161E] px-4 py-3 text-[13px] leading-5 text-[#BFC5D0]">
          {message}
        </p>
      )}
    </section>
  );
}

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', {
    currency: 'BRL',
    minimumFractionDigits: 2,
    style: 'currency',
  });
}

function getProductLink(product: Product) {
  return getProductPath(product).replace(/^\//, '');
}

function ProductsTable() {
  const [baseUrl, setBaseUrl] = useState('');
  const { products } = useStoredProducts();

  useEffect(() => {
    const savedUrl = localStorage.getItem('fakeUrl');
    if (savedUrl) {
      setBaseUrl(savedUrl);
    }
  }, []);

  return (
    <section className="mx-4 mt-5 rounded-[8px] border border-white/5 bg-[#1A1F28] p-5 sm:mx-5 sm:p-[20px]">
      <div className="border-b border-white/5 pb-3">
        <h2 className="text-base font-medium leading-6 text-[#BFC5D0]">
          Produtos Cadastrados{' '}
          <span className="font-semibold text-white">{products.length}</span>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-[13px] leading-5">
          <thead>
            <tr className="border-b border-white/5 text-[#8B92A0]">
              <th className="py-3 pr-3 font-medium">ID</th>
              <th className="py-3 pr-3 font-medium">Produto</th>
              <th className="py-3 pr-3 font-medium">Preço</th>
              <th className="py-3 pr-3 font-medium">Preço Promocional</th>
              <th className="py-3 pr-3 font-medium">Link Produto</th>
            </tr>
          </thead>

          <tbody>
            {products.map((product) => {
              const productLink = getProductLink(product);
              const href = baseUrl ? `${baseUrl}${productLink}` : productLink;

              return (
                <tr className="border-b border-white/5" key={product.id}>
                  <td className="whitespace-nowrap py-4 pr-3 text-[#8B92A0]">
                    {product.id}.
                  </td>
                  <td className="whitespace-nowrap py-4 pr-3">
                    <div className="flex items-center gap-3">
                      <img
                        alt=""
                        className="h-10 w-10 rounded-lg border border-white/10 bg-[#12161E] object-cover"
                        src={product.image}
                      />
                      <span className="max-w-[180px] truncate text-[#BFC5D0]">
                        {product.title}
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap py-4 pr-3 text-[#8B92A0]">
                    {formatPrice(product.oldPrice)}
                  </td>
                  <td className="whitespace-nowrap py-4 pr-3 text-[#BFC5D0]">
                    {formatPrice(product.price)}
                  </td>
                  <td className="whitespace-nowrap py-4 pr-3">
                    <a
                      className="inline-flex items-center gap-1 rounded bg-[#3DD4B9] px-3 py-2 text-sm font-semibold leading-5 text-[#071311] hover:bg-[#31c4aa]"
                      href={href}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Abrir Produto
                      <ExternalLink className="h-4 w-4" strokeWidth={2} />
                    </a>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ConfigurarPrecosPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#12161E] pb-24 text-white">
      <AdminHeader onOpenDrawer={() => setIsDrawerOpen(true)} />
      <AdminDrawer
        activeRoute="/configurar-precos"
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
      <WelcomeSection />
      <PriceFormCard />
      <ProductsTable />
      <SideFloatingButton />
      <SettingsButton />
    </div>
  );
}

export default ConfigurarPrecosPage;
