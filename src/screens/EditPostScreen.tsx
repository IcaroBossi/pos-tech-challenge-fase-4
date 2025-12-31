import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { postsApi } from '../services/api';
import { UpdatePostRequest, RootStackParamList, Post } from '../types';
import Input from '../components/Input';
import Button from '../components/Button';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import { colors, spacing, borderRadius, shadow } from '../styles/theme';

type RouteProps = RouteProp<RootStackParamList, 'EditPost'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface EditPostForm {
  titulo: string;
  conteudo: string;
  autor: string;
  disciplina: string;
}

const EditPostScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const { postId } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [post, setPost] = useState<Post | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditPostForm>({
    defaultValues: {
      titulo: '',
      conteudo: '',
      autor: '',
      disciplina: '',
    },
  });

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await postsApi.getPostById(postId);

      if (response.sucesso && response.dados) {
        const postData = response.dados;
        setPost(postData);
        reset({
          titulo: postData.titulo,
          conteudo: postData.conteudo,
          autor: postData.autor,
          disciplina: postData.disciplina || '',
        });
      } else {
        setError('Post não encontrado');
      }
    } catch (err) {
      console.error('Erro ao carregar post:', err);
      setError('Erro ao carregar o post. Verifique se o back-end está rodando.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost();
  }, [postId]);

  const onSubmit = async (data: EditPostForm) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const updateData: UpdatePostRequest = {
        titulo: data.titulo,
        conteudo: data.conteudo,
        autor: data.autor,
        disciplina: data.disciplina || undefined,
      };

      const response = await postsApi.updatePost(postId, updateData);

      if (response.sucesso) {
        const goToHome = () => {
          navigation.dispatch(
            CommonActions.reset({
              index: 0,
              routes: [{ name: 'MainTabs' }],
            })
          );
        };

        if (Platform.OS === 'web') {
          window.alert('Post editado com sucesso!');
          goToHome();
        } else {
          Alert.alert(
            'Sucesso!',
            'Post editado com sucesso!',
            [
              {
                text: 'OK',
                onPress: goToHome,
              },
            ]
          );
        }
      } else {
        setSubmitError(response.mensagem || 'Erro ao atualizar post');
      }
    } catch (error: any) {
      if (error.response?.data?.erros) {
        setSubmitError(error.response.data.erros.join(', '));
      } else {
        setSubmitError('Erro ao atualizar post. Verifique se o back-end está rodando.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return <Loading fullScreen message="Carregando post..." />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage message={error} onRetry={loadPost} />
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
            <Text style={styles.title}>Editar Postagem</Text>
            <Text style={styles.subtitle}>
              Atualize as informações do post
            </Text>
          </View>

          {post && (
            <View style={styles.lastModified}>
              <Text style={styles.lastModifiedText}>
                📅 Última modificação: {formatDate(post.dataAtualizacao)}
              </Text>
            </View>
          )}

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
  lastModified: {
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  lastModifiedText: {
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

export default EditPostScreen;
