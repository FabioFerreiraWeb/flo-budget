import { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconPlus } from '@tabler/icons-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { useApp } from '../../context/AppContext';
import { CategoryCard } from '../../components/CategoryCard';
import { ProgressBar } from '../../components/ProgressBar';

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

export default function DepensesScreen() {
  const { data, getCurrentMonthExpenses, getCategorySpent, deleteExpense } = useApp();
  const router = useRouter();

  if (!data.currentMonthConfig) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.emptyText}>Configurez d'abord votre mois</Text>
        </View>
      </SafeAreaView>
    );
  }

  const config = data.currentMonthConfig;
  const expenses = getCurrentMonthExpenses();
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const totalBudget = config.categories.reduce((s, c) => s + c.budget, 0);
  const globalPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
  const monthLabel = formatMonthLabel(config.monthKey);

  const handleDelete = (id: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm('Supprimer cette dépense ?')) deleteExpense(id);
      return;
    }
    Alert.alert('Supprimer', 'Supprimer cette dépense ?', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer',
        style: 'destructive',
        onPress: () => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          deleteExpense(id);
        },
      },
    ]);
  };

  const handleEdit = (id: string) => {
    router.push(`/modals/edit-expense?id=${id}`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Dépenses</Text>
          <Text style={styles.headerSub}>{monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/modals/add-expense')} style={styles.addBtn}>
          <IconPlus size={20} color={Colors.indigo} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Global progress */}
        <View style={styles.globalCard}>
          <Text style={styles.globalTitle}>Ce mois — {totalSpent.toFixed(0)} € / {totalBudget.toFixed(0)} € budget</Text>
          <View style={styles.barWrap}>
            <ProgressBar percentage={globalPct} height={7} />
          </View>
          <Text style={styles.globalSub}>
            <Text style={{ color: Colors.green }}>{globalPct.toFixed(0)}%</Text>
            {'  '}
            {totalBudget - totalSpent >= 0
              ? `${(totalBudget - totalSpent).toFixed(0)} € restants`
              : `${Math.abs(totalBudget - totalSpent).toFixed(0)} € dépassés`}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>PAR CATÉGORIE</Text>

        {config.categories.length === 0 ? (
          <Text style={styles.emptyText}>Aucune catégorie configurée</Text>
        ) : (
          config.categories.map(cat => {
            const catExpenses = expenses.filter(e => e.categoryId === cat.id);
            return (
              <CategoryCard
                key={cat.id}
                category={cat}
                spent={getCategorySpent(cat.id)}
                expenses={catExpenses}
                mode="expanded"
                onDeleteExpense={handleDelete}
                onEditExpense={handleEdit}
              />
            );
          })
        )}

        {expenses.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎉</Text>
            <Text style={styles.emptyStateText}>Aucune dépense ce mois — excellent départ !</Text>
          </View>
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.fabWrap}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/modals/add-expense')}
          activeOpacity={0.85}
        >
          <Text style={styles.fabText}>＋ Nouvelle dépense</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.slate50 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate200,
  },
  headerTitle: { fontSize: 17, fontWeight: '600', color: Colors.slate800 },
  headerSub: { fontSize: 11, color: Colors.slate400, marginTop: 1 },
  addBtn: { padding: 6 },
  scroll: { flex: 1 },
  content: { padding: 11, gap: 9 },
  globalCard: {
    backgroundColor: Colors.white,
    borderRadius: 13,
    padding: 13,
    paddingHorizontal: 13,
  },
  globalTitle: { fontSize: 13, fontWeight: '500', color: Colors.slate800, marginBottom: 8 },
  barWrap: { marginBottom: 6 },
  globalSub: { fontSize: 12, color: Colors.slate600 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.slate400,
    letterSpacing: 0.8,
    marginTop: 4,
    marginBottom: 2,
  },
  emptyText: { fontSize: 13, color: Colors.slate400, fontStyle: 'italic', textAlign: 'center', padding: 16 },
  emptyState: { alignItems: 'center', padding: 24, gap: 8 },
  emptyEmoji: { fontSize: 32 },
  emptyStateText: { fontSize: 14, color: Colors.slate600, textAlign: 'center' },
  fabWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 11,
    paddingBottom: 20,
  },
  fab: {
    backgroundColor: Colors.indigo,
    borderRadius: 99,
    paddingVertical: 15,
    alignItems: 'center',
  },
  fabText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
});
