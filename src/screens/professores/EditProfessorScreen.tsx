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
import { professoresApi } from '../../services/api';
import { UpdateProfessorRequest, RootStackParamList, Professor } from '../../types';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import { colors, spacing, borderRadius, shadow } from '../../styles/theme';

type RouteProps = RouteProp<RootStackParamList, 'EditProfessor'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface EditProfessorForm {
  nome: string;
  email: string;
  disciplina: string;
}

const EditProfessorScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { professorId } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditProfessorForm>({
    defaultValues: {
      nome: '',
      email: '',
      disciplina: '',
    },
  });

  const loadProfessor = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await professoresApi.getProfessorById(professorId);

      if (response.sucesso && response.dados) {
        const professorData = response.dados;
        reset({
          nome: professorData.nome,
          email: professorData.email,
          disciplina: professorData.disciplina || '',
        });
      } else {
        setError('Professor não encontrado');
      }
    } catch (err) {
      console.error('Erro ao carregar professor:', err);
      setError('Erro ao carregar o professor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfessor();
  }, [professorId]);

  const onSubmit = async (data: EditProfessorForm) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const updateData: UpdateProfessorRequest = {
        nome: data.nome,
        email: data.email,
        disciplina: data.disciplina || undefined,
      };

      const response = await professoresApi.updateProfessor(professorId, updateData);

      if (response.sucesso) {
        Alert.alert(
          'Sucesso!',
          'Professor atualizado com sucesso!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        setSubmitError(response.mensagem || 'Erro ao atualizar professor');
      }
    } catch (error: any) {
      setSubmitError('Erro ao atualizar professor. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Carregando professor..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage message={error} onRetry={loadProfessor} />
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
            <Text style={styles.title}>Editar Professor</Text>
            <Text style={styles.subtitle}>
              Atualize as informações do professor
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
                  placeholder="Nome completo do professor"
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
              name="disciplina"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Disciplina (opcional)"
                  placeholder="Ex: Matemática, História, etc."
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

export default EditProfessorScreen;
