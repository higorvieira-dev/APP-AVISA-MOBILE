import React, { createContext, useContext, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { UserRole } from '../navigation/types';

type User = {
  id: string; name: string; email: string; password: string; role: UserRole;
  coins: number; hours: number; warnings: number; phone?: string; modality?: string; profileImage?: string;
  birth?: string; cpf?: string; gender?: string; cep?: string; address?: string; number?: string; complement?: string; district?: string; city?: string; state?: string; sport?: string; level?: string; team?: string;
};

type AgendaItem = { id: string; title: string; type: 'Treino' | 'Evento' | 'Reunião'; date: string; time: string; location: string; createdBy?: string };
type Post = { id: string; userId: string; author: string; caption: string; image?: string; comments: { id: string; author: string; text: string }[] };
type Report = { id: string; author: string; message: string; status: string };
type Transparency = { id: string; title: string; body: string; author: string; date: string };
type StoreProduct = { id: string; title: string; category: string; price: number; stock: number; description: string; icon: string; discountPercent?: number };
type HistoryItem = { id: string; type: 'voucher' | 'atividade' | 'doacao' | 'sistema' | 'advertencia' | 'material' | 'evento' | 'pauta'; title: string; description: string; date: string; code?: string; status?: string };
type MaterialRequest = { id: string; author: string; material: string; quantity: string; justification: string; status: string };
type EventRequest = { id: string; author: string; title: string; date: string; time: string; location: string; description: string; status: string };
type MeetingSuggestion = { id: string; author: string; title: string; objective: string; agenda: string; participants: string; priority: string; status: string };

type AppState = {
  user: User | null; users: User[]; agenda: AgendaItem[]; posts: Post[]; reports: Report[]; transparencies: Transparency[]; history: HistoryItem[]; products: StoreProduct[];
  materialRequests: MaterialRequest[]; eventRequests: EventRequest[]; meetingSuggestions: MeetingSuggestion[];
  login: (email: string, password: string) => boolean; logout: () => void; registerAthlete: (data: Partial<User> & { name: string; email: string; password: string }) => void; updateProfile: (data: Partial<User>) => void;
  addAgenda: (item: Omit<AgendaItem, 'id'>) => void; addPost: (caption: string, image?: string) => void; deletePost: (id: string) => void; addComment: (postId: string, text: string) => void; deleteComment: (postId: string, commentId: string) => void; reportComment: (reason: string) => void;
  addReport: (message: string) => void; addTransparency: (title: string, body: string) => void; addProduct: (product: Omit<StoreProduct, 'id'>) => void; redeemItem: (productId: string) => void; donate: (value: string, type: string) => void;
  applyWarning: (athleteCode: string, reason: string) => void; requestMaterial: (material: string, quantity: string, justification: string) => void; requestEvent: (item: Omit<EventRequest, 'id' | 'author' | 'status'>) => void; approveEvent: (id: string) => void; suggestMeeting: (data: Omit<MeetingSuggestion, 'id' | 'author' | 'status'>) => void; createCoupon: (productId: string, discountPercent: number) => void;
  canAccessDirectorate: boolean;
};

const initialUsers: User[] = [
  { id: '1', name: 'Atleta Avisa', email: 'atleta@appavisa.com', password: '123456', role: 'athlete', coins: 0, hours: 0, warnings: 0, phone: '', modality: 'Atletismo' },
  { id: '2', name: 'Carlos Mendes', email: 'diretor@appavisa.com', password: '123456', role: 'director', coins: 0, hours: 0, warnings: 0, phone: '', modality: 'Diretoria' },
  { id: '3', name: 'Coach Silva', email: 'orientador@appavisa.com', password: '123456', role: 'coach', coins: 0, hours: 0, warnings: 0, phone: '', modality: 'Orientador' },
  { id: '4', name: 'Gerente Avisa', email: 'gerente@appavisa.com', password: '123456', role: 'manager', coins: 0, hours: 0, warnings: 0, phone: '', modality: 'Gestão' },
  { id: '5', name: 'Supervisor Avisa', email: 'supervisor@appavisa.com', password: '123456', role: 'supervisor', coins: 0, hours: 0, warnings: 0, phone: '', modality: 'Supervisão' },
];

const initialProducts: StoreProduct[] = [
  { id: 's1', title: 'Barra de Proteína', category: 'Nutrição', price: 50, stock: 25, description: 'Retirada no balcão da loja mediante voucher.', icon: 'fast-food' },
  { id: 's2', title: 'Garrafa Esportiva', category: 'Equipamentos', price: 150, stock: 12, description: 'Garrafa térmica para treinos e eventos.', icon: 'water' },
  { id: 's3', title: 'Camiseta Oficial', category: 'Vestuário', price: 500, stock: 8, description: 'Camiseta oficial do projeto APPAVISA.', icon: 'shirt' },
  { id: 's4', title: 'Aula Personalizada', category: 'Premium', price: 1000, stock: 3, description: 'Sessão individual com orientador credenciado.', icon: 'barbell' },
];

const Ctx = createContext<AppState>({} as AppState);
const stamp = () => String(Date.now());
function voucherCode() { return `AVISA-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`; }
function finalPrice(product: StoreProduct) { return Math.max(0, Math.round(product.price * (1 - (product.discountPercent || 0) / 100))); }

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState(initialUsers);
  const [user, setUser] = useState<User | null>(null);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [products, setProducts] = useState<StoreProduct[]>(initialProducts);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>([]);
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [meetingSuggestions, setMeetingSuggestions] = useState<MeetingSuggestion[]>([]);
  const [transparencies, setTransparencies] = useState<Transparency[]>([{ id: 't1', title: 'Canal de transparência ativo', body: 'A diretoria poderá publicar comunicados oficiais, documentos e avisos sobre o APPAVISA.', author: 'Diretoria', date: 'Hoje' }]);
  const [historiesByUser, setHistoriesByUser] = useState<Record<string, HistoryItem[]>>({});

  const canAccessDirectorate = !!user && ['director', 'manager', 'supervisor'].includes(user.role);
  const history = user ? historiesByUser[user.id] || [] : [];
  const pushHistory = (userId: string, item: Omit<HistoryItem, 'id' | 'date'>) => setHistoriesByUser(prev => ({ ...prev, [userId]: [{ id: stamp(), date: 'Agora', ...item }, ...(prev[userId] || [])] }));

  const api = useMemo<AppState>(() => ({
    user, users, agenda, posts, reports, transparencies, history, products, materialRequests, eventRequests, meetingSuggestions, canAccessDirectorate,
    login(email, password) {
      const found = users.find(u => u.email.toLowerCase().trim() === email.trim().toLowerCase() && u.password === password.trim());
      if (!found) { Alert.alert('Login inválido', 'Confira seu e-mail e senha.'); return false; }
      setUser(found); return true;
    },
    logout() { setUser(null); },
    registerAthlete(data) {
      const newUser: User = { id: stamp(), name: data.name, email: data.email.trim().toLowerCase(), password: data.password, role: 'athlete', coins: 0, hours: 0, warnings: 0, phone: data.phone || '', modality: data.modality || data.sport || '', birth: data.birth || '', cpf: data.cpf || '', gender: data.gender || '', cep: data.cep || '', address: data.address || '', number: data.number || '', complement: data.complement || '', district: data.district || '', city: data.city || '', state: data.state || '', sport: data.sport || '', level: data.level || '', team: data.team || '' };
      setUsers(prev => [...prev, newUser]); Alert.alert('Cadastro concluído', 'Atleta cadastrado com sucesso. Agora faça login.');
    },
    updateProfile(data) { if (!user) return; const updated = { ...user, ...data }; setUser(updated); setUsers(prev => prev.map(u => u.id === user.id ? updated : u)); Alert.alert('Perfil atualizado', 'Suas informações foram salvas.'); },
    addAgenda(item) { const ag = { ...item, id: stamp(), createdBy: user?.name }; setAgenda(prev => [ag, ...prev]); if (user) pushHistory(user.id, { type: 'atividade', title: item.title, description: `${item.type} cadastrado para ${item.date} às ${item.time}`, status: 'Agendado' }); },
    addPost(caption, image) { if (!user) return; setPosts(prev => [{ id: stamp(), userId: user.id, author: user.name, caption, image, comments: [] }, ...prev]); },
    deletePost(id) { setPosts(prev => prev.filter(p => p.id !== id)); },
    addComment(postId, text) { if (!user) return; setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: [...p.comments, { id: stamp(), author: user.name, text }] } : p)); },
    deleteComment(postId, commentId) { setPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments.filter(c => c.id !== commentId) } : p)); },
    reportComment(reason) { Alert.alert('Comentário denunciado', `Motivo: ${reason}. A denúncia foi enviada para análise da diretoria.`); },
    addReport(message) { if (!user) return; setReports(prev => [{ id: stamp(), author: user.name, message, status: 'Enviado para orientadores e diretoria' }, ...prev]); Alert.alert('Reporte enviado', 'Orientadores e diretoria foram notificados.'); },
    addTransparency(title, body) { if (!user) return; setTransparencies(prev => [{ id: stamp(), title, body, author: user.name, date: 'Agora' }, ...prev]); },
    addProduct(product) { if (!canAccessDirectorate) { Alert.alert('Acesso negado', 'Somente diretoria, gerente ou supervisor podem cadastrar produtos.'); return; } setProducts(prev => [{ ...product, id: stamp() }, ...prev]); Alert.alert('Produto cadastrado', `${product.title} foi adicionado à loja.`); },
    redeemItem(productId) { if (!user) return; const product = products.find(p => p.id === productId); if (!product) return; const price = finalPrice(product); if (product.stock <= 0) { Alert.alert('Produto indisponível', 'Este item está sem estoque.'); return; } if (user.coins < price) { Alert.alert('Saldo insuficiente', `Você tem ${user.coins} coins e este item custa ${price} coins.`); return; } const updated = { ...user, coins: user.coins - price }; const code = voucherCode(); const voucher: HistoryItem = { id: stamp(), type: 'voucher', title: `Voucher - ${product.title}`, description: `Apresente este código no balcão da loja para retirar: ${product.title}. Valor debitado: ${price} coins.`, date: 'Agora', code, status: 'Aguardando retirada' }; setUser(updated); setUsers(prev => prev.map(u => u.id === user.id ? updated : u)); setProducts(prev => prev.map(p => p.id === product.id ? { ...p, stock: Math.max(0, p.stock - 1) } : p)); setHistoriesByUser(prev => ({ ...prev, [user.id]: [voucher, ...(prev[user.id] || [])] })); Alert.alert('Resgate realizado', `Foram debitados ${price} coins. Voucher: ${code}`); },
    donate(value, type) { if (!user) return; pushHistory(user.id, { type: 'doacao', title: 'Interesse de doação', description: `${type}: ${value}`, status: 'Registrado' }); Alert.alert('Doação registrada', `Obrigado. Doação de ${type}: ${value}. Em produção, conectaremos Pix/cartão.`); },
    applyWarning(athleteCode, reason) { if (!user) return; const target = users.find(u => u.id === athleteCode || u.email.toLowerCase() === athleteCode.toLowerCase().trim()); if (!target) { Alert.alert('Atleta não encontrado', 'Use o QR Code/ID ou e-mail do atleta cadastrado.'); return; } const updatedTarget = { ...target, warnings: target.warnings + 1 }; setUsers(prev => prev.map(u => u.id === target.id ? updatedTarget : u)); if (target.id === user.id) setUser(updatedTarget); pushHistory(target.id, { type: 'advertencia', title: 'Advertência aplicada', description: `Motivo: ${reason}. Aplicada por ${user.name}.`, status: 'Registrada' }); setReports(prev => [{ id: stamp(), author: user.name, message: `Advertência aplicada ao atleta ${target.name}. Motivo: ${reason}`, status: 'Enviado para diretoria' }, ...prev]); Alert.alert('Advertência aplicada', `Advertência registrada para ${target.name}.`); },
    requestMaterial(material, quantity, justification) { if (!user) return; const item = { id: stamp(), author: user.name, material, quantity, justification, status: 'Aguardando aprovação administrativa' }; setMaterialRequests(prev => [item, ...prev]); pushHistory(user.id, { type: 'material', title: `Material solicitado: ${material}`, description: `${quantity} unidade(s). Justificativa: ${justification}`, status: item.status }); Alert.alert('Solicitação enviada', 'Seu pedido foi enviado para análise administrativa.'); },
    requestEvent(item) { if (!user) return; const req = { ...item, id: stamp(), author: user.name, status: 'Aguardando aprovação administrativa' }; setEventRequests(prev => [req, ...prev]); pushHistory(user.id, { type: 'evento', title: item.title, description: `${item.date} às ${item.time} - ${item.location}`, status: req.status }); Alert.alert('Evento solicitado', 'A solicitação foi enviada para aprovação.'); },
    approveEvent(id) { const req = eventRequests.find(e => e.id === id); if (!req || !canAccessDirectorate) return; setEventRequests(prev => prev.map(e => e.id === id ? { ...e, status: 'Aprovado' } : e)); setAgenda(prev => [{ id: stamp(), title: req.title, type: 'Evento', date: req.date, time: req.time, location: req.location, createdBy: 'Diretoria' }, ...prev]); Alert.alert('Evento aprovado', 'O evento foi enviado para a agenda e aparecerá no painel do professor.'); },
    suggestMeeting(data) { if (!user) return; const item = { ...data, id: stamp(), author: user.name, status: 'Pauta sugerida' }; setMeetingSuggestions(prev => [item, ...prev]); pushHistory(user.id, { type: 'pauta', title: data.title, description: `${data.objective}. Participantes: ${data.participants}`, status: item.status }); Alert.alert('Pauta enviada', 'A sugestão foi registrada para reunião.'); },
    createCoupon(productId, discountPercent) { if (!canAccessDirectorate) { Alert.alert('Acesso negado', 'Somente diretoria pode criar cupons.'); return; } setProducts(prev => prev.map(p => p.id === productId ? { ...p, discountPercent: Math.min(100, Math.max(0, discountPercent)) } : p)); Alert.alert('Cupom aplicado', `Desconto de ${discountPercent}% aplicado ao produto selecionado.`); },
  }), [user, users, agenda, posts, reports, transparencies, history, products, canAccessDirectorate, materialRequests, eventRequests, meetingSuggestions]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);
