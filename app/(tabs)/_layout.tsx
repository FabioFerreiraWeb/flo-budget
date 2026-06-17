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
          backgroundColor: Colors.white,
          borderTopColor: Colors.slate200,
          borderTopWidth: 1,
          height: 70,
          paddingBottom: 10,
          paddingTop: 6,
          overflow: 'visible',
        },
        tabBarLabelStyle: {
          fontSize: 10,
          marginTop: 2,
          marginBottom: 4,
        },
        tabBarIconStyle: {
          marginTop: 4,
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
