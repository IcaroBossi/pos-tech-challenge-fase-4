import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { postsApi } from '../services/api';
import { Post, RootStackParamList } from '../types';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import ConfirmModal from '../components/ConfirmModal';
import { colors, spacing, borderRadius, shadow } from '../styles/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AdminScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [deletePostId, setDeletePostId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadPosts = async (page = 1, isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);

      const response = await postsApi.getAllPosts(page, 10);

      if (response.sucesso) {
        setPosts(response.dados);
        setTotalPages(response.paginacao.totalPaginas);
        setTotalPosts(response.paginacao.totalPosts);
        setCurrentPage(page);
      } else {
        setError('Erro ao carregar posts');
      }
    } catch (err) {
      console.error('Erro ao carregar posts:', err);
      setError('Erro ao conectar com o servidor. Verifique se o back-end está rodando.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadPosts();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts(1, true);
  };

  const handleEdit = (postId: string) => {
    navigation.navigate('EditPost', { postId });
  };

  const handleDelete = async () => {
    if (!deletePostId) return;

    setIsDeleting(true);

    try {
      const response = await postsApi.deletePost(deletePostId);

      if (response.sucesso) {
        Alert.alert('Sucesso', 'Post excluído com sucesso!');
        loadPosts(currentPage);
      } else {
        Alert.alert('Erro', response.mensagem || 'Erro ao excluir post');
      }
    } catch (err) {
      Alert.alert('Erro', 'Erro ao excluir post. Tente novamente.');
    } finally {
      setIsDeleting(false);
      setDeletePostId(null);
    }
  };

  const handleCreatePost = () => {
    navigation.navigate('CreatePost');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const truncateText = (text: string, maxLength = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerIcon}>⚙️</Text>
        <Text style={styles.headerTitle}>Painel Administrativo</Text>
        <Text style={styles.headerSubtitle}>
          Gerencie as postagens do blog
        </Text>
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalPosts}</Text>
          <Text style={styles.statLabel}>Total de Posts</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{totalPages}</Text>
          <Text style={styles.statLabel}>Páginas</Text>
        </View>
      </View>

      <Button
        title="+ Criar Novo Post"
        onPress={handleCreatePost}
        style={styles.createButton}
      />
    </View>
  );

  const renderItem = ({ item }: { item: Post }) => (
    <View style={styles.postCard}>
      <View style={styles.postInfo}>
        <Text style={styles.postTitle} numberOfLines={2}>
          {truncateText(item.titulo, 40)}
        </Text>
        <View style={styles.postMeta}>
          <Text style={styles.postAuthor}>👤 {item.autor}</Text>
          <Text style={styles.postDate}>📅 {formatDate(item.dataCriacao)}</Text>
        </View>
        {item.disciplina && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{item.disciplina}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => handleEdit(item._id)}
        >
          <Text style={styles.actionButtonText}>✏️ Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => setDeletePostId(item._id)}
        >
          <Text style={styles.actionButtonText}>🗑️ Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <View style={styles.pagination}>
        <TouchableOpacity
          style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
          onPress={() => currentPage > 1 && loadPosts(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Text style={styles.pageButtonText}>← Anterior</Text>
        </TouchableOpacity>
        
        <Text style={styles.pageInfo}>
          Página {currentPage} de {totalPages}
        </Text>
        
        <TouchableOpacity
          style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
          onPress={() => currentPage < totalPages && loadPosts(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Text style={styles.pageButtonText}>Próxima →</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyText}>Nenhum post cadastrado.</Text>
      <Button
        title="Criar primeiro post"
        onPress={handleCreatePost}
        style={{ marginTop: spacing.md }}
      />
    </View>
  );

  if (loading && !refreshing && posts.length === 0) {
    return <Loading fullScreen message="Carregando posts..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          {renderHeader()}
          <ErrorMessage message={error} onRetry={() => loadPosts()} />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderPagination}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <ConfirmModal
        visible={!!deletePostId}
        title="Excluir Post"
        message="Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setDeletePostId(null)}
        isLoading={isDeleting}
        variant="danger"
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    marginBottom: spacing.md,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  statCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    minWidth: 100,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  createButton: {
    marginTop: spacing.sm,
  },
  postCard: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadow.small,
  },
  postInfo: {
    marginBottom: spacing.sm,
  },
  postTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  postMeta: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xs,
  },
  postAuthor: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  postDate: {
    fontSize: 13,
    color: colors.textLight,
  },
  badge: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.round,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  badgeText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.danger,
  },
  actionButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  pageButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
  },
  pageButtonDisabled: {
    backgroundColor: colors.gray[400],
  },
  pageButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '500',
  },
  pageInfo: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
  },
});

export default AdminScreen;
