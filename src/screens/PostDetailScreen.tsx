import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { postsApi } from '../services/api';
import { Post, RootStackParamList } from '../types';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius, shadow } from '../styles/theme';

type RouteProps = RouteProp<RootStackParamList, 'PostDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const PostDetailScreen: React.FC = () => {
  const route = useRoute<RouteProps>();
  const navigation = useNavigation<NavigationProp>();
  const { user, isAuthenticated } = useAuth();
  const { postId } = route.params;

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await postsApi.getPostById(postId);

      if (response.sucesso && response.dados) {
        setPost(response.dados);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = () => {
    navigation.navigate('EditPost', { postId });
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

  if (!post) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage message="Post não encontrado" />
      </SafeAreaView>
    );
  }

  const canEdit = isAuthenticated && user?.role === 'professor';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>{post.titulo}</Text>
          
          <View style={styles.metaContainer}>
            <View style={styles.authorRow}>
              <Text style={styles.authorIcon}>👤</Text>
              <Text style={styles.author}>{post.autor}</Text>
            </View>
            
            {post.disciplina && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{post.disciplina}</Text>
              </View>
            )}
          </View>
          
          <Text style={styles.date}>
            Publicado em {formatDate(post.dataCriacao)}
          </Text>
          
          {post.dataAtualizacao !== post.dataCriacao && (
            <Text style={styles.updated}>
              Atualizado em {formatDate(post.dataAtualizacao)}
            </Text>
          )}
        </View>

        <View style={styles.content}>
          <Text style={styles.contentText}>{post.conteudo}</Text>
        </View>

        {post.tags && post.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.tagsSectionTitle}>Tags</Text>
            <View style={styles.tagsContainer}>
              {post.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {canEdit && (
          <View style={styles.actions}>
            <Button
              title="✏️ Editar Post"
              onPress={handleEdit}
              style={styles.editButton}
            />
          </View>
        )}

        <View style={styles.navigation}>
          <Button
            title="← Voltar para lista"
            onPress={() => navigation.goBack()}
            variant="outline"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.white,
    marginBottom: spacing.md,
    lineHeight: 34,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorIcon: {
    fontSize: 16,
    marginRight: spacing.xs,
  },
  author: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    fontWeight: '500',
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  badgeText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  date: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  updated: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
  content: {
    backgroundColor: colors.white,
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadow.medium,
  },
  contentText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 26,
  },
  tagsSection: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    ...shadow.small,
  },
  tagsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tag: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.round,
  },
  tagText: {
    fontSize: 14,
    color: colors.primary,
  },
  actions: {
    padding: spacing.md,
  },
  editButton: {
    marginBottom: spacing.sm,
  },
  navigation: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
});

export default PostDetailScreen;
