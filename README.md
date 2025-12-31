# 📱 Blog Mobile - React Native

## Pós-Tech FIAP - Fase 4

Aplicativo mobile desenvolvido em **React Native com Expo** para o sistema de blog acadêmico da Pós-Tech FIAP. Este projeto representa a Fase 4 do Tech Challenge, complementando o back-end (Fase 2) e o front-end web (Fase 3).

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Execução](#instalação-e-execução)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Autenticação](#autenticação)
- [Screenshots](#screenshots)
- [Desafios e Soluções](#desafios-e-soluções)
- [Próximos Passos](#próximos-passos)

---

## 📖 Sobre o Projeto

Este aplicativo mobile foi desenvolvido como parte do Tech Challenge da Pós-Tech FIAP, implementando a interface mobile para um sistema de blog acadêmico. O app permite que professores e alunos interajam com conteúdos educacionais de forma intuitiva e responsiva.

### Contexto do Projeto

- **Fase 2**: API REST desenvolvida em Node.js/Express com MongoDB
- **Fase 3**: Front-end web desenvolvido em React/TypeScript
- **Fase 4**: Aplicativo mobile em React Native (este projeto)

---

## ✨ Funcionalidades

### Para Visitantes (Não autenticados)
- ✅ Visualizar lista de posts na página inicial
- ✅ Buscar posts por título ou conteúdo
- ✅ Ler o conteúdo completo de um post

### Para Alunos (Autenticados)
- ✅ Todas as funcionalidades de visitantes
- ✅ Acesso ao perfil do usuário
- ✅ Visualização de dados pessoais

### Para Professores (Autenticados)
- ✅ Todas as funcionalidades de alunos
- ✅ **CRUD de Posts**: Criar, visualizar, editar e excluir posts
- ✅ **CRUD de Professores**: Gerenciamento completo de professores
- ✅ **CRUD de Alunos**: Gerenciamento completo de alunos
- ✅ Página administrativa com visão geral do sistema

---

## 🏗️ Arquitetura

O projeto segue uma arquitetura modular e escalável:

```
src/
├── components/      # Componentes reutilizáveis (UI)
├── context/         # Contextos React (AuthContext)
├── navigation/      # Configuração de navegação
├── screens/         # Telas da aplicação
├── services/        # Serviços de API
├── styles/          # Tema e estilos globais
└── types/           # Definições TypeScript
```

### Padrões Utilizados

- **Context API**: Gerenciamento de estado global para autenticação
- **Custom Hooks**: Reutilização de lógica de negócios
- **Component-Based Architecture**: Componentes isolados e reutilizáveis
- **TypeScript**: Tipagem estática para maior segurança

---

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| React Native | ~0.73.0 | Framework para desenvolvimento mobile |
| Expo | ~50.0.0 | Plataforma de desenvolvimento |
| TypeScript | ^5.1.3 | Superset JavaScript com tipagem |
| React Navigation | ^6.x | Navegação entre telas |
| Axios | ^1.6.2 | Cliente HTTP para APIs |
| React Hook Form | ^7.49.2 | Gerenciamento de formulários |
| AsyncStorage | ^1.21.0 | Armazenamento local |

---

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** (versão 18 ou superior)
- **npm** ou **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **Expo Go** no dispositivo móvel (Android/iOS) ou emulador

### Para desenvolvimento com emulador:
- **Android Studio** com Android SDK (para Android)
- **Xcode** (para iOS - apenas macOS)

---

## 🚀 Instalação e Execução

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/pos-tech-challenge-fase-4.git
cd pos-tech-challenge-fase-4
```

### 2. Instale as dependências

```bash
npm install
# ou
yarn install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com as configurações necessárias:

```env
API_BASE_URL=http://localhost:3000
# Para Android Emulator, use: http://10.0.2.2:3000
```

### 4. Execute o projeto

```bash
# Iniciar o Expo
npx expo start

# Para Android
npx expo start --android

# Para iOS
npx expo start --ios
```

### 5. Escaneie o QR Code

Use o aplicativo **Expo Go** no seu dispositivo para escanear o QR Code exibido no terminal.

---

## 📁 Estrutura do Projeto

```
pos-tech-challenge-fase-4/
├── src/
│   ├── components/
│   │   ├── Button.tsx           # Botão customizado
│   │   ├── ConfirmModal.tsx     # Modal de confirmação
│   │   ├── ErrorMessage.tsx     # Exibição de erros
│   │   ├── Header.tsx           # Cabeçalho reutilizável
│   │   ├── Input.tsx            # Campo de entrada
│   │   ├── Loading.tsx          # Indicador de carregamento
│   │   └── PostCard.tsx         # Card de post
│   │
│   ├── context/
│   │   └── AuthContext.tsx      # Contexto de autenticação
│   │
│   ├── navigation/
│   │   └── AppNavigator.tsx     # Configuração de rotas
│   │
│   ├── screens/
│   │   ├── HomeScreen.tsx       # Listagem de posts
│   │   ├── PostDetailScreen.tsx # Detalhes do post
│   │   ├── LoginScreen.tsx      # Tela de login
│   │   ├── CreatePostScreen.tsx # Criar post
│   │   ├── EditPostScreen.tsx   # Editar post
│   │   ├── AdminScreen.tsx      # Painel administrativo
│   │   ├── ProfileScreen.tsx    # Perfil do usuário
│   │   │
│   │   ├── professores/
│   │   │   ├── ProfessoresListScreen.tsx
│   │   │   ├── CreateProfessorScreen.tsx
│   │   │   └── EditProfessorScreen.tsx
│   │   │
│   │   └── alunos/
│   │       ├── AlunosListScreen.tsx
│   │       ├── CreateAlunoScreen.tsx
│   │       └── EditAlunoScreen.tsx
│   │
│   ├── services/
│   │   └── api.ts               # Cliente API
│   │
│   ├── styles/
│   │   └── theme.ts             # Tokens de design
│   │
│   └── types/
│       └── index.ts             # Definições TypeScript
│
├── App.tsx                      # Entry point
├── app.json                     # Configuração Expo
├── babel.config.js              # Configuração Babel
├── package.json                 # Dependências
├── tsconfig.json                # Configuração TypeScript
└── README.md                    # Documentação
```

---

## 🔐 Autenticação

O sistema utiliza autenticação simulada (mock) com dois perfis de usuário:

### Credenciais de Teste

| Perfil | Email | Senha |
|--------|-------|-------|
| Professor | professor@blog.com | professor123 |
| Aluno | aluno@blog.com | aluno123 |

### Permissões por Perfil

| Funcionalidade | Visitante | Aluno | Professor |
|----------------|-----------|-------|-----------|
| Ver posts | ✅ | ✅ | ✅ |
| Buscar posts | ✅ | ✅ | ✅ |
| Ler post completo | ✅ | ✅ | ✅ |
| Ver perfil | ❌ | ✅ | ✅ |
| Criar post | ❌ | ❌ | ✅ |
| Editar/Excluir post | ❌ | ❌ | ✅ |
| CRUD Professores | ❌ | ❌ | ✅ |
| CRUD Alunos | ❌ | ❌ | ✅ |
| Painel Admin | ❌ | ❌ | ✅ |


## 🎯 Desafios e Soluções

### 1. Navegação Condicional
**Desafio**: Mostrar diferentes tabs baseado no papel do usuário.
**Solução**: Renderização condicional no AppNavigator baseada no estado de autenticação.

### 2. Formulários Complexos
**Desafio**: Gerenciar estado e validação de múltiplos formulários.
**Solução**: Uso do React Hook Form para gerenciamento centralizado de forms.

### 3. Responsividade
**Desafio**: Garantir boa experiência em diferentes tamanhos de tela.
**Solução**: Sistema de design tokens e StyleSheet flexível.


## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 🔗 Links Relacionados

- [Fase 2 - Back-end](https://github.com/IcaroRP/pos-tech-challenge-fase-2)
- [Fase 3 - Front-end Web](https://github.com/IcaroRP/pos-tech-challenge-fase-3)
Interface mobile para um blog educacional, desenvolvido para a disciplina de Mobile da Pós-Tech FIAP.
