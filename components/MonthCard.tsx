import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { MonthSummary } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface MonthCardProps {
  summary: MonthSummary;
}

function formatMonthKey(monthKey: string, locale: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

export function MonthCard({ summary }: MonthCardProps) {
  const { t, locale } = useLanguage();
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.monthName}>{formatMonthKey(summary.monthKey, locale)}</Text>
        <View style={[
          styles.badge,
          { backgroundColor: summary.isGoalReached ? Colors.greenLight : Colors.redLight }
        ]}>
          <Text style={[
            styles.badgeText,
            { color: summary.isGoalReached ? Colors.green : Colors.red }
          ]}>
            {summary.isGoalReached ? t.history.goalReached : t.history.overspent}
          </Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t.history.budget}</Text>
          <Text style={styles.statValue}>{summary.income.toFixed(0)} €</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t.history.spent}</Text>
          <Text style={[styles.statValue, { color: Colors.indigo }]}>
            {summary.totalSpent.toFixed(0)} €
          </Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>{t.history.saved}</Text>
          <Text style={[styles.statValue, { color: summary.isGoalReached ? Colors.green : Colors.red }]}>
            {summary.totalSaved.toFixed(0)} €
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.white,
    borderRadius: 13,
    padding: 11,
    paddingHorizontal: 13,
    marginBottom: 9,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  monthName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.slate800,
    textTransform: 'capitalize',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    color: Colors.slate400,
    letterSpacing: 0.5,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.slate800,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.slate200,
  },
});
