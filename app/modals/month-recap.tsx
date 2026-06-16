import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants/Colors';
import { useApp } from '../../context/AppContext';

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function computeGap(from: string, to: string): number {
  const [fy, fm] = from.split('-').map(Number);
  const [ty, tm] = to.split('-').map(Number);
  return (ty - fy) * 12 + (tm - fm);
}

export default function MonthRecapModal() {
  const { data } = useApp();
  const router = useRouter();

  const config = data.currentMonthConfig;
  if (!config) return null;

  const monthKey = config.monthKey;
  const skippedMonths = Math.max(0, computeGap(monthKey, getCurrentMonthKey()) - 1);
  const expenses = data.expenses.filter(e => e.monthKey === monthKey);
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const totalSaved = config.income - totalSpent;
  const isGoalReached = totalSaved >= config.savingsGoal;
  const monthLabel = formatMonthLabel(monthKey);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Bilan — {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</Text>
      </View>

      {skippedMonths > 0 && (
        <View style={styles.gapBanner}>
          <Text style={styles.gapText}>
            Tu n'as pas ouvert l'app depuis {skippedMonths + 1} mois. Les mois manquants seront archivés automatiquement.
          </Text>
        </View>
      )}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Finances */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Revenu</Text>
            <Text style={styles.rowValue}>{config.income.toFixed(0)} €</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Dépensé</Text>
            <Text style={[styles.rowValue, { color: Colors.indigo }]}>{totalSpent.toFixed(0)} €</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Épargné</Text>
            <Text style={[styles.rowValue, { color: totalSaved >= 0 ? Colors.green : Colors.red }]}>
              {totalSaved.toFixed(0)} €
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.rowLabel}>Objectif était</Text>
            <Text style={styles.rowValue}>{config.savingsGoal.toFixed(0)} €</Text>
          </View>
        </View>

        {/* Catégories */}
        <Text style={styles.sectionLabel}>CATÉGORIES</Text>
        {config.categories.map(cat => {
          const spent = expenses.filter(e => e.categoryId === cat.id).reduce((s, e) => s + e.amount, 0);
          const isOver = spent > cat.budget;
          return (
            <View key={cat.id} style={styles.catRow}>
              <Text style={styles.catEmoji}>{cat.emoji}</Text>
              <Text style={styles.catName}>{cat.name}</Text>
              <Text style={styles.catSpent}>{spent.toFixed(0)} € / {cat.budget.toFixed(0)} €</Text>
              <View style={[styles.catBadge, { backgroundColor: isOver ? Colors.redLight : Colors.greenLight }]}>
                <Text style={[styles.catBadgeText, { color: isOver ? Colors.red : Colors.green }]}>
                  {isOver ? 'Dépassé' : 'OK'}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Banner résultat */}
        <View style={[styles.banner, { backgroundColor: isGoalReached ? Colors.greenLight : Colors.redLight }]}>
          <Text style={[styles.bannerText, { color: isGoalReached ? Colors.green : Colors.red }]}>
            {isGoalReached ? '🎉 Objectif d\'épargne atteint !' : '📉 Objectif non atteint'}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={() => router.replace('/modals/new-month')}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>Voir le mois suivant →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.slate50 },
  header: { paddingHorizontal: 16, paddingVertical: 14, backgroundColor: Colors.white, borderBottomWidth: 1, borderBottomColor: Colors.slate200 },
  title: { fontSize: 17, fontWeight: '600', color: Colors.slate800 },
  scroll: { flex: 1 },
  content: { padding: 11, gap: 9 },
  card: { backgroundColor: Colors.white, borderRadius: 13, padding: 13, gap: 9 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rowLabel: { fontSize: 13, color: Colors.slate600 },
  rowValue: { fontSize: 13, fontWeight: '600', color: Colors.slate800 },
  divider: { height: 1, backgroundColor: Colors.slate200 },
  sectionLabel: { fontSize: 10, fontWeight: '600', color: Colors.slate400, letterSpacing: 0.8, marginTop: 4 },
  catRow: { backgroundColor: Colors.white, borderRadius: 9, padding: 11, flexDirection: 'row', alignItems: 'center', gap: 8 },
  catEmoji: { fontSize: 16 },
  catName: { flex: 1, fontSize: 13, color: Colors.slate800 },
  catSpent: { fontSize: 12, color: Colors.slate600 },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  catBadgeText: { fontSize: 11, fontWeight: '600' },
  banner: { borderRadius: 13, padding: 16, alignItems: 'center' },
  bannerText: { fontSize: 15, fontWeight: '700' },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: Colors.slate200, backgroundColor: Colors.white },
  nextBtn: { backgroundColor: Colors.indigo, borderRadius: 99, paddingVertical: 15, alignItems: 'center' },
  nextBtnText: { color: Colors.white, fontSize: 15, fontWeight: '600' },
  gapBanner: { backgroundColor: Colors.indigoLight, paddingHorizontal: 16, paddingVertical: 10 },
  gapText: { fontSize: 12, color: Colors.indigoDark, lineHeight: 17 },
});
