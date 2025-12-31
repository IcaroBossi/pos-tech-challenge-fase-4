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
import { professoresApi } from '../../services/api';
import { Professor, RootStackParamList } from '../../types';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import Button from '../../components/Button';
import ConfirmModal from '../../components/ConfirmModal';
import { colors, spacing, borderRadius, shadow } from '../../styles/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const ProfessoresListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteProfessorId, setDeleteProfessorId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadProfessores = async (page = 1, isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);

      const response = await professoresApi.getAllProfessores(page, 10);

      if (response.sucesso) {
        setProfessores(response.dados);
        setTotalPages(response.paginacao.totalPaginas);
        setCurrentPage(page);
      } else {
        setError('Erro ao carregar professores');
      }
    } catch (err) {
      console.error('Erro ao carregar professores:', err);
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadProfessores();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadProfessores(1, true);
  };

  const handleEdit = (professorId: string) => {
    navigation.navigate('EditProfessor', { professorId });
  };

  const handleDelete = async () => {
    if (!deleteProfessorId) return;

    setIsDeleting(true);

    try {
      const response = await professoresApi.deleteProfessor(deleteProfessorId);

      if (response.sucesso) {
        Alert.alert('Sucesso', 'Professor excluído com sucesso!');
        loadProfessores(currentPage);
      } else {
        Alert.alert('Erro', response.mensagem || 'Erro ao excluir professor');
      }
    } catch (err) {
      Alert.alert('Erro', 'Erro ao excluir professor. Tente novamente.');
    } finally {
      setIsDeleting(false);
      setDeleteProfessorId(null);
    }
  };

  const handleCreate = () => {
    navigation.navigate('CreateProfessor');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerIcon}>👨‍🏫</Text>
        <Text style={styles.headerTitle}>Professores</Text>
        <Text style={styles.headerSubtitle}>
          Gerencie os professores cadastrados
        </Text>
      </View>

      <Button
        title="+ Cadastrar Professor"
        onPress={handleCreate}
        style={styles.createButton}
      />
    </View>
  );

  const renderItem = ({ item }: { item: Professor }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <View style={styles.avatarSmall}>
          <Text style={styles.avatarText}>👨‍🏫</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{item.nome}</Text>
          <Text style={styles.cardEmail}>{item.email}</Text>
          {item.disciplina && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.disciplina}</Text>
            </View>
          )}
        </View>
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
          onPress={() => setDeleteProfessorId(item._id)}
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
          onPress={() => currentPage > 1 && loadProfessores(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Text style={styles.pageButtonText}>← Anterior</Text>
        </TouchableOpacity>
        
        <Text style={styles.pageInfo}>
          Página {currentPage} de {totalPages}
        </Text>
        
        <TouchableOpacity
          style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
          onPress={() => currentPage < totalPages && loadProfessores(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Text style={styles.pageButtonText}>Próxima →</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👨‍🏫</Text>
      <Text style={styles.emptyText}>Nenhum professor cadastrado.</Text>
      <Button
        title="Cadastrar primeiro professor"
        onPress={handleCreate}
        style={{ marginTop: spacing.md }}
      />
    </View>
  );

  if (loading && !refreshing && professores.length === 0) {
    return <Loading fullScreen message="Carregando professores..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          {renderHeader()}
          <ErrorMessage message={error} onRetry={() => loadProfessores()} />
        </View>
      ) : (
        <FlatList
          data={professores}
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
        visible={!!deleteProfessorId}
        title="Excluir Professor"
        message="Tem certeza que deseja excluir este professor? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteProfessorId(null)}
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
  createButton: {
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    ...shadow.small,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarSmall: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    fontSize: 24,
  },
  cardContent: {
    flex: 1,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  cardEmail: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
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

export default ProfessoresListScreen;
