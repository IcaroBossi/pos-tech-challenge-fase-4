import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { postsApi } from '../services/api';
import { Post, RootStackParamList } from '../types';
import PostCard from '../components/PostCard';
import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, borderRadius, shadow } from '../styles/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user, isAuthenticated } = useAuth();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);

  const loadPosts = useCallback(async (page = 1, search = '', isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);

      let response;
      if (search.trim()) {
        response = await postsApi.searchPosts(search, page, 10);
        setIsSearching(true);
      } else {
        response = await postsApi.getAllPosts(page, 10);
        setIsSearching(false);
      }

      if (response.sucesso) {
        setPosts(response.dados);
        setTotalPages(response.paginacao.totalPaginas);
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
  }, []);

  // Recarrega os posts toda vez que a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      loadPosts(1, searchTerm);
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadPosts(1, searchTerm, true);
  };

  const handleSearch = () => {
    loadPosts(1, searchTerm);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    loadPosts(1, '');
  };

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetail', { postId });
  };

  const handleCreatePost = () => {
    navigation.navigate('CreatePost');
  };

  const handleLoadMore = () => {
    if (currentPage < totalPages && !loading) {
      loadPosts(currentPage + 1, searchTerm);
    }
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerTop}>
        <Text style={styles.headerTitle}>📚 Blog de Aulas</Text>
        {isAuthenticated && (
          <Text style={styles.welcomeText}>
            Olá, {user?.name}!
          </Text>
        )}
      </View>
      
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar posts..."
          placeholderTextColor={colors.textLight}
          value={searchTerm}
          onChangeText={setSearchTerm}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>
      
      {isSearching && (
        <View style={styles.searchInfo}>
          <Text style={styles.searchInfoText}>
            Resultados para: "{searchTerm}"
          </Text>
          <TouchableOpacity onPress={handleClearSearch}>
            <Text style={styles.clearSearch}>Limpar</Text>
          </TouchableOpacity>
        </View>
      )}

      {isAuthenticated && user?.role === 'professor' && (
        <Button
          title="+ Criar Novo Post"
          onPress={handleCreatePost}
          style={styles.createButton}
        />
      )}
    </View>
  );

  const renderFooter = () => {
    if (currentPage >= totalPages) return null;
    
    return (
      <View style={styles.loadMore}>
        <Button
          title="Carregar mais"
          onPress={handleLoadMore}
          variant="outline"
          size="small"
        />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyText}>
        {isSearching
          ? 'Nenhum post encontrado para esta busca.'
          : 'Nenhum post disponível no momento.'}
      </Text>
      {isSearching && (
        <Button
          title="Limpar busca"
          onPress={handleClearSearch}
          variant="outline"
          size="small"
          style={{ marginTop: spacing.md }}
        />
      )}
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
          renderItem={({ item }) => (
            <PostCard post={item} onPress={() => handlePostPress(item._id)} />
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          ListFooterComponent={renderFooter}
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
  headerTop: {
    marginBottom: spacing.md,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    ...shadow.small,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text,
  },
  searchButton: {
    backgroundColor: colors.primaryDark,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 20,
  },
  searchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  searchInfoText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
  },
  clearSearch: {
    color: colors.white,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  createButton: {
    marginTop: spacing.md,
  },
  loadMore: {
    padding: spacing.lg,
    alignItems: 'center',
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

export default HomeScreen;
