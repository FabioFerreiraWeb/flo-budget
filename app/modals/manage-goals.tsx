import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Pressable, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { IconX, IconPlus, IconTrash } from '@tabler/icons-react-native';
import { Colors } from '../../constants/Colors';
import { useApp } from '../../context/AppContext';
import { ProgressBar } from '../../components/ProgressBar';

export default function ManageGoalsModal() {
  const { data, deleteSavingsGoal } = useApp();
  const router = useRouter();

  function handleDelete(goalId: string) {
    const goal = data.savingsGoals.find(g => g.id === goalId);
    if (!goal) return;

    const message = `Les ${goal.allocatedAmount.toFixed(2)} € alloués à '${goal.name}' seront restitués à ta cagnotte libre.`;

    if (Platform.OS === 'web') {
      if (window.confirm(`Supprimer cet objectif ?\n\n${message}`)) {
        deleteSavingsGoal(goalId);
      }
      return;
    }

    Alert.alert(
      'Supprimer cet objectif ?',
      message,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            deleteSavingsGoal(goalId);
          },
        },
      ],
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Gérer les objectifs</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
          <IconX size={20} color={Colors.slate600} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {data.savingsGoals.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyText}>Aucun objectif pour l'instant</Text>
          </View>
        ) : (
          data.savingsGoals.map(goal => {
            const pct = goal.targetAmount > 0 ? goal.allocatedAmount / goal.targetAmount : 0;
            return (
              <View key={goal.id} style={styles.goalRow}>
                <View style={styles.goalLeft}>
                  <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                  <View style={styles.goalInfo}>
                    <Text style={styles.goalName}>{goal.name}</Text>
                    <Text style={styles.goalAmounts}>
                      {goal.allocatedAmount.toFixed(0)} € / {goal.targetAmount.toFixed(0)} €
                    </Text>
                    <View style={styles.progressWrap}>
                      <ProgressBar percentage={Math.round(pct * 100)} height={4} />
                    </View>
                  </View>
                </View>
                <Pressable
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(goal.id)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <IconTrash size={18} color={Colors.red} />
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.newGoalBtn}
          onPress={() => {
            router.back();
            setTimeout(() => router.push('/modals/add-goal'), 50);
          }}
          activeOpacity={0.85}
        >
          <IconPlus size={18} color={Colors.white} />
          <Text style={styles.newGoalText}>Nouvel objectif</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate200,
  },
  title: { fontSize: 17, fontWeight: '700', color: Colors.slate800 },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 99,
    backgroundColor: Colors.slate100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 0 },
  empty: { alignItems: 'center', paddingVertical: 48, gap: 10 },
  emptyEmoji: { fontSize: 36 },
  emptyText: { fontSize: 14, color: Colors.slate400 },
  goalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: Colors.slate100,
    gap: 12,
  },
  goalLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  goalEmoji: { fontSize: 26 },
  goalInfo: { flex: 1, gap: 3 },
  goalName: { fontSize: 14, fontWeight: '600', color: Colors.slate800 },
  goalAmounts: { fontSize: 12, color: Colors.slate400 },
  progressWrap: { marginTop: 2 },
  deleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: Colors.redLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.slate200,
  },
  newGoalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.indigo,
    borderRadius: 99,
    paddingVertical: 14,
  },
  newGoalText: { fontSize: 15, fontWeight: '600', color: Colors.white },
});
