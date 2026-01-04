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

export const professoresApi = {
  // Listar todos os professores
  getAllProfessores: async (page = 1, limit = 10): Promise<ProfessoresResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await api.get(`/professores?${params.toString()}`);
    return response.data;
  },

  // Buscar professor por ID
  getProfessorById: async (id: string): Promise<ApiResponse<Professor>> => {
    const response = await api.get(`/professores/${id}`);
    return response.data;
  },

  // Criar professor
  createProfessor: async (professor: CreateProfessorRequest): Promise<ApiResponse<Professor>> => {
    const response = await api.post('/professores', professor);
    return response.data;
  },

  // Atualizar professor
  updateProfessor: async (id: string, professor: UpdateProfessorRequest): Promise<ApiResponse<Professor>> => {
    const response = await api.put(`/professores/${id}`, professor);
    return response.data;
  },

  // Deletar professor
  deleteProfessor: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/professores/${id}`);
    return response.data;
  },
};

// ==================== ALUNOS API ====================

export const alunosApi = {
  // Listar todos os alunos
  getAllAlunos: async (page = 1, limit = 10): Promise<AlunosResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await api.get(`/alunos?${params.toString()}`);
    return response.data;
  },

  // Buscar aluno por ID
  getAlunoById: async (id: string): Promise<ApiResponse<Aluno>> => {
    const response = await api.get(`/alunos/${id}`);
    return response.data;
  },

  // Criar aluno
  createAluno: async (aluno: CreateAlunoRequest): Promise<ApiResponse<Aluno>> => {
    const response = await api.post('/alunos', aluno);
    return response.data;
  },

  // Atualizar aluno
  updateAluno: async (id: string, aluno: UpdateAlunoRequest): Promise<ApiResponse<Aluno>> => {
    const response = await api.put(`/alunos/${id}`, aluno);
    return response.data;
  },

  // Deletar aluno
  deleteAluno: async (id: string): Promise<ApiResponse<null>> => {
    const response = await api.delete(`/alunos/${id}`);
    return response.data;
  },
};

export default api;
