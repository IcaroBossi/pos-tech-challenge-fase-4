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
import { alunosApi } from '../../services/api';
import { Aluno, RootStackParamList } from '../../types';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import Button from '../../components/Button';
import ConfirmModal from '../../components/ConfirmModal';
import { colors, spacing, borderRadius, shadow } from '../../styles/theme';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AlunosListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteAlunoId, setDeleteAlunoId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadAlunos = async (page = 1, isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      }
      setError(null);

      const response = await alunosApi.getAllAlunos(page, 10);

      if (response.sucesso) {
        setAlunos(response.dados);
        setTotalPages(response.paginacao.totalPaginas);
        setCurrentPage(page);
      } else {
        setError('Erro ao carregar alunos');
      }
    } catch (err) {
      console.error('Erro ao carregar alunos:', err);
      setError('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadAlunos();
    }, [])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadAlunos(1, true);
  };

  const handleEdit = (alunoId: string) => {
    navigation.navigate('EditAluno', { alunoId });
  };

  const handleDelete = async () => {
    if (!deleteAlunoId) return;

    setIsDeleting(true);

    try {
      const response = await alunosApi.deleteAluno(deleteAlunoId);

      if (response.sucesso) {
        Alert.alert('Sucesso', 'Aluno excluído com sucesso!');
        loadAlunos(currentPage);
      } else {
        Alert.alert('Erro', response.mensagem || 'Erro ao excluir aluno');
      }
    } catch (err) {
      Alert.alert('Erro', 'Erro ao excluir aluno. Tente novamente.');
    } finally {
      setIsDeleting(false);
      setDeleteAlunoId(null);
    }
  };

  const handleCreate = () => {
    navigation.navigate('CreateAluno');
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerContent}>
        <Text style={styles.headerIcon}>👨‍🎓</Text>
        <Text style={styles.headerTitle}>Alunos</Text>
        <Text style={styles.headerSubtitle}>
          Gerencie os alunos cadastrados
        </Text>
      </View>

      <Button
        title="+ Cadastrar Aluno"
        onPress={handleCreate}
        style={styles.createButton}
      />
    </View>
  );

  const renderItem = ({ item }: { item: Aluno }) => (
    <View style={styles.card}>
      <View style={styles.cardInfo}>
        <View style={styles.avatarSmall}>
          <Text style={styles.avatarText}>👨‍🎓</Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.cardName}>{item.nome}</Text>
          <Text style={styles.cardEmail}>{item.email}</Text>
          {item.turma && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.turma}</Text>
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
          onPress={() => setDeleteAlunoId(item._id)}
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
          onPress={() => currentPage > 1 && loadAlunos(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <Text style={styles.pageButtonText}>← Anterior</Text>
        </TouchableOpacity>
        
        <Text style={styles.pageInfo}>
          Página {currentPage} de {totalPages}
        </Text>
        
        <TouchableOpacity
          style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
          onPress={() => currentPage < totalPages && loadAlunos(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          <Text style={styles.pageButtonText}>Próxima →</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>👨‍🎓</Text>
      <Text style={styles.emptyText}>Nenhum aluno cadastrado.</Text>
      <Button
        title="Cadastrar primeiro aluno"
        onPress={handleCreate}
        style={{ marginTop: spacing.md }}
      />
    </View>
  );

  if (loading && !refreshing && alunos.length === 0) {
    return <Loading fullScreen message="Carregando alunos..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      {error ? (
        <View style={styles.errorContainer}>
          {renderHeader()}
          <ErrorMessage message={error} onRetry={() => loadAlunos()} />
        </View>
      ) : (
        <FlatList
          data={alunos}
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
        visible={!!deleteAlunoId}
        title="Excluir Aluno"
        message="Tem certeza que deseja excluir este aluno? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDelete}
        onCancel={() => setDeleteAlunoId(null)}
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
    backgroundColor: colors.info,
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

export default AlunosListScreen;
