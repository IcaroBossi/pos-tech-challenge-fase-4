import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../types';
import Input from '../components/Input';
import Button from '../components/Button';
import { colors, spacing, borderRadius, shadow } from '../styles/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface LoginFormData {
  email: string;
  password: string;
}

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { login, isLoading } = useAuth();
  
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setLoginError(null);

    try {
      const success = await login(data.email, data.password);
      
      if (success) {
        // Navegar para home
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          })
        );
      } else {
        setLoginError('Email ou senha incorretos. Tente novamente.');
      }
    } catch (error) {
      setLoginError('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillProfessorDemo = () => {
    setValue('email', 'professor@blog.com');
    setValue('password', 'professor123');
  };

  const fillStudentDemo = () => {
    setValue('email', 'aluno@blog.com');
    setValue('password', 'aluno123');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.icon}>🔐</Text>
            <Text style={styles.title}>Entrar</Text>
            <Text style={styles.subtitle}>
              Acesse sua conta do Blog de Aulas
            </Text>
          </View>

          <View style={styles.form}>
            {loginError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{loginError}</Text>
              </View>
            )}

            <Controller
              control={control}
              name="email"
              rules={{
                required: 'Email é obrigatório',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Email inválido',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Email"
                  placeholder="Digite seu email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              rules={{
                required: 'Senha é obrigatória',
                minLength: {
                  value: 6,
                  message: 'Senha deve ter pelo menos 6 caracteres',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Senha"
                  placeholder="Digite sua senha"
                  secureTextEntry
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.password?.message}
                />
              )}
            />

            <Button
              title={isSubmitting ? 'Entrando...' : 'Entrar'}
              onPress={handleSubmit(onSubmit)}
              disabled={isSubmitting || isLoading}
              loading={isSubmitting}
              style={styles.loginButton}
            />
          </View>

          <View style={styles.demoSection}>
            <Text style={styles.demoTitle}>🧪 Contas de Demonstração</Text>
            
            <View style={styles.demoCard}>
              <View style={styles.demoCardHeader}>
                <Text style={styles.demoCardIcon}>👨‍🏫</Text>
                <Text style={styles.demoCardTitle}>Professor (Acesso Completo)</Text>
              </View>
              <Text style={styles.demoCredential}>Email: professor@blog.com</Text>
              <Text style={styles.demoCredential}>Senha: professor123</Text>
              <TouchableOpacity
                style={styles.demoButton}
                onPress={fillProfessorDemo}
              >
                <Text style={styles.demoButtonText}>Preencher dados do Professor</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.demoCard}>
              <View style={styles.demoCardHeader}>
                <Text style={styles.demoCardIcon}>👨‍🎓</Text>
                <Text style={styles.demoCardTitle}>Aluno (Somente Leitura)</Text>
              </View>
              <Text style={styles.demoCredential}>Email: aluno@blog.com</Text>
              <Text style={styles.demoCredential}>Senha: aluno123</Text>
              <TouchableOpacity
                style={[styles.demoButton, styles.demoButtonStudent]}
                onPress={fillStudentDemo}
              >
                <Text style={styles.demoButtonText}>Preencher dados do Aluno</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadow.medium,
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  errorText: {
    color: '#721c24',
    textAlign: 'center',
  },
  loginButton: {
    marginTop: spacing.sm,
  },
  demoSection: {
    marginTop: spacing.xl,
    paddingBottom: spacing.xl,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  demoCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadow.small,
  },
  demoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  demoCardIcon: {
    fontSize: 24,
    marginRight: spacing.sm,
  },
  demoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  demoCredential: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  demoButton: {
    backgroundColor: colors.success,
    borderRadius: borderRadius.md,
    padding: spacing.sm,
    marginTop: spacing.sm,
    alignItems: 'center',
  },
  demoButtonStudent: {
    backgroundColor: colors.info,
  },
  demoButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
});

export default LoginScreen;
