import { supabase } from "../lib/supabase";
//import { registerForPushNotifications } from "../../../notifications";
import React, { createContext, useContext, useMemo, useState } from "react";
import { Alert } from "react-native";
import { UserRole } from "../navigation/types";


type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  coins: number;
  hours: number;
  warnings: number;
  phone?: string;
  modality?: string;
  profileImage?: string;
  birth?: string;
  cpf?: string;
  gender?: string;
  cep?: string;
  address?: string;
  number?: string;
  complement?: string;
  district?: string;
  city?: string;
  state?: string;
  sport?: string;
  level?: string;
  team?: string;
};

type AgendaItem = {
  id: string;
  title: string;
  type: "Treino" | "Evento" | "Reunião";
  date: string;
  time: string;
  location: string;
  createdBy?: string;
  professorId?: string | null;
  status?: "pendente" | "agendado" | "em_andamento" | "finalizado" | string;
  checkinAt?: string | null;
  checkoutAt?: string | null;
  hoursCalculated?: number;
};
type Post = {
  id: string;
  userId: string;
  author: string;
  caption: string;
  image?: string;
  comments: { id: string; author: string; text: string }[];
};
type Report = { id: string; author: string; message: string; status: string };
type Transparency = {
  id: string;
  title: string;
  body: string;
  author: string;
  date: string;
};
type StoreProduct = {
  id: string;
  title: string;
  category: string;
  price: number;
  stock: number;
  description: string;
  icon: string;
  discountPercent?: number;
};
type HistoryItem = {
  id: string;
  type:
    | "voucher"
    | "atividade"
    | "doacao"
    | "sistema"
    | "advertencia"
    | "material"
    | "evento"
    | "pauta";
  title: string;
  description: string;
  date: string;
  code?: string;
  status?: string;
};
type MaterialRequest = {
  id: string;
  author: string;
  material: string;
  quantity: string;
  justification: string;
  status: string;
};
type EventRequest = {
  id: string;
  author: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  status: string;
};
type MeetingSuggestion = {
  id: string;
  author: string;
  title: string;
  objective: string;
  agenda: string;
  participants: string;
  priority: string;
  status: string;
};
type Instructor = {
  id: string;
  name: string;
  email: string;
  role: string;
};


type AppState = {
  user: User | null;
  users: User[];
  agenda: AgendaItem[];
  instructors: Instructor[];
  posts: Post[];
  reports: Report[];
  transparencies: Transparency[];
  history: HistoryItem[];
  products: StoreProduct[];
  materialRequests: MaterialRequest[];
  eventRequests: EventRequest[];
  meetingSuggestions: MeetingSuggestion[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
registerAthlete: (
  data: Partial<User> & { name: string; email: string; password: string }
) => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  loadInstructors: () => Promise<void>;
  addAgenda: (item: Omit<AgendaItem, "id" | "status" | "checkinAt" | "checkoutAt" | "hoursCalculated"> & { professorId?: string | null }) => Promise<void>;
  startTrainingCheckIn: (agendaId: string) => Promise<void>;
  finishTrainingCheckOut: (agendaId: string) => Promise<void>;
  addPost: (caption: string, image?: string) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  reportComment: (postId: string, commentId: string, reason: string) => Promise<void>;
  addReport: (message: string) => void;
  addTransparency: (title: string, body: string) => void;
  addProduct: (product: Omit<StoreProduct, "id">) => Promise<void>;
  redeemItem: (productId: string) => Promise<void>;
  donate: (value: string, type: string) => void;
  applyWarning: (athleteCode: string, reason: string) => void;
  requestMaterial: (
    material: string,
    quantity: string,
    justification: string,
  ) => Promise<void>;
  requestEvent: (item: Omit<EventRequest, "id" | "author" | "status">) => Promise<void>;
  approveEvent: (id: string) => Promise<void>;
  suggestMeeting: (
    data: Omit<MeetingSuggestion, "id" | "author" | "status">,
  ) => void;
  createCoupon: (productId: string, discountPercent: number) => Promise<void>;
  canAccessDirectorate: boolean;
};

const initialUsers: User[] = [
  {
    id: "1",
    name: "Atleta Avisa",
    email: "atleta@appavisa.com",
    password: "123456",
    role: "athlete",
    coins: 0,
    hours: 0,
    warnings: 0,
    phone: "",
    modality: "Atletismo",
  },
  {
    id: "2",
    name: "Carlos Mendes",
    email: "diretor@appavisa.com",
    password: "123456",
    role: "director",
    coins: 0,
    hours: 0,
    warnings: 0,
    phone: "",
    modality: "Diretoria",
  },
  {
    id: "3",
    name: "Coach Silva",
    email: "orientador@appavisa.com",
    password: "123456",
    role: "coach",
    coins: 0,
    hours: 0,
    warnings: 0,
    phone: "",
    modality: "Orientador",
  },
  {
    id: "4",
    name: "Gerente Avisa",
    email: "gerente@appavisa.com",
    password: "123456",
    role: "manager",
    coins: 0,
    hours: 0,
    warnings: 0,
    phone: "",
    modality: "Gestão",
  },
  {
    id: "5",
    name: "Supervisor Avisa",
    email: "supervisor@appavisa.com",
    password: "123456",
    role: "supervisor",
    coins: 0,
    hours: 0,
    warnings: 0,
    phone: "",
    modality: "Supervisão",
  },
];

const initialProducts: StoreProduct[] = [
  {
    id: "s1",
    title: "Barra de Proteína",
    category: "Nutrição",
    price: 50,
    stock: 25,
    description: "Retirada no balcão da loja mediante voucher.",
    icon: "fast-food",
  },
  {
    id: "s2",
    title: "Garrafa Esportiva",
    category: "Equipamentos",
    price: 150,
    stock: 12,
    description: "Garrafa térmica para treinos e eventos.",
    icon: "water",
  },
  {
    id: "s3",
    title: "Camiseta Oficial",
    category: "Vestuário",
    price: 500,
    stock: 8,
    description: "Camiseta oficial do projeto APPAVISA.",
    icon: "shirt",
  },
  {
    id: "s4",
    title: "Aula Personalizada",
    category: "Premium",
    price: 1000,
    stock: 3,
    description: "Sessão individual com orientador credenciado.",
    icon: "barbell",
  },
];

const Ctx = createContext<AppState>({} as AppState);
const stamp = () => String(Date.now());
function voucherCode() {
  return `AVISA-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;
}
function finalPrice(product: StoreProduct) {
  return Math.max(
    0,
    Math.round(product.price * (1 - (product.discountPercent || 0) / 100)),
  );
}


function formatDateToPostgres(value?: string | null) {
  if (!value) return null;

  const clean = value.trim().replace(/\//g, '-');

  if (!clean) return null;

  const parts = clean.split('-');

  if (parts.length !== 3) return null;

  const [first, second, third] = parts;

  if (first.length === 4) {
    return `${first}-${second.padStart(2, '0')}-${third.padStart(2, '0')}`;
  }

  if (third.length === 4) {
    return `${third}-${second.padStart(2, '0')}-${first.padStart(2, '0')}`;
  }

  return null;
}

function normalizeCargo(value?: string | null) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function roleFromCargo(value?: string | null): UserRole {
  const cargo = normalizeCargo(value);

  if (cargo === "diretor" || cargo === "director") {
    return "director";
  }

  if (cargo === "gerente" || cargo === "manager") {
    return "manager";
  }

  if (cargo === "supervisor") {
    return "supervisor";
  }

  if (
    cargo === "professor" ||
    cargo === "orientador" ||
    cargo === "coordenador" ||
    cargo === "instrutor" ||
    cargo === "coach"
  ) {
    return "coach";
  }

  return "athlete";
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState(initialUsers);
  const [user, setUser] = useState<User | null>(null);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [materialRequests, setMaterialRequests] = useState<MaterialRequest[]>(
    [],
  );
  const [eventRequests, setEventRequests] = useState<EventRequest[]>([]);
  const [meetingSuggestions, setMeetingSuggestions] = useState<
    MeetingSuggestion[]
  >([]);
  const [transparencies, setTransparencies] = useState<Transparency[]>([
    {
      id: "t1",
      title: "Canal de transparência ativo",
      body: "A diretoria poderá publicar comunicados oficiais, documentos e avisos sobre o APPAVISA.",
      author: "Diretoria",
      date: "Hoje",
    },
  ]);
  const [historiesByUser, setHistoriesByUser] = useState<
    Record<string, HistoryItem[]>
  >({});

  const canAccessDirectorate =
    !!user && ["director", "manager", "supervisor"].includes(user.role);
  const history = user ? historiesByUser[user.id] || [] : [];
  const pushHistory = (
    userId: string,
    item: Omit<HistoryItem, "id" | "date">,
  ) =>
    setHistoriesByUser((prev) => ({
      ...prev,
      [userId]: [
        { id: stamp(), date: "Agora", ...item },
        ...(prev[userId] || []),
      ],
    }));


  async function loadGalleryPosts() {
    const { data: postRows, error: postsError } = await supabase
      .from("gallery_posts")
      .select("id,user_id,legenda,imagem_url,created_at")
      .order("created_at", { ascending: false });

    if (postsError) {
      console.log("[GALLERY LOAD POSTS ERROR]", postsError);
      Alert.alert("Erro", "Não foi possível carregar o feed social.");
      return;
    }

    if (!postRows || postRows.length === 0) {
      setPosts([]);
      return;
    }

    const postIds = postRows.map((post) => post.id);
    const userIds = Array.from(
      new Set(postRows.map((post) => post.user_id).filter(Boolean)),
    );

    const { data: commentRows, error: commentsError } = await supabase
      .from("gallery_comments")
      .select("id,post_id,user_id,comentario,denunciado,motivo_denuncia,created_at")
      .in("post_id", postIds)
      .order("created_at", { ascending: true });

    if (commentsError) {
      console.log("[GALLERY LOAD COMMENTS ERROR]", commentsError);
      Alert.alert("Erro", "Não foi possível carregar os comentários.");
      return;
    }

    const commentUserIds = (commentRows || [])
      .map((comment) => comment.user_id)
      .filter(Boolean);

    const allUserIds = Array.from(new Set([...userIds, ...commentUserIds]));

    let profileMap: Record<string, string> = {};

    if (allUserIds.length > 0) {
      const { data: profileRows, error: profilesError } = await supabase
        .from("profiles")
        .select("id,nome,email")
        .in("id", allUserIds);

      if (profilesError) {
        console.log("[GALLERY LOAD PROFILES ERROR]", profilesError);
      }

      profileMap = Object.fromEntries(
        (profileRows || []).map((profile) => [
          profile.id,
          profile.nome || profile.email || "Usuário APPAVISA",
        ]),
      );
    }

    const commentsByPost = (commentRows || []).reduce<
      Record<string, { id: string; author: string; text: string }[]>
    >((acc, comment) => {
      const postId = comment.post_id;

      if (!acc[postId]) acc[postId] = [];

      acc[postId].push({
        id: comment.id,
        author: profileMap[comment.user_id] || "Usuário APPAVISA",
        text: comment.denunciado
          ? `[Comentário denunciado] ${comment.comentario || ""}`
          : comment.comentario || "",
      });

      return acc;
    }, {});

    const mappedPosts: Post[] = postRows.map((post) => ({
      id: post.id,
      userId: post.user_id,
      author: profileMap[post.user_id] || "Usuário APPAVISA",
      caption: post.legenda || "",
      image: post.imagem_url || undefined,
      comments: commentsByPost[post.id] || [],
    }));

    setPosts(mappedPosts);
  }


  async function loadStoreProducts() {
    const { data: productRows, error: productsError } = await supabase
      .from("store_products")
      .select("id,nome,descricao,categoria,preco_coins,estoque,imagem_url,ativo,created_at")
      .eq("ativo", true)
      .order("created_at", { ascending: false });

    if (productsError) {
      console.log("[STORE LOAD PRODUCTS ERROR]", productsError);
      Alert.alert("Erro", "Não foi possível carregar os produtos da loja.");
      return;
    }

    const productIds = (productRows || []).map((product) => product.id);

    let couponMap: Record<string, number> = {};

    if (productIds.length > 0) {
      const { data: couponRows, error: couponsError } = await supabase
        .from("coupons")
        .select("id,product_id,desconto_percentual,ativo")
        .eq("ativo", true)
        .in("product_id", productIds);

      if (couponsError) {
        console.log("[STORE LOAD COUPONS ERROR]", couponsError);
      }

      couponMap = Object.fromEntries(
        (couponRows || []).map((coupon) => [
          coupon.product_id,
          Number(coupon.desconto_percentual || 0),
        ]),
      );
    }

    const categoryIcon: Record<string, string> = {
      "Nutrição": "fast-food",
      "Vestuário": "shirt",
      "Equipamentos": "water",
      "Premium": "barbell",
    };

    const mappedProducts: StoreProduct[] = (productRows || []).map((product) => ({
      id: product.id,
      title: product.nome || "Produto",
      category: product.categoria || "Premium",
      price: Number(product.preco_coins || 0),
      stock: Number(product.estoque || 0),
      description: product.descricao || "Retirada no balcão da loja mediante voucher.",
      icon: categoryIcon[product.categoria || ""] || "gift",
      discountPercent: couponMap[product.id] || undefined,
    }));

    setProducts(mappedProducts);
  }

  async function loadAgendaEvents(currentUser: User) {
    let query = supabase
      .from("events")
      .select("id,titulo,tipo,local,data_evento,hora_inicio,criado_por,aprovado,created_at,professor_id,status,checkin_at,checkout_at,horas_calculadas")
      .order("data_evento", { ascending: true })
      .order("hora_inicio", { ascending: true });

    if (currentUser.role === "athlete") {
      query = query.or(`aprovado.eq.true,criado_por.eq.${currentUser.id}`);
    }

    if (currentUser.role === "coach") {
      query = query.or(`professor_id.eq.${currentUser.id},criado_por.eq.${currentUser.id}`);
    }

    const { data: eventRows, error: agendaError } = await query;

    if (agendaError) {
      console.log("[AGENDA LOAD ERROR]", agendaError);
      return;
    }

    const mappedAgenda: AgendaItem[] = (eventRows || []).map((event) => ({
      id: event.id,
      title: event.titulo || "Evento",
      type:
        event.tipo === "evento"
          ? "Evento"
          : event.tipo === "reunião" || event.tipo === "reuniao"
            ? "Reunião"
            : "Treino",
      date: event.data_evento || "",
      time: event.hora_inicio || "",
      location: event.local || "",
      createdBy: event.criado_por || undefined,
      professorId: event.professor_id || null,
      status: event.status || "agendado",
      checkinAt: event.checkin_at || null,
      checkoutAt: event.checkout_at || null,
      hoursCalculated: Number(event.horas_calculadas || 0),
    }));

    setAgenda(mappedAgenda);
  }

  async function loadInstructors() {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,nome,email,cargo,ativo")
      .order("nome", { ascending: true });

    if (error) {
      console.log("[INSTRUCTORS LOAD ERROR]", error);
      setInstructors([]);
      return;
    }

    const allowedRoles = ["professor", "orientador", "coordenador", "instrutor"];

    const mappedInstructors: Instructor[] = (data || [])
      .filter((item) => {
        const role = normalizeCargo(item.cargo);
        const isActive = item.ativo === true || item.ativo === null || item.ativo === undefined;

        return allowedRoles.includes(role) && isActive;
      })
      .map((item) => ({
        id: item.id,
        name: item.nome || item.email || "Instrutor APPAVISA",
        email: item.email || "",
        role: normalizeCargo(item.cargo) || "professor",
      }));

    console.log("[INSTRUCTORS LOADED]", mappedInstructors);

    setInstructors(mappedInstructors);
  }

  function diffHours(startIso?: string | null, endIso?: string | null) {
    if (!startIso || !endIso) return 0;

    const start = new Date(startIso).getTime();
    const end = new Date(endIso).getTime();

    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;

    return Math.round(((end - start) / 1000 / 60 / 60) * 100) / 100;
  }



  const api = useMemo<AppState>(
    () => ({
      user,
      users,
      agenda,
      instructors,
      posts,
      reports,
      transparencies,
      history,
      products,
      materialRequests,
      eventRequests,
      meetingSuggestions,
      canAccessDirectorate,
      async login(email, password) {
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPassword = password.trim();

        console.log("[APPAVISA LOGIN] Iniciando login:", normalizedEmail);

        const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password: normalizedPassword,
        });

        if (error || !data.user) {
          console.log("[APPAVISA LOGIN] Erro Auth:", error);
          Alert.alert(
            "Login inválido",
            error?.message || "Confira seu e-mail e senha.",
          );
          return false;
        }

        console.log("[APPAVISA LOGIN] Auth OK. User ID:", data.user.id);

        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select(
            "id,nome,email,cargo,foto_url,telefone,data_nascimento,esporte,equipe,ativo,horas_total,coins",
          )
          .eq("id", data.user.id)
          .limit(1);

        console.log("[APPAVISA LOGIN] Profiles retornados:", profiles);
        console.log("[APPAVISA LOGIN] Profile error:", profileError);

        if (profileError) {
          Alert.alert(
            "Erro ao buscar perfil",
            profileError.message ||
              "O login foi feito, mas houve erro ao consultar o perfil.",
          );
          return false;
        }

        const profile = profiles?.[0];

        if (!profile) {
          Alert.alert(
            "Perfil não encontrado",
            `O usuário existe no Auth, mas não há perfil vinculado.\n\nAuth ID: ${data.user.id}\nEmail: ${normalizedEmail}`,
          );
          return false;
        }

        if (profile.ativo === false) {
          Alert.alert(
            "Usuário inativo",
            "Seu acesso está inativo. Entre em contato com a diretoria.",
          );
          return false;
        }

        const profileCargo = normalizeCargo(profile.cargo);

        console.log("[APPAVISA LOGIN] Cargo bruto:", profile.cargo);
        console.log("[APPAVISA LOGIN] Cargo normalizado:", profileCargo);

        const loggedUser: User = {
          id: profile.id,
          name: profile.nome || "Usuário APPAVISA",
          email: profile.email || normalizedEmail,
          password: "",
          role: roleFromCargo(profileCargo),
          coins: Number(profile.coins || 0),
          hours: Number(profile.horas_total || 0),
          warnings: 0,
          phone: profile.telefone || "",
          modality: profile.esporte || "",
          sport: profile.esporte || "",
          team: profile.equipe || "",
          profileImage: profile.foto_url || "",
          birth: profile.data_nascimento || "",
        };

        setUser(loggedUser);
        await loadAgendaEvents(loggedUser);
        await loadGalleryPosts();
        await loadStoreProducts();
        await loadInstructors();
        //await registerForPushNotifications(loggedUser.id);
        return true;
      },
      logout() {
        setUser(null);
      },
      async registerAthlete(data) {
        const normalizedEmail = data.email.trim().toLowerCase();
        const normalizedPassword = data.password.trim();

        console.log("[APPAVISA CADASTRO] Iniciando cadastro:", normalizedEmail);

        if (!data.name?.trim() || !normalizedEmail || !normalizedPassword) {
          Alert.alert("Campos obrigatórios", "Preencha nome, e-mail e senha.");
          return;
        }

        if (normalizedPassword.length < 6) {
          Alert.alert("Senha fraca", "A senha precisa ter pelo menos 6 caracteres.");
          return;
        }

        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: normalizedEmail,
          password: normalizedPassword,
        });

        console.log("[APPAVISA CADASTRO] Auth data:", authData);
        console.log("[APPAVISA CADASTRO] Auth error:", authError);

        if (authError || !authData.user) {
          Alert.alert(
            "Erro no cadastro",
            authError?.message || "Não foi possível criar o usuário no Supabase Auth.",
          );
          return;
        }

        const profilePayload = {
          id: authData.user.id,
          nome: data.name.trim(),
          email: normalizedEmail,
          cargo: "atleta",
          telefone: data.phone || null,
          data_nascimento: formatDateToPostgres(data.birth),
          esporte: data.sport || data.modality || null,
          equipe: data.team || null,
          coins: 0,
          horas_total: 0,
          ativo: true,
        };

        const { data: createdProfile, error: profileError } = await supabase
          .from("profiles")
          .upsert(profilePayload, { onConflict: "id" })
          .select("id,nome,email,cargo,coins,horas_total")
          .maybeSingle();

        console.log("[APPAVISA CADASTRO] Profile payload:", profilePayload);
        console.log("[APPAVISA CADASTRO] Profile criado:", createdProfile);
        console.log("[APPAVISA CADASTRO] Profile error:", profileError);

        if (profileError) {
          Alert.alert(
            "Erro ao criar perfil",
            `${profileError.message}

O usuário foi criado no Auth, mas o perfil não foi salvo. Verifique as policies da tabela profiles.`,
          );
          return;
        }

        Alert.alert(
          "Cadastro concluído",
          "Atleta cadastrado com sucesso. Agora faça login.",
        );
      },
      async updateProfile(data) {
  if (!user) return;

  const { error } = await supabase
    .from("profiles")
    .update({
      nome: data.name || user.name,
      telefone: data.phone && data.phone.trim() !== "" ? data.phone : null,
      data_nascimento: formatDateToPostgres(data.birth),
      esporte: data.sport || data.modality || null,
      equipe: data.team && data.team.trim() !== "" ? data.team : null,
      foto_url: data.profileImage || null,
    })
    .eq("id", user.id);

  if (error) {
    console.log("[PROFILE UPDATE ERROR]", error);

    Alert.alert(
      "Erro",
      "Não foi possível salvar o perfil."
    );

    return;
  }

  const updated = {
    ...user,
    ...data,
  };

  setUser(updated);

  setUsers((prev) =>
    prev.map((u) =>
      u.id === user.id ? updated : u
    )
  );

  Alert.alert(
    "Sucesso",
    "Perfil atualizado no Supabase."
  );
},
      async loadInstructors() {
        await loadInstructors();
      },
     async addAgenda(item) {
  if (!user) return;

  const { data, error } = await supabase
    .from("events")
    .insert({
      titulo: item.title,
      descricao: `${item.type} criado pelo app`,
      tipo: item.type.toLowerCase(),
      local: item.location || null,
      data_evento: formatDateToPostgres(item.date) || item.date,
      hora_inicio: item.time,
      hora_fim: null,
      criado_por: user.id,
      professor_id: item.professorId || (user.role === "coach" ? user.id : null),
      status: "agendado",
      checkin_at: null,
      checkout_at: null,
      horas_calculadas: 0,
      aprovado: user.role === "athlete" ? false : true,
    })
    .select("*")
    .single();

  if (error) {
    console.log("[AGENDA INSERT ERROR]", error);
    Alert.alert("Erro", "Não foi possível salvar na agenda.");
    return;
  }

  const ag: AgendaItem = {
    id: data.id,
    title: data.titulo,
    type:
      data.tipo === "evento"
        ? "Evento"
        : data.tipo === "reunião" || data.tipo === "reuniao"
        ? "Reunião"
        : "Treino",
    date: data.data_evento,
    time: data.hora_inicio,
    location: data.local || "",
    createdBy: user.name,
    professorId: data.professor_id || null,
    status: data.status || "agendado",
    checkinAt: data.checkin_at || null,
    checkoutAt: data.checkout_at || null,
    hoursCalculated: Number(data.horas_calculadas || 0),
  };

  setAgenda((prev) => [ag, ...prev]);

  pushHistory(user.id, {
    type: "atividade",
    title: item.title,
    description: `${item.type} cadastrado para ${item.date} às ${item.time}`,
    status: "Agendado",
  });

  Alert.alert("Sucesso", "Evento salvo na agenda.");
},
      async startTrainingCheckIn(agendaId) {
        if (!user) return;

        const target = agenda.find((item) => item.id === agendaId);

        if (!target) {
          Alert.alert("Agenda não encontrada", "Não foi possível localizar este treino.");
          return;
        }

        if (target.professorId && target.professorId !== user.id && user.role === "coach") {
          Alert.alert("Acesso negado", "Este treino não está vinculado ao seu perfil.");
          return;
        }

        const now = new Date().toISOString();

        const { error } = await supabase
          .from("events")
          .update({
            status: "em_andamento",
            checkin_at: now,
          })
          .eq("id", agendaId);

        if (error) {
          console.log("[TRAINING CHECKIN ERROR]", error);
          Alert.alert("Erro", "Não foi possível iniciar o check-in automático.");
          return;
        }

        setAgenda((prev) =>
          prev.map((item) =>
            item.id === agendaId
              ? { ...item, status: "em_andamento", checkinAt: now }
              : item,
          ),
        );

        Alert.alert("Check-in iniciado", "A contagem de horas foi iniciada.");
      },
      async finishTrainingCheckOut(agendaId) {
        if (!user) return;

        const target = agenda.find((item) => item.id === agendaId);

        if (!target) {
          Alert.alert("Agenda não encontrada", "Não foi possível localizar este treino.");
          return;
        }

        if (!target.checkinAt) {
          Alert.alert("Check-in obrigatório", "Inicie o check-in antes de encerrar a aula.");
          return;
        }

        const now = new Date().toISOString();
        const calculatedHours = diffHours(target.checkinAt, now);
        const newTotalHours = Math.round(((user.hours || 0) + calculatedHours) * 100) / 100;

        const { error: eventError } = await supabase
          .from("events")
          .update({
            status: "finalizado",
            checkout_at: now,
            horas_calculadas: calculatedHours,
          })
          .eq("id", agendaId);

        if (eventError) {
          console.log("[TRAINING CHECKOUT EVENT ERROR]", eventError);
          Alert.alert("Erro", "Não foi possível finalizar a aula.");
          return;
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .update({ horas_total: newTotalHours })
          .eq("id", user.id);

        if (profileError) {
          console.log("[TRAINING CHECKOUT PROFILE ERROR]", profileError);
          Alert.alert("Aula finalizada parcialmente", "A aula foi encerrada, mas não foi possível somar as horas no perfil.");
          return;
        }

        const updatedUser = { ...user, hours: newTotalHours };
        setUser(updatedUser);
        setUsers((prev) => prev.map((item) => (item.id === user.id ? updatedUser : item)));

        setAgenda((prev) =>
          prev.map((item) =>
            item.id === agendaId
              ? {
                  ...item,
                  status: "finalizado",
                  checkoutAt: now,
                  hoursCalculated: calculatedHours,
                }
              : item,
          ),
        );

        pushHistory(user.id, {
          type: "atividade",
          title: target.title,
          description: `Aula finalizada. Horas contabilizadas: ${calculatedHours}h`,
          status: "Finalizado",
        });

        Alert.alert("Aula finalizada", `Foram contabilizadas ${calculatedHours}h no seu perfil.`);
      },
      async addPost(caption, image) {
        if (!user) return;

        const cleanCaption = caption.trim();

        if (!cleanCaption && !image) {
          Alert.alert("Post vazio", "Adicione uma foto ou uma legenda.");
          return;
        }

        const { data, error } = await supabase
          .from("gallery_posts")
          .insert({
            user_id: user.id,
            legenda: cleanCaption || null,
            imagem_url: image || null,
          })
          .select("id,user_id,legenda,imagem_url,created_at")
          .single();

        if (error) {
          console.log("[GALLERY ADD POST ERROR]", error);
          Alert.alert("Erro", "Não foi possível publicar no feed.");
          return;
        }

        const newPost: Post = {
          id: data.id,
          userId: data.user_id,
          author: user.name,
          caption: data.legenda || "",
          image: data.imagem_url || undefined,
          comments: [],
        };

        setPosts((prev) => [newPost, ...prev]);
        Alert.alert("Sucesso", "Publicação enviada para o feed.");
      },
      async deletePost(id) {
        if (!user) return;

        const target = posts.find((post) => post.id === id);

        if (target && target.userId !== user.id && !canAccessDirectorate) {
          Alert.alert("Acesso negado", "Você só pode apagar suas próprias publicações.");
          return;
        }

        const { error: commentsError } = await supabase
          .from("gallery_comments")
          .delete()
          .eq("post_id", id);

        if (commentsError) {
          console.log("[GALLERY DELETE POST COMMENTS ERROR]", commentsError);
          Alert.alert("Erro", "Não foi possível apagar os comentários da publicação.");
          return;
        }

        const { error } = await supabase
          .from("gallery_posts")
          .delete()
          .eq("id", id);

        if (error) {
          console.log("[GALLERY DELETE POST ERROR]", error);
          Alert.alert("Erro", "Não foi possível apagar a publicação.");
          return;
        }

        setPosts((prev) => prev.filter((post) => post.id !== id));
        Alert.alert("Publicação apagada", "A publicação foi removida do feed.");
      },
      async addComment(postId, text) {
        if (!user) return;

        const cleanText = text.trim();

        if (!cleanText) {
          Alert.alert("Comentário vazio", "Digite um comentário.");
          return;
        }

        const { data, error } = await supabase
          .from("gallery_comments")
          .insert({
            post_id: postId,
            user_id: user.id,
            comentario: cleanText,
            denunciado: false,
            motivo_denuncia: null,
          })
          .select("id,post_id,user_id,comentario,created_at")
          .single();

        if (error) {
          console.log("[GALLERY ADD COMMENT ERROR]", error);
          Alert.alert("Erro", "Não foi possível enviar o comentário.");
          return;
        }

        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [
                    ...post.comments,
                    {
                      id: data.id,
                      author: user.name,
                      text: data.comentario || cleanText,
                    },
                  ],
                }
              : post,
          ),
        );
      },
      async deleteComment(postId, commentId) {
        if (!user) return;

        const { error } = await supabase
          .from("gallery_comments")
          .delete()
          .eq("id", commentId);

        if (error) {
          console.log("[GALLERY DELETE COMMENT ERROR]", error);
          Alert.alert("Erro", "Não foi possível apagar o comentário.");
          return;
        }

        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: post.comments.filter(
                    (comment) => comment.id !== commentId,
                  ),
                }
              : post,
          ),
        );
      },
      async reportComment(postId, commentId, reason) {
        const { error } = await supabase
          .from("gallery_comments")
          .update({
            denunciado: true,
            motivo_denuncia: reason,
          })
          .eq("id", commentId);

        if (error) {
          console.log("[GALLERY REPORT COMMENT ERROR]", error);
          Alert.alert("Erro", "Não foi possível denunciar o comentário.");
          return;
        }

        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: post.comments.map((comment) =>
                    comment.id === commentId
                      ? {
                          ...comment,
                          text: `[Comentário denunciado] ${comment.text}`,
                        }
                      : comment,
                  ),
                }
              : post,
          ),
        );

        Alert.alert(
          "Comentário denunciado",
          `Motivo: ${reason}. A denúncia foi enviada para análise da diretoria.`,
        );
      },
      addReport(message) {
        if (!user) return;
        setReports((prev) => [
          {
            id: stamp(),
            author: user.name,
            message,
            status: "Enviado para orientadores e diretoria",
          },
          ...prev,
        ]);
        Alert.alert(
          "Reporte enviado",
          "Orientadores e diretoria foram notificados.",
        );
      },
      addTransparency(title, body) {
        if (!user) return;
        setTransparencies((prev) => [
          { id: stamp(), title, body, author: user.name, date: "Agora" },
          ...prev,
        ]);
      },
      async addProduct(product) {
        if (!canAccessDirectorate) {
          Alert.alert(
            "Acesso negado",
            "Somente diretoria, gerente ou supervisor podem cadastrar produtos.",
          );
          return;
        }

        const { data, error } = await supabase
          .from("store_products")
          .insert({
            nome: product.title.trim(),
            descricao: product.description || "Retirada no balcão da loja mediante voucher.",
            categoria: product.category || "Premium",
            preco_coins: Number(product.price || 0),
            estoque: Number(product.stock || 0),
            imagem_url: null,
            ativo: true,
          })
          .select("id,nome,descricao,categoria,preco_coins,estoque,imagem_url,ativo,created_at")
          .single();

        if (error) {
          console.log("[STORE ADD PRODUCT ERROR]", error);
          Alert.alert("Erro", "Não foi possível cadastrar o produto no Supabase.");
          return;
        }

        const categoryIcon: Record<string, string> = {
          "Nutrição": "fast-food",
          "Vestuário": "shirt",
          "Equipamentos": "water",
          "Premium": "barbell",
        };

        const newProduct: StoreProduct = {
          id: data.id,
          title: data.nome,
          category: data.categoria || "Premium",
          price: Number(data.preco_coins || 0),
          stock: Number(data.estoque || 0),
          description: data.descricao || "Retirada no balcão da loja mediante voucher.",
          icon: categoryIcon[data.categoria || ""] || product.icon || "gift",
        };

        setProducts((prev) => [newProduct, ...prev]);
        Alert.alert("Produto cadastrado", `${newProduct.title} foi adicionado à loja.`);
      },
      async redeemItem(productId) {
        if (!user) return;

        const product = products.find((p) => p.id === productId);
        if (!product) return;

        const price = finalPrice(product);

        if (product.stock <= 0) {
          Alert.alert("Produto indisponível", "Este item está sem estoque.");
          return;
        }

        if (user.coins < price) {
          Alert.alert(
            "Saldo insuficiente",
            `Você tem ${user.coins} coins e este item custa ${price} coins.`,
          );
          return;
        }

        const updatedCoins = user.coins - price;
        const code = voucherCode();

        const { error: profileError } = await supabase
          .from("profiles")
          .update({ coins: updatedCoins })
          .eq("id", user.id);

        if (profileError) {
          console.log("[STORE UPDATE COINS ERROR]", profileError);
          Alert.alert("Erro", "Não foi possível atualizar seu saldo de coins.");
          return;
        }

        const { error: stockError } = await supabase
          .from("store_products")
          .update({ estoque: Math.max(0, product.stock - 1) })
          .eq("id", product.id);

        if (stockError) {
          console.log("[STORE UPDATE STOCK ERROR]", stockError);
          Alert.alert("Erro", "Não foi possível atualizar o estoque do produto.");
          return;
        }

        const { error: voucherError } = await supabase
          .from("vouchers")
          .insert({
            user_id: user.id,
            product_id: product.id,
            codigo: code,
            status: "pendente",
          });

        if (voucherError) {
          console.log("[STORE CREATE VOUCHER ERROR]", voucherError);
          Alert.alert("Erro", "Não foi possível gerar o voucher.");
          return;
        }

        const updated = { ...user, coins: updatedCoins };
        const voucher: HistoryItem = {
          id: stamp(),
          type: "voucher",
          title: `Voucher - ${product.title}`,
          description: `Apresente este código no balcão da loja para retirar: ${product.title}. Valor debitado: ${price} coins.`,
          date: "Agora",
          code,
          status: "Aguardando retirada",
        };

        setUser(updated);
        setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
        setProducts((prev) =>
          prev.map((p) =>
            p.id === product.id ? { ...p, stock: Math.max(0, p.stock - 1) } : p,
          ),
        );
        setHistoriesByUser((prev) => ({
          ...prev,
          [user.id]: [voucher, ...(prev[user.id] || [])],
        }));

        Alert.alert("Resgate realizado", `Foram debitados ${price} coins. Voucher: ${code}`);
      },
      donate(value, type) {
        if (!user) return;
        pushHistory(user.id, {
          type: "doacao",
          title: "Interesse de doação",
          description: `${type}: ${value}`,
          status: "Registrado",
        });
        Alert.alert(
          "Doação registrada",
          `Obrigado. Doação de ${type}: ${value}. Em produção, conectaremos Pix/cartão.`,
        );
      },
      applyWarning(athleteCode, reason) {
        if (!user) return;
        const target = users.find(
          (u) =>
            u.id === athleteCode ||
            u.email.toLowerCase() === athleteCode.toLowerCase().trim(),
        );
        if (!target) {
          Alert.alert(
            "Atleta não encontrado",
            "Use o QR Code/ID ou e-mail do atleta cadastrado.",
          );
          return;
        }
        const updatedTarget = { ...target, warnings: target.warnings + 1 };
        setUsers((prev) =>
          prev.map((u) => (u.id === target.id ? updatedTarget : u)),
        );
        if (target.id === user.id) setUser(updatedTarget);
        pushHistory(target.id, {
          type: "advertencia",
          title: "Advertência aplicada",
          description: `Motivo: ${reason}. Aplicada por ${user.name}.`,
          status: "Registrada",
        });
        setReports((prev) => [
          {
            id: stamp(),
            author: user.name,
            message: `Advertência aplicada ao atleta ${target.name}. Motivo: ${reason}`,
            status: "Enviado para diretoria",
          },
          ...prev,
        ]);
        Alert.alert(
          "Advertência aplicada",
          `Advertência registrada para ${target.name}.`,
        );
      },
      async requestMaterial(material, quantity, justification) {
        if (!user) return;

        const cleanMaterial = material.trim();
        const cleanQuantity = quantity.trim();
        const cleanJustification = justification.trim();

        if (!cleanMaterial || !cleanQuantity || !cleanJustification) {
          Alert.alert(
            "Campos obrigatórios",
            "Preencha material, quantidade e justificativa.",
          );
          return;
        }

        const { data, error } = await supabase
          .from("material_requests")
          .insert({
            professor_id: user.id,
            titulo: cleanMaterial,
            descricao: `Quantidade: ${cleanQuantity}\n\nJustificativa: ${cleanJustification}`,
            status: "pendente",
          })
          .select("id,professor_id,titulo,descricao,status,created_at")
          .single();

        if (error) {
          console.log("[MATERIAL REQUEST INSERT ERROR]", error);
          Alert.alert("Erro", "Não foi possível enviar a solicitação de material.");
          return;
        }

        const item: MaterialRequest = {
          id: data.id,
          author: user.name,
          material: cleanMaterial,
          quantity: cleanQuantity,
          justification: cleanJustification,
          status: data.status || "pendente",
        };

        setMaterialRequests((prev) => [item, ...prev]);

        pushHistory(user.id, {
          type: "material",
          title: `Material solicitado: ${cleanMaterial}`,
          description: `${cleanQuantity} unidade(s). Justificativa: ${cleanJustification}`,
          status: "Aguardando aprovação administrativa",
        });

        Alert.alert(
          "Solicitação enviada",
          "Seu pedido foi enviado para análise administrativa.",
        );
      },
      async requestEvent(item) {
        if (!user) return;

        const cleanTitle = item.title.trim();
        const cleanDate = item.date.trim();
        const cleanTime = item.time.trim();
        const cleanLocation = item.location.trim();
        const cleanDescription = item.description?.trim() || "";

        if (!cleanTitle || !cleanDate || !cleanTime || !cleanLocation) {
          Alert.alert("Campos obrigatórios", "Informe título, data, horário e local.");
          return;
        }

        const { data, error } = await supabase
          .from("event_requests")
          .insert({
            professor_id: user.id,
            titulo: cleanTitle,
            data_evento: cleanDate,
            descricao: `Horário: ${cleanTime}\nLocal: ${cleanLocation}\n\n${cleanDescription}`,
            status: "pendente",
          })
          .select("id,professor_id,titulo,descricao,data_evento,status,created_at")
          .single();

        if (error) {
          console.log("[EVENT REQUEST INSERT ERROR]", error);
          Alert.alert("Erro", "Não foi possível enviar a solicitação de evento.");
          return;
        }

        const req: EventRequest = {
          id: data.id,
          author: user.name,
          title: cleanTitle,
          date: cleanDate,
          time: cleanTime,
          location: cleanLocation,
          description: cleanDescription,
          status: data.status || "pendente",
        };

        setEventRequests((prev) => [req, ...prev]);

        pushHistory(user.id, {
          type: "evento",
          title: cleanTitle,
          description: `${cleanDate} às ${cleanTime} - ${cleanLocation}`,
          status: "Aguardando aprovação administrativa",
        });

        Alert.alert(
          "Evento solicitado",
          "A solicitação foi enviada para aprovação.",
        );
      },
      async approveEvent(id) {
        const req = eventRequests.find((e) => e.id === id);

        if (!req || !canAccessDirectorate || !user) return;

        const { error: updateError } = await supabase
          .from("event_requests")
          .update({ status: "aprovado" })
          .eq("id", id);

        if (updateError) {
          console.log("[EVENT REQUEST APPROVE ERROR]", updateError);
          Alert.alert("Erro", "Não foi possível aprovar a solicitação.");
          return;
        }

        const { data: eventData, error: eventError } = await supabase
          .from("events")
          .insert({
            titulo: req.title,
            descricao: req.description || "Evento aprovado pela diretoria.",
            tipo: "evento",
            local: req.location || null,
            data_evento: req.date,
            hora_inicio: req.time,
            hora_fim: null,
            criado_por: user.id,
            aprovado: true,
          })
          .select("*")
          .single();

        if (eventError) {
          console.log("[EVENT REQUEST CREATE EVENT ERROR]", eventError);
          Alert.alert(
            "Evento aprovado parcialmente",
            "A solicitação foi aprovada, mas não foi possível criar o evento na agenda.",
          );
          return;
        }

        setEventRequests((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: "Aprovado" } : e)),
        );

        setAgenda((prev) => [
          {
            id: eventData.id,
            title: eventData.titulo,
            type: "Evento",
            date: eventData.data_evento,
            time: eventData.hora_inicio,
            location: eventData.local || "",
            createdBy: "Diretoria",
          },
          ...prev,
        ]);

        Alert.alert(
          "Evento aprovado",
          "O evento foi enviado para a agenda e aparecerá no painel do professor.",
        );
      },
      suggestMeeting(data) {
        if (!user) return;
        const item = {
          ...data,
          id: stamp(),
          author: user.name,
          status: "Pauta sugerida",
        };
        setMeetingSuggestions((prev) => [item, ...prev]);
        pushHistory(user.id, {
          type: "pauta",
          title: data.title,
          description: `${data.objective}. Participantes: ${data.participants}`,
          status: item.status,
        });
        Alert.alert("Pauta enviada", "A sugestão foi registrada para reunião.");
      },
      async createCoupon(productId, discountPercent) {
        if (!canAccessDirectorate) {
          Alert.alert("Acesso negado", "Somente diretoria pode criar cupons.");
          return;
        }

        const product = products.find((p) => p.id === productId);
        if (!product) return;

        const safeDiscount = Math.min(100, Math.max(0, Number(discountPercent || 0)));
        const code = `CUPOM-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

        const { error } = await supabase
          .from("coupons")
          .insert({
            codigo: code,
            desconto_percentual: safeDiscount,
            product_id: productId,
            ativo: true,
          });

        if (error) {
          console.log("[STORE CREATE COUPON ERROR]", error);
          Alert.alert("Erro", "Não foi possível criar o cupom.");
          return;
        }

        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? { ...p, discountPercent: safeDiscount }
              : p,
          ),
        );

        Alert.alert("Cupom criado", `Cupom ${code} com ${safeDiscount}% de desconto aplicado.`);
      },
    }),
    [
      user,
      users,
      agenda,
      instructors,
      posts,
      reports,
      transparencies,
      history,
      products,
      canAccessDirectorate,
      materialRequests,
      eventRequests,
      meetingSuggestions,
    ],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export const useApp = () => useContext(Ctx);
