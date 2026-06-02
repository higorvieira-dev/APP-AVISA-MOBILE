import { supabase } from "../lib/supabase";
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

type AppState = {
  user: User | null;
  users: User[];
  agenda: AgendaItem[];
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
  addAgenda: (item: Omit<AgendaItem, "id">) => Promise<void>;
  addPost: (caption: string, image?: string) => Promise<void>;
  deletePost: (id: string) => Promise<void>;
  addComment: (postId: string, text: string) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  reportComment: (postId: string, commentId: string, reason: string) => Promise<void>;
  addReport: (message: string) => void;
  addTransparency: (title: string, body: string) => void;
  addProduct: (product: Omit<StoreProduct, "id">) => void;
  redeemItem: (productId: string) => void;
  donate: (value: string, type: string) => void;
  applyWarning: (athleteCode: string, reason: string) => void;
  requestMaterial: (
    material: string,
    quantity: string,
    justification: string,
  ) => void;
  requestEvent: (item: Omit<EventRequest, "id" | "author" | "status">) => void;
  approveEvent: (id: string) => void;
  suggestMeeting: (
    data: Omit<MeetingSuggestion, "id" | "author" | "status">,
  ) => void;
  createCoupon: (productId: string, discountPercent: number) => void;
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

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState(initialUsers);
  const [user, setUser] = useState<User | null>(null);
  const [agenda, setAgenda] = useState<AgendaItem[]>([]);
  const [products, setProducts] = useState<StoreProduct[]>(initialProducts);
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

  const api = useMemo<AppState>(
    () => ({
      user,
      users,
      agenda,
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
          .eq("email", normalizedEmail)
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

        const loggedUser: User = {
          id: profile.id,
          name: profile.nome || "Usuário APPAVISA",
          email: profile.email || normalizedEmail,
          password: "",
          role:
            profile.cargo === "diretor"
              ? "director"
              : profile.cargo === "gerente"
                ? "manager"
                : profile.cargo === "supervisor"
                  ? "supervisor"
                  : profile.cargo === "professor" ||
                      profile.cargo === "orientador"
                    ? "coach"
                    : "athlete",
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
        await loadGalleryPosts();
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
          data_nascimento: data.birth || null,
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
      data_nascimento: data.birth && data.birth.trim() !== "" ? data.birth : null,
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
     async addAgenda(item) {
  if (!user) return;

  const { data, error } = await supabase
    .from("events")
    .insert({
      titulo: item.title,
      descricao: `${item.type} criado pelo app`,
      tipo: item.type.toLowerCase(),
      local: item.location || null,
      data_evento: item.date,
      hora_inicio: item.time,
      hora_fim: null,
      criado_por: user.id,
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
      addProduct(product) {
        if (!canAccessDirectorate) {
          Alert.alert(
            "Acesso negado",
            "Somente diretoria, gerente ou supervisor podem cadastrar produtos.",
          );
          return;
        }
        setProducts((prev) => [{ ...product, id: stamp() }, ...prev]);
        Alert.alert(
          "Produto cadastrado",
          `${product.title} foi adicionado à loja.`,
        );
      },
      redeemItem(productId) {
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
        const updated = { ...user, coins: user.coins - price };
        const code = voucherCode();
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
        Alert.alert(
          "Resgate realizado",
          `Foram debitados ${price} coins. Voucher: ${code}`,
        );
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
      requestMaterial(material, quantity, justification) {
        if (!user) return;
        const item = {
          id: stamp(),
          author: user.name,
          material,
          quantity,
          justification,
          status: "Aguardando aprovação administrativa",
        };
        setMaterialRequests((prev) => [item, ...prev]);
        pushHistory(user.id, {
          type: "material",
          title: `Material solicitado: ${material}`,
          description: `${quantity} unidade(s). Justificativa: ${justification}`,
          status: item.status,
        });
        Alert.alert(
          "Solicitação enviada",
          "Seu pedido foi enviado para análise administrativa.",
        );
      },
      requestEvent(item) {
        if (!user) return;
        const req = {
          ...item,
          id: stamp(),
          author: user.name,
          status: "Aguardando aprovação administrativa",
        };
        setEventRequests((prev) => [req, ...prev]);
        pushHistory(user.id, {
          type: "evento",
          title: item.title,
          description: `${item.date} às ${item.time} - ${item.location}`,
          status: req.status,
        });
        Alert.alert(
          "Evento solicitado",
          "A solicitação foi enviada para aprovação.",
        );
      },
      approveEvent(id) {
        const req = eventRequests.find((e) => e.id === id);
        if (!req || !canAccessDirectorate) return;
        setEventRequests((prev) =>
          prev.map((e) => (e.id === id ? { ...e, status: "Aprovado" } : e)),
        );
        setAgenda((prev) => [
          {
            id: stamp(),
            title: req.title,
            type: "Evento",
            date: req.date,
            time: req.time,
            location: req.location,
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
      createCoupon(productId, discountPercent) {
        if (!canAccessDirectorate) {
          Alert.alert("Acesso negado", "Somente diretoria pode criar cupons.");
          return;
        }
        setProducts((prev) =>
          prev.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  discountPercent: Math.min(100, Math.max(0, discountPercent)),
                }
              : p,
          ),
        );
        Alert.alert(
          "Cupom aplicado",
          `Desconto de ${discountPercent}% aplicado ao produto selecionado.`,
        );
      },
    }),
    [
      user,
      users,
      agenda,
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
