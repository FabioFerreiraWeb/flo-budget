import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { ProgressBar } from './ProgressBar';
import { Category, Expense } from '../types';

interface CategoryCardProps {
  category: Category;
  spent: number;
  expenses?: Expense[];
  mode: 'compact' | 'expanded';
  onDeleteExpense?: (id: string) => void;
}

export function CategoryCard({ category, spent, expenses, mode, onDeleteExpense }: CategoryCardProps) {
  const percentage = category.budget > 0 ? (spent / category.budget) * 100 : 0;
  const overBy = spent - category.budget;
  const isAtLimit = percentage >= 100 && overBy <= 0;
  const isOver = overBy > 0;

  return (
    <View style={[styles.card, isOver && styles.cardOver, isAtLimit && styles.cardAtLimit]}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{category.emoji}</Text>
        <View style={styles.info}>
          <Text style={styles.name}>{category.name}</Text>
          <Text style={styles.amounts}>
            {spent.toFixed(0)} / {category.budget.toFixed(0)} €
          </Text>
        </View>
        <View style={[styles.badge, { backgroundColor: isOver ? Colors.redLight : isAtLimit ? Colors.amberLight : Colors.indigoLight }]}>
          <Text style={[styles.badgeText, { color: isOver ? Colors.red : isAtLimit ? Colors.amber : Colors.indigo }]}>
            {percentage.toFixed(0)}%
          </Text>
        </View>
      </View>

      <ProgressBar percentage={percentage} height={5} />

      {mode === 'expanded' && (
        <>
          {isOver && (
            <Text style={styles.overText}>
              ⚠ Plafond dépassé de {overBy.toFixed(0)} €
            </Text>
          )}
          {isAtLimit && (
            <Text style={styles.atLimitText}>
              ✓ Plafond atteint
            </Text>
          )}
          {expenses && expenses.length > 0 && (
            <View style={styles.expenseList}>
              {expenses.map(exp => (
                <View key={exp.id} style={styles.expenseRow}>
                  <Text style={styles.expenseDesc} numberOfLines={1}>{exp.description}</Text>
                  <Text style={styles.expenseAmount}>{exp.amount.toFixed(0)} €</Text>
                  {onDeleteExpense && (
                    <TouchableOpacity onPress={() => onDeleteExpense(exp.id)} style={styles.deleteBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={styles.deleteText}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          )}
          {expenses && expenses.length === 0 && (
            <Text style={styles.emptyText}>Aucune dépense dans cette catégorie</Text>
          )}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 13,
    padding: 13,
    marginBottom: 9,
  },
  cardOver: {
    borderWidth: 1.5,
    borderColor: Colors.red,
  },
  cardAtLimit: {
    borderWidth: 1.5,
    borderColor: Colors.amber,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
    marginBottom: 8,
  },
  emoji: { fontSize: 18 },
  info: { flex: 1 },
  name: { fontSize: 13, fontWeight: '600', color: Colors.slate800 },
  amounts: { fontSize: 11, color: Colors.slate400, marginTop: 1 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
  },
  badgeText: { fontSize: 11, fontWeight: '600' },
  overText: {
    fontSize: 11,
    color: Colors.red,
    marginTop: 7,
    fontWeight: '500',
  },
  atLimitText: {
    fontSize: 11,
    color: Colors.amber,
    marginTop: 7,
    fontWeight: '500',
  },
  expenseList: {
    marginTop: 9,
    borderTopWidth: 1,
    borderTopColor: Colors.slate100,
    paddingTop: 9,
    gap: 7,
  },
  expenseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  expenseDesc: { flex: 1, fontSize: 12, color: Colors.slate600 },
  expenseAmount: { fontSize: 12, fontWeight: '500', color: Colors.slate800 },
  deleteBtn: { padding: 2 },
  deleteText: { fontSize: 11, color: Colors.slate400 },
  emptyText: { fontSize: 11, color: Colors.slate400, marginTop: 7, fontStyle: 'italic' },
});
