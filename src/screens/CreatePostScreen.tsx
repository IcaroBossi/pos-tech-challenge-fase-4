import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { postsApi } from '../services/api';
import { CreatePostRequest, RootStackParamList } from '../types';
import Input from '../components/Input';
import Button from '../components/Button';
import { colors, spacing, borderRadius, shadow } from '../styles/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface CreatePostForm extends CreatePostRequest {}

const CreatePostScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreatePostForm>({
    defaultValues: {
      titulo: '',
      conteudo: '',
      autor: '',
      disciplina: '',
    },
  });

  const onSubmit = async (data: CreatePostForm) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const postData: CreatePostRequest = {
        titulo: data.titulo,
        conteudo: data.conteudo,
        autor: data.autor,
        disciplina: data.disciplina || undefined,
      };

      const response = await postsApi.createPost(postData);

      if (response.sucesso && response.dados) {
        if (Platform.OS === 'web') {
          window.alert('Post criado com sucesso!');
          navigation.goBack();
        } else {
          Alert.alert(
            'Sucesso!',
            'Post criado com sucesso!',
            [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]
          );
        }
      } else {
        setSubmitError(response.mensagem || 'Erro ao criar post');
      }
    } catch (error: any) {
      if (error.response?.data?.erros) {
        setSubmitError(error.response.data.erros.join(', '));
      } else {
        setSubmitError('Erro ao criar post. Verifique se o back-end está rodando.');
      }
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
            <Text style={styles.icon}>✍️</Text>
            <Text style={styles.title}>Criar Nova Postagem</Text>
            <Text style={styles.subtitle}>
              Compartilhe conhecimento com seus alunos
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
              name="titulo"
              rules={{
                required: 'Título é obrigatório',
                minLength: {
                  value: 3,
                  message: 'Título deve ter pelo menos 3 caracteres',
                },
                maxLength: {
                  value: 200,
                  message: 'Título deve ter no máximo 200 caracteres',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Título *"
                  placeholder="Digite o título do post"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.titulo?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="autor"
              rules={{
                required: 'Autor é obrigatório',
                minLength: {
                  value: 2,
                  message: 'Nome do autor deve ter pelo menos 2 caracteres',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  label="Autor *"
                  placeholder="Nome do autor"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  error={errors.autor?.message}
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

            <View style={styles.textAreaContainer}>
              <Text style={styles.label}>Conteúdo *</Text>
              <Controller
                control={control}
                name="conteudo"
                rules={{
                  required: 'Conteúdo é obrigatório',
                  minLength: {
                    value: 10,
                    message: 'Conteúdo deve ter pelo menos 10 caracteres',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    style={[
                      styles.textArea,
                      errors.conteudo && styles.textAreaError,
                    ]}
                    placeholder="Digite o conteúdo do post..."
                    placeholderTextColor={colors.textLight}
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    multiline
                    numberOfLines={8}
                    textAlignVertical="top"
                  />
                )}
              />
              {errors.conteudo && (
                <Text style={styles.errorLabel}>{errors.conteudo.message}</Text>
              )}
            </View>

            <View style={styles.buttons}>
              <Button
                title="Cancelar"
                onPress={() => navigation.goBack()}
                variant="outline"
                style={styles.button}
              />
              <Button
                title={isSubmitting ? 'Criando...' : 'Criar Post'}
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
  textAreaContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  textArea: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
    minHeight: 150,
  },
  textAreaError: {
    borderColor: colors.danger,
  },
  errorLabel: {
    color: colors.danger,
    fontSize: 12,
    marginTop: spacing.xs,
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

export default CreatePostScreen;
