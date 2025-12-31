import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';
import Button from '../components/Button';
import { colors, spacing, borderRadius, shadow } from '../styles/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      })
    );
  };

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notLoggedIn}>
          <Text style={styles.notLoggedInIcon}>🔒</Text>
          <Text style={styles.notLoggedInTitle}>Não conectado</Text>
          <Text style={styles.notLoggedInText}>
            Faça login para acessar seu perfil
          </Text>
          <Button
            title="Fazer Login"
            onPress={() => navigation.navigate('Login')}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>
              {user.role === 'professor' ? '👨‍🏫' : '👨‍🎓'}
            </Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {user.role === 'professor' ? 'Professor' : 'Aluno'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 Informações da Conta</Text>
          
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>ID</Text>
              <Text style={styles.infoValue}>{user.id}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tipo de Conta</Text>
              <Text style={styles.infoValue}>
                {user.role === 'professor' ? 'Professor (Acesso Completo)' : 'Aluno (Somente Leitura)'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔑 Permissões</Text>
          
          <View style={styles.permissionsCard}>
            <PermissionItem 
              text="Visualizar posts" 
              allowed={true} 
            />
            <PermissionItem 
              text="Criar posts" 
              allowed={user.role === 'professor'} 
            />
            <PermissionItem 
              text="Editar posts" 
              allowed={user.role === 'professor'} 
            />
            <PermissionItem 
              text="Excluir posts" 
              allowed={user.role === 'professor'} 
            />
            <PermissionItem 
              text="Gerenciar professores" 
              allowed={user.role === 'professor'} 
            />
            <PermissionItem 
              text="Gerenciar alunos" 
              allowed={user.role === 'professor'} 
            />
          </View>
        </View>

        <View style={styles.section}>
          <Button
            title="Sair da Conta"
            onPress={handleLogout}
            variant="danger"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

interface PermissionItemProps {
  text: string;
  allowed: boolean;
}

const PermissionItem: React.FC<PermissionItemProps> = ({ text, allowed }) => (
  <View style={styles.permissionItem}>
    <Text style={styles.permissionIcon}>{allowed ? '✅' : '❌'}</Text>
    <Text style={[
      styles.permissionText,
      !allowed && styles.permissionTextDisabled
    ]}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  notLoggedIn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  notLoggedInIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  notLoggedInTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  notLoggedInText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  header: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatar: {
    fontSize: 48,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: spacing.sm,
  },
  roleBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.round,
  },
  roleText: {
    color: colors.white,
    fontWeight: '600',
  },
  section: {
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadow.small,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  permissionsCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    ...shadow.small,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  permissionIcon: {
    fontSize: 16,
    marginRight: spacing.sm,
  },
  permissionText: {
    fontSize: 14,
    color: colors.text,
  },
  permissionTextDisabled: {
    color: colors.textLight,
  },
});

export default ProfileScreen;
