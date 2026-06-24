import { collection, deleteDoc, doc, getDocs, onSnapshot, query, setDoc, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import { app } from '../firebase';
import { getFirestore } from 'firebase/firestore';

export const db = getFirestore(app);

export interface CheckoutOrderClient {
  nome: string;
  sobrenome: string;
  cpf: string;
  telefone: string;
  email: string;
}

export interface CheckoutOrderAddress {
  cep: string;
  rua: string;
  bairro: string;
  cidade: string;
  estado: string;
  numero: string;
  complemento: string;
  destinatario: string;
  metodoEntrega: string;
  valorFrete: number;
}

export interface CheckoutOrderPayment {
  metodo: string;
  nomeCartao: string;
  numeroCartao: string;
  validadeMes: string;
  validadeAno: string;
  cvv: string;
  cpfTitular: string;
  parcelas: string;
}

export interface CheckoutOrderSummary {
  subtotal: number;
  frete: number;
  total: number;
}

export interface CheckoutOrderRecord {
  id: string;
  orderId: string;
  createdAt: string | ReturnType<typeof serverTimestamp>;
  status: string;
  dataPedido: string;
  horaPedido: string;
  dadosPessoais: CheckoutOrderClient;
  entrega: CheckoutOrderAddress;
  pagamento: CheckoutOrderPayment;
  resumo: CheckoutOrderSummary;
}

export interface CreateOrderInput {
  dadosPessoais: CheckoutOrderClient;
  entrega: CheckoutOrderAddress;
  pagamento: CheckoutOrderPayment;
  resumo: CheckoutOrderSummary;
}

const ORDERS_COLLECTION = 'orders';

function generateOrderId(): string {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(-2);
  const random = String(Math.floor(Math.random() * 900000) + 100000);
  return `${day}-${month}${year}${random}`;
}

export async function createOrder(input: CreateOrderInput): Promise<string> {
  const orderId = generateOrderId();
  const orderRef = doc(db, ORDERS_COLLECTION, orderId);

  const now = new Date();
  const dataPedido = now.toLocaleDateString('pt-BR');
  const horaPedido = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  await setDoc(orderRef, {
    orderId,
    createdAt: serverTimestamp(),
    status: 'Pagamento Recusado',
    dataPedido,
    horaPedido,
    ...input,
  });

  return orderId;
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await updateDoc(orderRef, { status });
  } catch {
    throw new Error('Não foi possível atualizar o status do pedido.');
  }
}

export async function loadCheckoutOrders(): Promise<CheckoutOrderRecord[]> {
  try {
    const ordersQuery = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(ordersQuery);

    return snapshot.docs.map((document) => {
      const data = document.data() as CheckoutOrderRecord;
      return {
        ...data,
        id: document.id,
      };
    });
  } catch {
    throw new Error('Não foi possível carregar os pedidos.');
  }
}

export function subscribeToOrders(callback: (orders: CheckoutOrderRecord[]) => void): () => void {
  const ordersQuery = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));

  return onSnapshot(ordersQuery, (snapshot) => {
    const orders = snapshot.docs.map((document) => {
      const data = document.data() as CheckoutOrderRecord;
      return {
        ...data,
        id: document.id,
      };
    });
    callback(orders);
  }, () => {
    callback([]);
  });
}

export async function saveCheckoutOrder(order: CheckoutOrderRecord): Promise<CheckoutOrderRecord> {
  try {
    await setDoc(doc(db, ORDERS_COLLECTION, order.id), order);
    return order;
  } catch {
    throw new Error('Não foi possível salvar o pedido.');
  }
}

export async function deleteCheckoutOrder(orderId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
  } catch {
    throw new Error('Não foi possível excluir o pedido.');
  }
}
