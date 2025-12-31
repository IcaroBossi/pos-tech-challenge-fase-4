import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { alunosApi } from '../../services/api';
import { UpdateAlunoRequest, RootStackParamList } from '../../types';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { colors, spacing, borderRadius, shadow } from '../../styles/theme';

type RouteProps = RouteProp<RootStackParamList, 'EditAluno'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface EditAlunoForm {
  nome: string;
  email: string;
  turma: string;
}

const EditAlunoScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { alunoId } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditAlunoForm>({
    defaultValues: {
      nome: '',
      email: '',
      turma: '',
    },
  });

  const loadAluno = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await alunosApi.getAlunoById(alunoId);

      if (response.sucesso && response.dados) {
        const alunoData = response.dados;
        reset({
          nome: alunoData.nome,
          email: alunoData.email,
          turma: alunoData.turma || '',
        });
      } else {
        setError('Aluno não encontrado');
      }
    } catch (err) {
      console.error('Erro ao carregar aluno:', err);
      setError('Erro ao carregar o aluno.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAluno();
  }, [alunoId]);

  const onSubmit = async (data: EditAlunoForm) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const updateData: UpdateAlunoRequest = {
        nome: data.nome,
        email: data.email,
        turma: data.turma || undefined,
      };

      const response = await alunosApi.updateAluno(alunoId, updateData);

      if (response.sucesso) {
        Alert.alert(
          'Sucesso!',
          'Aluno atualizado com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        setSubmitError(response.mensagem || 'Erro ao atualizar aluno');
      }
    } catch (error: any) {
      setSubmitError('Erro ao atualizar aluno. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Carregando aluno..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage message={error} onRetry={loadAluno} />
      </SafeAreaView>
    );
  }

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
            <Text style={styles.icon}>✏️</Text>
            <Text style={styles.title}>Editar Aluno</Text>
            <Text style={styles.subtitle}>
              Atualize as informações do aluno
            </Text>
          </View>

          <View style={styles.form}>
            {submitError && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{submitError}</Text>
              </View>
            )}

            <Controller
              control={control}
              name="nome"
              rules={{
                required: 'Nome é obrigatório',
                minLength: {
                  value: 2,
                  message: 'Nome deve ter pelo menos 2 caracteres',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Nome *"
                  placeholder="Nome completo do aluno"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.nome?.message}
                />
              )}
            />

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
                  label="Email *"
                  placeholder="email@exemplo.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="turma"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Turma (opcional)"
                  placeholder="Ex: 3º Ano A, 2º Ano B, etc."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />

            <View style={styles.buttons}>
              <Button
                title="Cancelar"
                onPress={() => navigation.goBack()}
                variant="outline"
                style={styles.button}
              />
              <Button
                title={isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
                onPress={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                loading={isSubmitting}
                style={styles.button}
              />
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
    paddingVertical: spacing.lg,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
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
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  button: {
    flex: 1,
  },
});

export default EditAlunoScreen;
