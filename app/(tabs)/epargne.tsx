import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { IconTarget } from '@tabler/icons-react-native';
import { Colors } from '../../constants/Colors';
import { useApp } from '../../context/AppContext';
import { GoalCard } from '../../components/GoalCard';

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

export default function EpargneScreen() {
  const { data, getCurrentMonthExpenses } = useApp();
  const router = useRouter();

  const config = data.currentMonthConfig;
  const expenses = getCurrentMonthExpenses();
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const savedThisMonth = config ? config.income - totalSpent : 0;
  const monthLabel = config ? formatMonthLabel(config.monthKey) : '';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Épargne</Text>
          <Text style={styles.headerSub}>{monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/modals/manage-goals' as any)} style={styles.iconBtn}>
          <IconTarget size={22} color={Colors.slate600} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Cagnotte */}
        <View style={styles.cagnotteCard}>
          <Text style={styles.cagnotteAmount}>{data.freeSavings.toFixed(2)} €</Text>
          <Text style={styles.cagnotteLabel}>Cagnotte disponible</Text>
          <Text style={styles.cagnotteSub}>sur {data.totalSavings.toFixed(0)} € épargnés au total</Text>
        </View>

        {/* Récap mensuel */}
        {config && (
          <View style={styles.recapCard}>
            <Text style={styles.recapSectionLabel}>CE MOIS-CI</Text>
            <View style={styles.recapRow}>
              <Text style={styles.recapLabel}>Revenu</Text>
              <Text style={styles.recapValue}>{config.income.toFixed(0)} €</Text>
            </View>
            <View style={styles.recapRow}>
              <Text style={styles.recapLabel}>Dépensé</Text>
              <Text style={[styles.recapValue, { color: Colors.indigo }]}>{totalSpent.toFixed(0)} €</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.recapRow}>
              <Text style={styles.recapLabel}>Épargné</Text>
              <Text style={[styles.recapValue, { color: savedThisMonth >= 0 ? Colors.green : Colors.red }]}>
                {savedThisMonth >= 0 ? '+' : ''}{savedThisMonth.toFixed(0)} €
              </Text>
            </View>
            <View style={styles.recapRow}>
              <Text style={styles.recapLabel}>Objectif</Text>
              <Text style={styles.recapValue}>{config.savingsGoal.toFixed(0)} €</Text>
            </View>
          </View>
        )}

        {/* Objectifs */}
        <Text style={styles.sectionLabel}>OBJECTIFS</Text>

        {data.savingsGoals.length === 0 ? (
          <View style={styles.emptyGoals}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyText}>Aucun objectif encore — crée-en un !</Text>
          </View>
        ) : (
          data.savingsGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              monthlyContribution={config?.savingsGoal ?? 0}
              onAllocate={() => router.push({ pathname: '/modals/allocate-goal', params: { goalId: goal.id } })}
            />
          ))
        )}

        {/* Cagnotte libre */}
        <View style={styles.libreCard}>
          <Text style={styles.libreLabel}>Cagnotte libre · Non affectée</Text>
          <Text style={styles.libreAmount}>{data.freeSavings.toFixed(0)} €</Text>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.slate50 },
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
  iconBtn: { padding: 6 },
  scroll: { flex: 1 },
  content: { padding: 11, gap: 9 },
  cagnotteCard: {
    backgroundColor: Colors.white,
    borderRadius: 13,
    padding: 20,
    alignItems: 'center',
  },
  cagnotteAmount: { fontSize: 32, fontWeight: '700', color: Colors.green },
  cagnotteLabel: { fontSize: 13, color: Colors.slate600, marginTop: 4 },
  cagnotteSub: { fontSize: 11, color: Colors.slate400, marginTop: 2 },
  recapCard: {
    backgroundColor: Colors.white,
    borderRadius: 13,
    padding: 13,
    gap: 9,
  },
  recapSectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.slate400,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  recapRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recapLabel: { fontSize: 13, color: Colors.slate600 },
  recapValue: { fontSize: 13, fontWeight: '600', color: Colors.slate800 },
  divider: { height: 1, backgroundColor: Colors.slate200 },
  goalsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.slate400,
    letterSpacing: 0.8,
  },
  newGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.indigoLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  newGoalText: { fontSize: 12, fontWeight: '600', color: Colors.indigo },
  emptyGoals: { alignItems: 'center', padding: 24, gap: 8 },
  emptyEmoji: { fontSize: 28 },
  emptyText: { fontSize: 13, color: Colors.slate400, textAlign: 'center' },
  libreCard: {
    backgroundColor: Colors.indigoLight,
    borderRadius: 13,
    padding: 13,
    paddingHorizontal: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  libreLabel: { fontSize: 13, fontWeight: '500', color: Colors.indigo },
  libreAmount: { fontSize: 15, fontWeight: '700', color: Colors.indigoDark },
});
