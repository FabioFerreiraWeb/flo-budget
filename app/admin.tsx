import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '../context/AppContext';
import { Colors } from '../constants/Colors';

const UMAMI_DASHBOARD_URL = 'https://cloud.umami.is/share/0R73w1rBogt3kMPu';

export default function AdminScreen() {
  const { data } = useApp();

  const allExpenses = data.expenses ?? [];
  const currentConfig = data.currentMonthConfig;
  const history = data.monthSummaries ?? [];
  const savingsGoals = data.savingsGoals ?? [];
  const totalSavings = data.totalSavings ?? 0;

  const totalExpenses = allExpenses.reduce((s: number, e) => s + e.amount, 0);
  const avgMonthlySpend = history.length > 0
    ? history.reduce((s: number, m) => s + m.totalSpent, 0) / history.length
    : 0;
  const completedGoals = savingsGoals.filter(g => g.allocatedAmount >= g.targetAmount).length;

  const categoryTotals: Record<string, { name: string; emoji: string; amount: number; count: number }> = {};
  allExpenses.forEach(e => {
    if (!categoryTotals[e.categoryId]) {
      const cat = currentConfig?.categories.find(c => c.id === e.categoryId);
      categoryTotals[e.categoryId] = {
        name: cat?.name ?? e.categoryId,
        emoji: cat?.emoji ?? '📦',
        amount: 0,
        count: 0,
      };
    }
    categoryTotals[e.categoryId].amount += e.amount;
    categoryTotals[e.categoryId].count += 1;
  });
  const topCategories = Object.values(categoryTotals).sort((a, b) => b.amount - a.amount);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Admin — Flo Analytics</Text>
          <Text style={styles.sub}>Developer view</Text>
        </View>
        <TouchableOpacity onPress={() => Linking.openURL(UMAMI_DASHBOARD_URL)} style={styles.umamiBtn}>
          <Text style={styles.umamiBtnText}>📊 Umami</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <Text style={styles.sectionLabel}>GLOBAL SUMMARY</Text>
        <View style={styles.statsGrid}>
          <StatCard label="Total spent" value={`${totalExpenses.toFixed(0)} €`} />
          <StatCard label="Total savings" value={`${totalSavings.toFixed(0)} €`} />
          <StatCard label="Months archived" value={String(history.length)} />
          <StatCard label="Avg/month" value={`${avgMonthlySpend.toFixed(0)} €`} />
          <StatCard label="Active goals" value={String(savingsGoals.length)} />
          <StatCard label="Goals reached" value={String(completedGoals)} />
        </View>

        {currentConfig && (
          <>
            <Text style={styles.sectionLabel}>CURRENT MONTH</Text>
            <View style={styles.card}>
              <InfoRow label="Month key" value={currentConfig.monthKey} />
              <InfoRow label="Income" value={`${currentConfig.income.toFixed(0)} €`} />
              <InfoRow label="Savings goal" value={`${currentConfig.savingsGoal.toFixed(0)} €`} />
              <InfoRow label="Categories" value={String(currentConfig.categories.length)} />
              <InfoRow
                label="Category budget total"
                value={`${currentConfig.categories.reduce((s, c) => s + c.budget, 0).toFixed(0)} €`}
              />
              <InfoRow label="Expenses this month" value={String(allExpenses.filter(e => e.monthKey === currentConfig.monthKey).length)} />
            </View>
          </>
        )}

        {topCategories.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>ALL-TIME SPENDING BY CATEGORY</Text>
            <View style={styles.card}>
              {topCategories.map((cat, i) => (
                <View key={i} style={[styles.catRow, i > 0 && styles.borderTop]}>
                  <Text style={styles.catEmoji}>{cat.emoji}</Text>
                  <Text style={styles.catName}>{cat.name}</Text>
                  <Text style={styles.catCount}>{cat.count} exp.</Text>
                  <Text style={styles.catAmount}>{cat.amount.toFixed(0)} €</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {savingsGoals.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>SAVINGS GOALS</Text>
            <View style={styles.card}>
              {savingsGoals.map((g, i) => {
                const pct = g.targetAmount > 0 ? Math.min(100, (g.allocatedAmount / g.targetAmount) * 100) : 0;
                return (
                  <View key={g.id} style={[styles.goalRow, i > 0 && styles.borderTop]}>
                    <Text style={styles.goalEmoji}>{g.emoji}</Text>
                    <View style={styles.goalInfo}>
                      <Text style={styles.goalName}>{g.name}</Text>
                      <Text style={styles.goalSub}>
                        {g.allocatedAmount.toFixed(0)} / {g.targetAmount.toFixed(0)} € — {pct.toFixed(0)}%
                      </Text>
                    </View>
                    {g.allocatedAmount >= g.targetAmount && (
                      <Text style={styles.goalDone}>✓</Text>
                    )}
                  </View>
                );
              })}
            </View>
          </>
        )}

        {history.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>MONTHLY HISTORY</Text>
            <View style={styles.card}>
              {history.map((m, i) => (
                <View key={m.monthKey} style={[styles.histRow, i > 0 && styles.borderTop]}>
                  <View style={styles.histLeft}>
                    <Text style={styles.histMonth}>{m.monthKey}</Text>
                    <View style={[styles.badge, { backgroundColor: m.isGoalReached ? Colors.greenLight : Colors.redLight }]}>
                      <Text style={[styles.badgeText, { color: m.isGoalReached ? Colors.green : Colors.red }]}>
                        {m.isGoalReached ? '✓' : '✗'}
                      </Text>
                    </View>
                  </View>
                  <View style={styles.histRight}>
                    <Text style={styles.histStat}>
                      {m.totalSpent.toFixed(0)} € spent
                    </Text>
                    <Text style={[styles.histStat, { color: m.isGoalReached ? Colors.green : Colors.slate400 }]}>
                      {m.totalSaved.toFixed(0)} € saved
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionLabel}>RAW DATA</Text>
        <View style={styles.card}>
          <InfoRow label="Total expenses (all months)" value={String(allExpenses.length)} />
          <InfoRow label="Savings goals" value={String(savingsGoals.length)} />
          <InfoRow label="History entries" value={String(history.length)} />
          <InfoRow label="Data version" value="1.0" />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
    paddingBottom: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate200,
  },
  umamiBtn: {
    backgroundColor: Colors.indigoLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99,
  },
  umamiBtnText: { fontSize: 12, fontWeight: '600', color: Colors.indigo },
  title: { fontSize: 17, fontWeight: '700', color: Colors.slate800 },
  sub: { fontSize: 11, color: Colors.slate400, marginTop: 2 },
  scroll: { flex: 1 },
  content: { padding: 14, gap: 10 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.slate400,
    letterSpacing: 0.8,
    marginTop: 4,
  },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  statCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 12,
    flex: 1,
    minWidth: '28%',
    alignItems: 'center',
    gap: 4,
  },
  statValue: { fontSize: 18, fontWeight: '700', color: Colors.indigo },
  statLabel: { fontSize: 10, color: Colors.slate400, textAlign: 'center' },
  card: { backgroundColor: Colors.white, borderRadius: 13, overflow: 'hidden' },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate100,
  },
  infoLabel: { fontSize: 13, color: Colors.slate600 },
  infoValue: { fontSize: 13, fontWeight: '600', color: Colors.slate800 },
  borderTop: { borderTopWidth: 1, borderTopColor: Colors.slate100 },
  catRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 10,
    gap: 8,
  },
  catEmoji: { fontSize: 16, width: 24 },
  catName: { flex: 1, fontSize: 13, color: Colors.slate800 },
  catCount: { fontSize: 11, color: Colors.slate400, marginRight: 8 },
  catAmount: { fontSize: 13, fontWeight: '600', color: Colors.indigo },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 10,
    gap: 10,
  },
  goalEmoji: { fontSize: 20 },
  goalInfo: { flex: 1 },
  goalName: { fontSize: 13, fontWeight: '500', color: Colors.slate800 },
  goalSub: { fontSize: 11, color: Colors.slate400, marginTop: 2 },
  goalDone: { fontSize: 16, color: Colors.green },
  histRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  histLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  histMonth: { fontSize: 12, fontWeight: '500', color: Colors.slate800 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 99 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  histRight: { gap: 2, alignItems: 'flex-end' },
  histStat: { fontSize: 11, color: Colors.slate600 },
});
