import { Tabs } from 'expo-router';
import { IconHome, IconCreditCard, IconCoin, IconClock } from '@tabler/icons-react-native';
import { Colors } from '../../constants/Colors';

export default function TabLayout() {
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
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <IconHome color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="depenses"
        options={{
          title: 'Dépenses',
          tabBarIcon: ({ color, size }) => <IconCreditCard color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="epargne"
        options={{
          title: 'Épargne',
          tabBarIcon: ({ color, size }) => <IconCoin color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="historique"
        options={{
          title: 'Historique',
          tabBarIcon: ({ color, size }) => <IconClock color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
