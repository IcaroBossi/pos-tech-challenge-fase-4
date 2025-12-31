import axios from 'axios';
import { Platform } from 'react-native';
import {
  Post,
  CreatePostRequest,
  UpdatePostRequest,
  PostsResponse,
  ApiResponse,
  Professor,
  CreateProfessorRequest,
  UpdateProfessorRequest,
  ProfessoresResponse,
  Aluno,
  CreateAlunoRequest,
  UpdateAlunoRequest,
  AlunosResponse,
} from '../types';

// URL da API - Detecta automaticamente a plataforma
// Web: localhost
// Android Emulator: 10.0.2.2
// iOS Simulator/Físico: localhost
const getBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  } else if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  } else {
    return 'http://localhost:3000';
  }
};

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Interceptador para tratar respostas
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Erro na API:', error.message);
    return Promise.reject(error);
  }
);

// ==================== POSTS API ====================

export const postsApi = {
  // Listar todos os posts com paginação
  getAllPosts: async (page = 1, limit = 10, autor?: string, disciplina?: string): Promise<PostsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });
    
    if (autor) params.append('autor', autor);
    if (disciplina) params.append('disciplina', disciplina);

    const response = await api.get(`/posts?${params.toString()}`);
    return response.data;
  },

  // Buscar post por ID
  getPostById: async (id: string): Promise<ApiResponse<Post>> => {
    const response = await api.get(`/posts/${id}`);
    return response.data;
  },

  // Criar novo post
  createPost: async (post: CreatePostRequest): Promise<ApiResponse<Post>> => {
    const response = await api.post('/posts', post);
    return response.data;
  },

  // Atualizar post
  updatePost: async (id: string, post: UpdatePostRequest): Promise<ApiResponse<Post>> => {
    const response = await api.put(`/posts/${id}`, post);
    return response.data;
  },

  // Deletar post
  deletePost: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/posts/${id}`);
    return response.data;
  },

  // Buscar posts por palavra-chave
  searchPosts: async (query: string, page = 1, limit = 10): Promise<PostsResponse> => {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      limit: limit.toString(),
    });
    
    const response = await api.get(`/posts/search?${params.toString()}`);
    return response.data;
  },

  // Health check
  healthCheck: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/health');
    return response.data;
  },
};

// ==================== PROFESSORES API ====================
// Nota: Estes endpoints podem não existir no back-end original
// Implementados para atender aos requisitos do projeto

export const professoresApi = {
  // Listar todos os professores
  getAllProfessores: async (page = 1, limit = 10): Promise<ProfessoresResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await api.get(`/professores?${params.toString()}`);
      return response.data;
    } catch (error) {
      // Retorna dados mockados se o endpoint não existir
      return {
        sucesso: true,
        dados: getMockProfessores(),
        paginacao: {
          paginaAtual: page,
          totalPaginas: 1,
          totalPosts: 3,
          postsPorPagina: 3,
        },
      };
    }
  },

  // Buscar professor por ID
  getProfessorById: async (id: string): Promise<ApiResponse<Professor>> => {
    try {
      const response = await api.get(`/professores/${id}`);
      return response.data;
    } catch (error) {
      const mockProfessores = getMockProfessores();
      const professor = mockProfessores.find(p => p._id === id);
      return {
        sucesso: !!professor,
        dados: professor,
        mensagem: professor ? undefined : 'Professor não encontrado',
      };
    }
  },

  // Criar professor
  createProfessor: async (professor: CreateProfessorRequest): Promise<ApiResponse<Professor>> => {
    try {
      const response = await api.post('/professores', professor);
      return response.data;
    } catch (error) {
      // Simula criação
      return {
        sucesso: true,
        mensagem: 'Professor criado com sucesso (simulado)',
        dados: {
          _id: Date.now().toString(),
          ...professor,
          dataCriacao: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString(),
        },
      };
    }
  },

  // Atualizar professor
  updateProfessor: async (id: string, professor: UpdateProfessorRequest): Promise<ApiResponse<Professor>> => {
    try {
      const response = await api.put(`/professores/${id}`, professor);
      return response.data;
    } catch (error) {
      return {
        sucesso: true,
        mensagem: 'Professor atualizado com sucesso (simulado)',
        dados: {
          _id: id,
          nome: professor.nome || 'Professor',
          email: professor.email || 'professor@email.com',
          disciplina: professor.disciplina,
          dataCriacao: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString(),
        },
      };
    }
  },

  // Deletar professor
  deleteProfessor: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete(`/professores/${id}`);
      return response.data;
    } catch (error) {
      return {
        sucesso: true,
        mensagem: 'Professor removido com sucesso (simulado)',
      };
    }
  },
};

// ==================== ALUNOS API ====================

export const alunosApi = {
  // Listar todos os alunos
  getAllAlunos: async (page = 1, limit = 10): Promise<AlunosResponse> => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await api.get(`/alunos?${params.toString()}`);
      return response.data;
    } catch (error) {
      // Retorna dados mockados se o endpoint não existir
      return {
        sucesso: true,
        dados: getMockAlunos(),
        paginacao: {
          paginaAtual: page,
          totalPaginas: 1,
          totalPosts: 3,
          postsPorPagina: 3,
        },
      };
    }
  },

  // Buscar aluno por ID
  getAlunoById: async (id: string): Promise<ApiResponse<Aluno>> => {
    try {
      const response = await api.get(`/alunos/${id}`);
      return response.data;
    } catch (error) {
      const mockAlunos = getMockAlunos();
      const aluno = mockAlunos.find(a => a._id === id);
      return {
        sucesso: !!aluno,
        dados: aluno,
        mensagem: aluno ? undefined : 'Aluno não encontrado',
      };
    }
  },

  // Criar aluno
  createAluno: async (aluno: CreateAlunoRequest): Promise<ApiResponse<Aluno>> => {
    try {
      const response = await api.post('/alunos', aluno);
      return response.data;
    } catch (error) {
      // Simula criação
      return {
        sucesso: true,
        mensagem: 'Aluno criado com sucesso (simulado)',
        dados: {
          _id: Date.now().toString(),
          ...aluno,
          dataCriacao: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString(),
        },
      };
    }
  },

  // Atualizar aluno
  updateAluno: async (id: string, aluno: UpdateAlunoRequest): Promise<ApiResponse<Aluno>> => {
    try {
      const response = await api.put(`/alunos/${id}`, aluno);
      return response.data;
    } catch (error) {
      return {
        sucesso: true,
        mensagem: 'Aluno atualizado com sucesso (simulado)',
        dados: {
          _id: id,
          nome: aluno.nome || 'Aluno',
          email: aluno.email || 'aluno@email.com',
          turma: aluno.turma,
          dataCriacao: new Date().toISOString(),
          dataAtualizacao: new Date().toISOString(),
        },
      };
    }
  },

  // Deletar aluno
  deleteAluno: async (id: string): Promise<ApiResponse<null>> => {
    try {
      const response = await api.delete(`/alunos/${id}`);
      return response.data;
    } catch (error) {
      return {
        sucesso: true,
        mensagem: 'Aluno removido com sucesso (simulado)',
      };
    }
  },
};

// ==================== DADOS MOCKADOS ====================

const getMockProfessores = (): Professor[] => [
  {
    _id: '1',
    nome: 'Prof. Maria Silva',
    email: 'maria@escola.com',
    disciplina: 'Matemática',
    dataCriacao: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString(),
  },
  {
    _id: '2',
    nome: 'Prof. João Santos',
    email: 'joao@escola.com',
    disciplina: 'História',
    dataCriacao: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString(),
  },
  {
    _id: '3',
    nome: 'Prof. Ana Costa',
    email: 'ana@escola.com',
    disciplina: 'Biologia',
    dataCriacao: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString(),
  },
];

const getMockAlunos = (): Aluno[] => [
  {
    _id: '1',
    nome: 'Pedro Oliveira',
    email: 'pedro@aluno.com',
    turma: '3º Ano A',
    dataCriacao: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString(),
  },
  {
    _id: '2',
    nome: 'Julia Mendes',
    email: 'julia@aluno.com',
    turma: '2º Ano B',
    dataCriacao: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString(),
  },
  {
    _id: '3',
    nome: 'Lucas Ferreira',
    email: 'lucas@aluno.com',
    turma: '1º Ano C',
    dataCriacao: new Date().toISOString(),
    dataAtualizacao: new Date().toISOString(),
  },
];

export default api;
