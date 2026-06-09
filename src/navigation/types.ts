export type UserRole = 'athlete' | 'director' | 'manager' | 'supervisor' | 'coach' | 'admin';

export type RootStackParamList = {
  Welcome: undefined
  Login: undefined;
  AthleteRegister: undefined;
  MainTabs: undefined;
  CheckIn: undefined;
  Agenda: undefined;
  Store: undefined;
  Gallery: undefined;
  History: undefined;
  Transparency: undefined;
  Warnings: undefined;
  Donations: undefined;
  ReportCoach: undefined;
  Directorate: undefined;
  ProtectedRegister: { type: 'Diretoria' | 'Administrativo' | 'Orientador' };
  ApplyWarning: undefined;
  MaterialRequest: undefined;
  EventRequest: undefined;
  MeetingSuggestion: undefined;
  AdminFiles: undefined;
  Invite: undefined;
  CouponManager: undefined;
  DirectorVouchers: undefined;
  DirectorRequests: undefined;
  Ranking: undefined;
  CoinHistory: undefined;
  AcademyQRCode: undefined;
  MyTrainings: undefined;

};

export type MainTabParamList = {
  Painel: undefined;
  AgendaTab: undefined;
  QR: undefined;
  Loja: undefined;
  Perfil: undefined;
};
