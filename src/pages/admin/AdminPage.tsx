import { Settings } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AdminDrawer } from './components/AdminDrawer';
import { AdminHeader } from './components/AdminHeader';

interface StatItem {
  label: string;
  value: number;
}

const stats: StatItem[] = [
  { label: 'USUÁRIOS ONLINE', value: 4 },
  { label: 'VISITAS', value: 10 },
  { label: 'X9 BLOQUEADOS', value: 0 },
  { label: 'TOTAL INFOS COLETADAS', value: 0 },
  { label: 'INFOS FULL', value: 0 },
  { label: 'INFOS FULL CONSULTÁVEIS', value: 0 },
  { label: 'BOLETOS GERADOS', value: 0 },
  { label: 'BOLETOS PAGOS', value: 0 },
  { label: 'PIX GERADOS', value: 0 },
  { label: 'LOGIN AMERICANAS', value: 0 },
  { label: 'LOGINS FACEBOOK', value: 0 },
];

function WelcomeSection() {
  return (
    <section className="px-5 pt-20">
      <h1 className="text-base font-medium leading-6 text-white sm:text-[18px] sm:leading-7">
        Olá abobora, você está em Página Inicial
      </h1>
      <p className="mt-1 text-[13px] leading-5 text-[#7A7F89]">
        Seu serial vence NUNCA
      </p>
    </section>
  );
}

function ResultsCard() {
  return (
    <section className="mx-4 mt-5 rounded-[8px] border border-white/5 bg-[#1A1F28] p-5 sm:mx-5 sm:p-[20px]">
      <div className="border-b border-white/5 pb-3">
        <h2 className="text-base font-medium leading-6 text-[#BFC5D0]">
          RESULTS
        </h2>
      </div>

      <div className="divide-y divide-white/5">
        {stats.map((stat) => (
          <div
            className="flex h-11 items-center justify-between gap-4"
            key={stat.label}
          >
            <span className="min-w-0 flex-1 text-[13px] font-medium leading-5 text-[#8B92A0]">
              {stat.label}
            </span>
            <span className="shrink-0 text-[13px] font-semibold leading-5 text-white">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

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

function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      aria-label="Configurações"
      className="fixed bottom-6 right-3 z-40 flex h-[42px] w-[42px] items-center justify-center rounded-[8px] bg-[#1A1F28] text-white shadow-lg hover:bg-[#202631]"
      onClick={onClick}
      type="button"
    >
      <Settings className="h-5 w-5" strokeWidth={2} />
    </button>
  );
}

function AdminPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#12161E] text-white">
      <AdminHeader onOpenDrawer={() => setIsDrawerOpen(true)} />
      <AdminDrawer
        activeRoute="/admin"
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
      <WelcomeSection />
      <ResultsCard />
      <SideFloatingButton />
      <SettingsButton onClick={() => navigate('/configuracoes')} />
    </div>
  );
}

export default AdminPage;
