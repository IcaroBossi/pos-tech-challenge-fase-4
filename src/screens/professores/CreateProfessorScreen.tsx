import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { professoresApi } from '../../services/api';
import { CreateProfessorRequest, RootStackParamList } from '../../types';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { colors, spacing, borderRadius, shadow } from '../../styles/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface CreateProfessorForm extends CreateProfessorRequest {}

const CreateProfessorScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateProfessorForm>({
    defaultValues: {
      nome: '',
      email: '',
      disciplina: '',
    },
  });

  const onSubmit = async (data: CreateProfessorForm) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const professorData: CreateProfessorRequest = {
        nome: data.nome,
        email: data.email,
        disciplina: data.disciplina || undefined,
      };

      const response = await professoresApi.createProfessor(professorData);

      if (response.sucesso) {
        if (Platform.OS === 'web') {
          window.alert('Professor cadastrado com sucesso!');
          navigation.goBack();
        } else {
          Alert.alert(
            'Sucesso!',
            'Professor cadastrado com sucesso!',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
      } else {
        setSubmitError(response.mensagem || 'Erro ao cadastrar professor');
      }
    } catch (error: any) {
      setSubmitError('Erro ao cadastrar professor. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
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
            <Text style={styles.icon}>👨‍🏫</Text>
            <Text style={styles.title}>Cadastrar Professor</Text>
            <Text style={styles.subtitle}>
              Adicione um novo professor ao sistema
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
                title={isSubmitting ? 'Cadastrando...' : 'Cadastrar'}
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

export default CreateProfessorScreen;
