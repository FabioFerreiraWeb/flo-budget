import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { ProgressBar } from './ProgressBar';
import { SavingsGoal } from '../types';

interface GoalCardProps {
  goal: SavingsGoal;
  monthlyContribution: number;
  onAllocate: () => void;
}

export function GoalCard({ goal, monthlyContribution, onAllocate }: GoalCardProps) {
  const percentage = goal.targetAmount > 0
    ? (goal.allocatedAmount / goal.targetAmount) * 100
    : 0;
  const remaining = goal.targetAmount - goal.allocatedAmount;
  const monthsLeft = monthlyContribution > 0
    ? Math.ceil(remaining / monthlyContribution)
    : null;
  const isComplete = goal.allocatedAmount >= goal.targetAmount;

  return (
    <View style={styles.card}>
      {/* Row 1: emoji + name/amounts + percentage */}
      <View style={styles.header}>
        <Text style={styles.emoji}>{goal.emoji}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{goal.name}</Text>
          <Text style={styles.amounts}>
            {goal.allocatedAmount.toFixed(0)} / {goal.targetAmount.toFixed(0)} €
          </Text>
        </View>
        <View style={[styles.pctBadge, { backgroundColor: isComplete ? Colors.greenLight : Colors.amberLight }]}>
          <Text style={[styles.pctText, { color: isComplete ? Colors.green : Colors.amber }]}>
            {percentage.toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <ProgressBar percentage={percentage} height={6} color={isComplete ? Colors.green : Colors.amber} />

      {/* Row 3: months estimate + allocate button */}
      <View style={styles.footer}>
        {!isComplete ? (
          <Text style={styles.estimate}>
            {monthsLeft !== null ? `~${monthsLeft} mois` : '--'}
          </Text>
        ) : (
          <View />
        )}
        {!isComplete ? (
          <TouchableOpacity style={styles.allocateBtn} onPress={onAllocate}>
            <Text style={styles.allocateText}>Alimenter →</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.completeBadge}>
            <Text style={styles.completeText}>✓ Atteint</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 13,
    padding: 13,
    marginBottom: 9,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  emoji: { fontSize: 20 },
  info: { flex: 1 },
  name: { fontSize: 13, fontWeight: '600', color: Colors.slate800 },
  amounts: { fontSize: 11, color: Colors.slate400, marginTop: 1 },
  pctBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  pctText: { fontSize: 11, fontWeight: '700' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  estimate: { fontSize: 11, color: Colors.slate400 },
  allocateBtn: {
    backgroundColor: Colors.amberLight,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 99,
  },
  allocateText: { fontSize: 12, fontWeight: '600', color: Colors.amber },
  completeBadge: {
    backgroundColor: Colors.greenLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  completeText: { fontSize: 11, fontWeight: '600', color: Colors.green },
});
