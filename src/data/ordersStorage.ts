import { collection, deleteDoc, doc, getDocs, setDoc, query, orderBy } from 'firebase/firestore';
import { app } from '../firebase';
import { getFirestore } from 'firebase/firestore';

export const db = getFirestore(app);

export interface CheckoutOrderClient {
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
}

export interface CheckoutOrderAddress {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

export interface CheckoutOrderProduct {
  nome: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
}

export interface CheckoutOrderPayment {
  metodo: string;
  numeroCartao: string;
  parcelas: string;
  nomeCartao: string;
  validadeMes: string;
  validadeAno: string;
  cvv: string;
  cpfTitular: string;
}

export interface CheckoutOrderRecord {
  id: string;
  pedido: string;
  cliente: CheckoutOrderClient;
  endereco: CheckoutOrderAddress;
  produto: CheckoutOrderProduct;
  pagamento: CheckoutOrderPayment;
  createdAt: string;
}

const ORDERS_COLLECTION = 'orders';

function normalizeOrder(order: CheckoutOrderRecord): CheckoutOrderRecord {
  return {
    ...order,
    createdAt: order.createdAt,
  };
}

export async function loadCheckoutOrders(): Promise<CheckoutOrderRecord[]> {
  try {
    const ordersQuery = query(collection(db, ORDERS_COLLECTION), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(ordersQuery);

    return snapshot.docs.map((document) => {
      const order = normalizeOrder(document.data() as CheckoutOrderRecord);

      return {
        ...order,
        id: document.id,
      };
    });
  } catch {
    throw new Error('Não foi possível carregar os pedidos.');
  }
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
