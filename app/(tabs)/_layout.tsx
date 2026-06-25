import { Tabs } from 'expo-router';
import { IconHome, IconCreditCard, IconCoin, IconClock } from '@tabler/icons-react-native';
import { Colors } from '../../constants/Colors';
import { useLanguage } from '../../context/LanguageContext';

export default function TabLayout() {
  const { t } = useLanguage();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.indigo,
        tabBarInactiveTintColor: Colors.slate400,
        tabBarStyle: {
          height: 80,
          paddingBottom: 16,
          paddingTop: 8,
          backgroundColor: '#ffffff',
          borderTopWidth: 0.5,
          borderTopColor: '#E2E8F0',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 0,
          marginBottom: 0,
          lineHeight: 14,
        },
        tabBarIconStyle: {
          marginBottom: 0,
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
          height: 80,
          justifyContent: 'center',
          alignItems: 'center',
          gap: 3,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t.tabs.home,
          tabBarIcon: ({ color, size }) => <IconHome color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="depenses"
        options={{
          title: t.tabs.expenses,
          tabBarIcon: ({ color, size }) => <IconCreditCard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="epargne"
        options={{
          title: t.tabs.savings,
          tabBarIcon: ({ color, size }) => <IconCoin color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="historique"
        options={{
          title: t.tabs.history,
          tabBarIcon: ({ color, size }) => <IconClock color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
