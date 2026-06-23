import {
  Anchor,
  Banknote,
  CreditCard,
  Home,
  LayoutDashboard,
  Palette,
  QrCode,
  Scissors,
  Search,
  Settings,
  Trash2,
  UsersRound,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AdminMenuItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  children?: AdminMenuItem[];
}

interface AdminDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeRoute:
    | '/admin'
    | '/configuracoes'
    | '/configurar-precos'
    | '/infos-consultaveis'
    | '/view-info';
}

const menuItems: AdminMenuItem[] = [
  { label: 'Página inicial', path: '/admin', icon: <Home className="h-5 w-5" /> },
  {
    label: 'Configurações da tela',
    path: '/configuracoes',
    icon: <Palette className="h-5 w-5" />,
  },
  {
    label: 'Produtos',
    path: '/configurar-precos',
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: 'Infos Coletadas',
    path: '#',
    icon: <CreditCard className="h-5 w-5" />,
    children: [
      { label: 'InfosFull', path: '/infos-consultaveis' },
      { label: 'InfosFull Consultáveis', path: '/infos-consultaveis' },
    ],
  },
  { label: 'Boletos', path: '#', icon: <Banknote className="h-5 w-5" /> },
  { label: 'Pix', path: '#', icon: <QrCode className="h-5 w-5" /> },
  {
    label: 'Logins Coletados',
    path: '#',
    icon: <UsersRound className="h-5 w-5" />,
  },
  { label: 'Fishing Dados', path: '#', icon: <Anchor className="h-5 w-5" /> },
  { label: 'Encurtador', path: '#', icon: <Scissors className="h-5 w-5" /> },
  { label: 'Limpar dados', path: '#', icon: <Trash2 className="h-5 w-5" /> },
  {
    label: 'Outras Configuraçoes',
    path: '#',
    icon: <Settings className="h-5 w-5" />,
  },
  { label: 'Serial', path: '#', icon: <Search className="h-5 w-5" /> },
];

function DrawerOverlay({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return (
    <button
      aria-label="Fechar menu"
      className={`fixed inset-0 z-[60] bg-black/60 transition-opacity ${
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
      onClick={onClose}
      type="button"
    />
  );
}

export function AdminDrawer({ isOpen, onClose, activeRoute }: AdminDrawerProps) {
  const [infosOpen, setInfosOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuClick = (path: string) => {
    onClose();

    if (path !== '#') {
      navigate(path);
    }
  };

  const renderMenuItems = (items: AdminMenuItem[], level = 0) =>
    items.map((item) => {
      const hasChildren = Boolean(item.children?.length);
      const isActive = activeRoute === item.path;
      const isChildActive = item.children?.some((child) => activeRoute === child.path);
      const childItems = item.children ?? [];
      const shouldRenderChildren = hasChildren && (infosOpen || isChildActive);

      return (
        <div key={item.label}>
          <button
            className={`flex h-10 w-full items-center justify-between rounded px-3 text-sm leading-5 ${
              isActive || isChildActive
                ? 'text-[#3DD4B9]'
                : 'text-[#8B92A0] hover:bg-white/5 hover:text-white'
            }`}
            onClick={() => {
              if (hasChildren) {
                setInfosOpen((current) => !current);
              } else {
                handleMenuClick(item.path);
              }
            }}
            type="button"
          >
            <span className={level > 0 ? 'pl-5' : ''}>{item.label}</span>
            <span className={isActive || isChildActive ? 'text-[#3DD4B9]' : 'text-[#8B92A0]'}>
              {item.icon}
            </span>
          </button>

          {shouldRenderChildren && (
            <div className="relative pl-3">
              <div className="absolute bottom-2 left-2 top-2 w-px bg-[#3DD4B9]/40" />
              {renderMenuItems(childItems, level + 1)}
            </div>
          )}
        </div>
      );
    });

  return (
    <>
      <DrawerOverlay isOpen={isOpen} onClose={onClose} />
      <aside
        aria-label="Painel Americanas"
        className={`fixed bottom-0 left-0 top-0 z-[70] flex h-full w-[292px] flex-col bg-[#161A22] shadow-2xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="relative border-b border-white/5 px-5 pt-6">
          <button
            aria-label="Fechar menu"
            className="absolute right-4 top-5 flex h-8 w-8 items-center justify-center rounded text-[#BFC5D0] hover:bg-white/5"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>

          <div className="flex items-center gap-3 pr-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-[#ff0048]">
              <span className="text-[10px] font-bold uppercase leading-none text-white">
                logo
              </span>
            </div>

            <h2 className="text-base font-medium leading-6 tracking-wide text-[#BFC5D0]">
              PAINEL AMERICANAS
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-[#1A1F28] p-1">
            <div className="h-full w-full rounded-full bg-gradient-to-br from-green-400 via-white to-yellow-300" />
          </div>

          <div>
            <p className="text-sm font-medium leading-5 text-[#BFC5D0]">V 10</p>
            <button
              className="flex items-center gap-1 text-sm leading-5 text-[#8B92A0] hover:text-white"
              type="button"
            >
              abobora
              <span className="text-[10px]">▾</span>
            </button>
          </div>
        </div>

        <nav className="px-3 py-2" aria-label="Menu principal">
          <p className="mb-3 px-3 text-xs font-medium uppercase leading-5 text-[#5E6573]">
            MENU
          </p>

          {renderMenuItems(menuItems)}
        </nav>
      </aside>
    </>
  );
}
