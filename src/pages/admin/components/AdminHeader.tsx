import { Menu, Power } from 'lucide-react';

interface AdminHeaderProps {
  onOpenDrawer: () => void;
}

export function AdminHeader({ onOpenDrawer }: AdminHeaderProps) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex h-16 items-center justify-between border-b border-white/5 bg-[#161A22] px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-9.5 w-9.5 items-center justify-center rounded-sm bg-[#ff0048]">
          <span className="text-[10px] font-bold uppercase leading-none text-white">
            logo
          </span>
        </div>

        <button
          aria-label="Abrir menu"
          className="flex h-10 w-10 items-center justify-center rounded text-[#BFC5D0] hover:bg-white/5"
          onClick={onOpenDrawer}
          type="button"
        >
          <Menu className="h-6 w-6" strokeWidth={2} />
        </button>
      </div>

      <div className="flex items-center">
        <div className="mx-3 h-6 w-px bg-white/10" />
        <button
          aria-label="Sair"
          className="flex h-10 w-10 items-center justify-center rounded text-[#BFC5D0] hover:bg-white/5"
          type="button"
        >
          <Power className="h-5 w-5" strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
