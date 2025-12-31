import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { colors } from '../styles/theme';
import { RootStackParamList, MainTabsParamList } from '../types';

// Screens
import HomeScreen from '../screens/HomeScreen';
import PostDetailScreen from '../screens/PostDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import CreatePostScreen from '../screens/CreatePostScreen';
import EditPostScreen from '../screens/EditPostScreen';
import AdminScreen from '../screens/AdminScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Professores Screens
import ProfessoresListScreen from '../screens/professores/ProfessoresListScreen';
import CreateProfessorScreen from '../screens/professores/CreateProfessorScreen';
import EditProfessorScreen from '../screens/professores/EditProfessorScreen';

// Alunos Screens
import AlunosListScreen from '../screens/alunos/AlunosListScreen';
import CreateAlunoScreen from '../screens/alunos/CreateAlunoScreen';
import EditAlunoScreen from '../screens/alunos/EditAlunoScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabsParamList>();

// Tab Icon Component
const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
  <View style={{ alignItems: 'center' }}>
    <Text style={{ fontSize: 24 }}>{icon}</Text>
  </View>
);

// Main Tab Navigator
const MainTabs: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const isProfessor = user?.role === 'professor';

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[500],
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: colors.border,
          paddingTop: 8,
          paddingBottom: 8,
          height: 65,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ focused }) => <TabIcon icon="📚" focused={focused} />,
        }}
      />
      
      {isAuthenticated && isProfessor && (
        <>
          <Tab.Screen
            name="Admin"
            component={AdminScreen}
            options={{
              tabBarLabel: 'Admin',
              tabBarIcon: ({ focused }) => <TabIcon icon="⚙️" focused={focused} />,
            }}
          />
          <Tab.Screen
            name="Professores"
            component={ProfessoresListScreen}
            options={{
              tabBarLabel: 'Professores',
              tabBarIcon: ({ focused }) => <TabIcon icon="👨‍🏫" focused={focused} />,
            }}
          />
          <Tab.Screen
            name="Alunos"
            component={AlunosListScreen}
            options={{
              tabBarLabel: 'Alunos',
              tabBarIcon: ({ focused }) => <TabIcon icon="👨‍🎓" focused={focused} />,
            }}
          />
        </>
      )}
      
      <Tab.Screen
        name="Profile"
        component={isAuthenticated ? ProfileScreen : LoginScreen}
        options={{
          tabBarLabel: isAuthenticated ? 'Perfil' : 'Login',
          tabBarIcon: ({ focused }) => (
            <TabIcon icon={isAuthenticated ? '👤' : '🔐'} focused={focused} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MainTabs" component={MainTabs} />
      <Stack.Screen 
        name="PostDetail" 
        component={PostDetailScreen}
        options={{
          headerShown: true,
          headerTitle: 'Detalhes do Post',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
        }}
      />
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{
          headerShown: true,
          headerTitle: 'Login',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
        }}
      />
      <Stack.Screen 
        name="CreatePost" 
        component={CreatePostScreen}
        options={{
          headerShown: true,
          headerTitle: 'Criar Post',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
        }}
      />
      <Stack.Screen 
        name="EditPost" 
        component={EditPostScreen}
        options={{
          headerShown: true,
          headerTitle: 'Editar Post',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
        }}
      />
      
      {/* Professores Routes */}
      <Stack.Screen 
        name="ProfessoresList" 
        component={ProfessoresListScreen}
        options={{
          headerShown: true,
          headerTitle: 'Professores',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
        }}
      />
      <Stack.Screen 
        name="CreateProfessor" 
        component={CreateProfessorScreen}
        options={{
          headerShown: true,
          headerTitle: 'Cadastrar Professor',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
        }}
      />
      <Stack.Screen 
        name="EditProfessor" 
        component={EditProfessorScreen}
        options={{
          headerShown: true,
          headerTitle: 'Editar Professor',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
        }}
      />
      
      {/* Alunos Routes */}
      <Stack.Screen 
        name="AlunosList" 
        component={AlunosListScreen}
        options={{
          headerShown: true,
          headerTitle: 'Alunos',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
        }}
      />
      <Stack.Screen 
        name="CreateAluno" 
        component={CreateAlunoScreen}
        options={{
          headerShown: true,
          headerTitle: 'Cadastrar Aluno',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
        }}
      />
      <Stack.Screen 
        name="EditAluno" 
        component={EditAlunoScreen}
        options={{
          headerShown: true,
          headerTitle: 'Editar Aluno',
          headerStyle: { backgroundColor: colors.primary },
          headerTintColor: colors.white,
        }}
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
