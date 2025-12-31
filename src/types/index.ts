// Tipos para Posts
export interface Post {
  _id: string;
  titulo: string;
  conteudo: string;
  autor: string;
  disciplina?: string;
  tags?: string[];
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface CreatePostRequest {
  titulo: string;
  conteudo: string;
  autor: string;
  disciplina?: string;
  tags?: string[];
}

export interface UpdatePostRequest {
  titulo?: string;
  conteudo?: string;
  autor?: string;
  disciplina?: string;
  tags?: string[];
}

// Tipos para Professores
export interface Professor {
  _id: string;
  nome: string;
  email: string;
  disciplina?: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface CreateProfessorRequest {
  nome: string;
  email: string;
  disciplina?: string;
}

export interface UpdateProfessorRequest {
  nome?: string;
  email?: string;
  disciplina?: string;
}

// Tipos para Alunos
export interface Aluno {
  _id: string;
  nome: string;
  email: string;
  turma?: string;
  dataCriacao: string;
  dataAtualizacao: string;
}

export interface CreateAlunoRequest {
  nome: string;
  email: string;
  turma?: string;
}

export interface UpdateAlunoRequest {
  nome?: string;
  email?: string;
  turma?: string;
}

// Tipos para API Response
export interface ApiResponse<T> {
  sucesso: boolean;
  mensagem?: string;
  dados?: T;
  erros?: string[];
}

export interface PaginationInfo {
  paginaAtual: number;
  totalPaginas: number;
  totalPosts: number;
  postsPorPagina: number;
}

export interface PostsResponse {
  sucesso: boolean;
  dados: Post[];
  paginacao: PaginationInfo;
  termoBusca?: string;
}

export interface ProfessoresResponse {
  sucesso: boolean;
  dados: Professor[];
  paginacao: PaginationInfo;
}

export interface AlunosResponse {
  sucesso: boolean;
  dados: Aluno[];
  paginacao: PaginationInfo;
}

// Tipos para Autenticação
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'professor' | 'student';
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Tipos para Navegação
export type RootStackParamList = {
  MainTabs: undefined;
  PostDetail: { postId: string };
  CreatePost: undefined;
  EditPost: { postId: string };
  Login: undefined;
  // Professores
  ProfessoresList: undefined;
  CreateProfessor: undefined;
  EditProfessor: { professorId: string };
  // Alunos
  AlunosList: undefined;
  CreateAluno: undefined;
  EditAluno: { alunoId: string };
};

export type MainTabsParamList = {
  Home: undefined;
  Admin: undefined;
  Professores: undefined;
  Alunos: undefined;
  Profile: undefined;
};
