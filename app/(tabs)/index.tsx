import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useRootNavigationState } from 'expo-router';
import { IconSettings, IconX, IconDownload } from '@tabler/icons-react-native';
import { Colors } from '../../constants/Colors';
import { useApp } from '../../context/AppContext';
import { CategoryCard } from '../../components/CategoryCard';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { IOSInstallInstructions } from '../../components/IOSInstallInstructions';
import { useLanguage } from '../../context/LanguageContext';

function formatMonthLabel(monthKey: string, locale: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString(locale, { month: 'long', year: 'numeric' });
}

export default function HomeScreen() {
  const { t, locale } = useLanguage();
  const { data, isLoading, pendingGapMonths, clearPendingGapMonths, getCurrentMonthExpenses, getCategorySpent, checkMonthChange } = useApp();
  const router = useRouter();
  const rootNavState = useRootNavigationState();
  const [gapDismissed, setGapDismissed] = useState(false);
  const { canInstall, isInstalled, isIOS, showIOSInstructions, handleInstall, dismissIOSInstructions } = usePWAInstall();

  useEffect(() => {
    if (!rootNavState?.key || isLoading) return;

    if (!data.currentMonthConfig) {
      if (data.lastOpenedMonth === '') {
        router.replace('/onboarding' as any);
      } else {
        router.replace('/modals/customize-month');
      }
      return;
    }

    const { changed } = checkMonthChange();
    if (changed) {
      router.push('/modals/month-recap');
    }
  }, [rootNavState?.key, isLoading]);

  // Reset gap dismissed state when new gap comes in
  useEffect(() => {
    if (pendingGapMonths > 0) setGapDismissed(false);
  }, [pendingGapMonths]);

  if (!data.currentMonthConfig) return null;

  const config = data.currentMonthConfig;
  const expenses = getCurrentMonthExpenses();
  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const solde = config.income - totalSpent;
  const monthLabel = formatMonthLabel(config.monthKey, locale);
  const showGapBanner = pendingGapMonths > 0 && !gapDismissed;

  const dismissGap = () => {
    setGapDismissed(true);
    clearPendingGapMonths();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}</Text>
          <Text style={styles.headerSub}>{t.home.title}</Text>
        </View>
        <TouchableOpacity onPress={() => router.push('/settings')} style={{ padding: 6 }}>
          <IconSettings size={22} color={Colors.slate600} />
        </TouchableOpacity>
      </View>

      {showGapBanner && (
        <View style={styles.gapBanner}>
          <Text style={styles.gapText}>
            {t.home.gapBanner.replace('{months}', String(pendingGapMonths))}
          </Text>
          <TouchableOpacity onPress={dismissGap} style={{ padding: 2 }}>
            <IconX size={16} color={Colors.indigoDark} />
          </TouchableOpacity>
        </View>
      )}

      {Platform.OS === 'web' && !isInstalled && (canInstall || isIOS) && (
        <TouchableOpacity onPress={handleInstall} style={styles.installBanner} activeOpacity={0.8}>
          <IconDownload size={18} color={Colors.indigo} />
          <View style={{ flex: 1 }}>
            <Text style={styles.installTitle}>{t.home.installApp}</Text>
            <Text style={styles.installSub}>{t.home.installAppSub}</Text>
          </View>
          <Text style={styles.installArrow}>→</Text>
        </TouchableOpacity>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.soldeCard}>
          <Text style={styles.soldeAmount}>{solde.toFixed(2)} €</Text>
          <Text style={styles.soldeLabel}>{t.home.remainingBalance}</Text>
        </View>

        <View style={styles.miniCards}>
          <View style={[styles.miniCard, { backgroundColor: Colors.indigoLight }]}>
            <Text style={styles.miniLabel}>{t.home.spent.toUpperCase()}</Text>
            <Text style={[styles.miniValue, { color: Colors.indigo }]}>{totalSpent.toFixed(0)} €</Text>
          </View>
          <View style={[styles.miniCard, { backgroundColor: Colors.greenLight }]}>
            <Text style={styles.miniLabel}>{t.home.savingsGoal.toUpperCase()}</Text>
            <Text style={[styles.miniValue, { color: Colors.green }]}>{config.savingsGoal.toFixed(0)} €</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>{t.home.categories.toUpperCase()}</Text>
        {config.categories.length === 0 ? (
          <Text style={styles.emptyText}>{t.expenses.noCategories}</Text>
        ) : (
          config.categories.map(cat => (
            <CategoryCard
              key={cat.id}
              category={cat}
              spent={getCategorySpent(cat.id)}
              mode="compact"
            />
          ))
        )}

        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.fabWrap}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/modals/add-expense')}
          activeOpacity={0.85}
        >
          <Text style={styles.fabText}>{t.home.addExpense}</Text>
        </TouchableOpacity>
      </View>

      <IOSInstallInstructions visible={showIOSInstructions} onDismiss={dismissIOSInstructions} />
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
  gapBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.indigoLight,
    paddingHorizontal: 13, paddingVertical: 9, gap: 8,
  },
  gapText: { flex: 1, fontSize: 12, color: Colors.indigoDark, lineHeight: 17 },
  installBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Colors.indigoLight,
    borderRadius: 10,
    padding: 11,
    marginHorizontal: 11,
    marginTop: 9,
    borderWidth: 0.5,
    borderColor: Colors.indigoMid,
  },
  installTitle: { fontSize: 13, fontWeight: '500', color: Colors.indigoDark },
  installSub: { fontSize: 11, color: Colors.indigoMid, marginTop: 1 },
  installArrow: { fontSize: 11, color: Colors.indigoMid, fontWeight: '500' },
  scroll: { flex: 1 },
  content: { padding: 11, gap: 9 },
  soldeCard: {
    backgroundColor: Colors.white,
    borderRadius: 13,
    padding: 20,
    alignItems: 'center',
  },
  soldeAmount: { fontSize: 32, fontWeight: '700', color: Colors.indigoDark },
  soldeLabel: { fontSize: 12, color: Colors.slate400, marginTop: 4 },
  miniCards: { flexDirection: 'row', gap: 9 },
  miniCard: { flex: 1, borderRadius: 13, padding: 13, gap: 4 },
  miniLabel: { fontSize: 9, fontWeight: '600', color: Colors.slate600, letterSpacing: 0.5 },
  miniValue: { fontSize: 18, fontWeight: '700' },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.slate400,
    letterSpacing: 0.8,
    marginTop: 4,
    marginBottom: 2,
  },
  emptyText: { fontSize: 13, color: Colors.slate400, fontStyle: 'italic', textAlign: 'center', padding: 16 },
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
