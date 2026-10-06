import React from 'react';
import { View, Text } from 'react-native';
import { Clock, Timer, Calendar, FileText } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { styles } from '../../css/quickActionsCss';

const QUICK_ACTIONS = [
  {
    id: '1',
    title: 'Daily Punch',
    icon: Clock,
    color: '#155dfc',
    path: 'DailyPuch',
  },
  {
    id: '2',
    title: 'Break Time',
    icon: Timer,
    color: '#f54a00',
    path: '',
  },
  {
    id: '3',
    title: 'Leave Mgmt',
    icon: Calendar,
    color: '#e60076',
    path: '',
  },
  {
    id: '4',
    title: 'Reports',
    icon: FileText,
    color: '#009689',
    path: '',
  },
];

const QuickActions = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Quick Actions</Text>
      <View style={styles.grid}>
        {QUICK_ACTIONS.map(item => (
          <ActionCard key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
};

export default QuickActions;

const ActionCard = ({ item }) => {
  const Icon = item.icon;
  const navigation = useNavigation();
  const handleNavigation = () => {
    if (!item.path) return;
    navigation.navigate(item.path);
  };
  return (
    <View style={styles.card} onTouchEnd={handleNavigation}>
      <View style={[styles.iconWrapper, { backgroundColor: item.color }]}>
        <Icon size={22} color="#fff" />
      </View>
      <Text style={styles.title}>{item.title}</Text>
    </View>
  );
};
