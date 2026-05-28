import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { MainTabParamList, RootStackParamList } from './types';
import LoginScreen from '../screens/LoginScreen';
import AthleteRegisterScreen from '../screens/AthleteRegisterScreen';
import PanelScreen from '../screens/PanelScreen';
import CheckInScreen from '../screens/CheckInScreen';
import AgendaScreen from '../screens/AgendaScreen';
import StoreScreen from '../screens/StoreScreen';
import GalleryScreen from '../screens/GalleryScreen';
import HistoryScreen from '../screens/HistoryScreen';
import TransparencyScreen from '../screens/TransparencyScreen';
import WarningsScreen from '../screens/WarningsScreen';
import DonationsScreen from '../screens/DonationsScreen';
import ReportCoachScreen from '../screens/ReportCoachScreen';
import DirectorateScreen from '../screens/DirectorateScreen';
import ProtectedRegisterScreen from '../screens/ProtectedRegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ApplyWarningScreen from '../screens/ApplyWarningScreen';
import MaterialRequestScreen from '../screens/MaterialRequestScreen';
import EventRequestScreen from '../screens/EventRequestScreen';
import MeetingSuggestionScreen from '../screens/MeetingSuggestionScreen';
import AdminFilesScreen from '../screens/AdminFilesScreen';
import InviteScreen from '../screens/InviteScreen';
import CouponManagerScreen from '../screens/CouponManagerScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: '#8A99AA',
      tabBarLabelStyle: { fontWeight: '800', fontSize: 11 },
      tabBarStyle: { height: 84, paddingTop: 8, paddingBottom: 18, backgroundColor: '#fff', borderTopColor: colors.border },
      tabBarIcon: ({ color, size }) => {
        const icons: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
          Painel: 'grid', AgendaTab: 'calendar', QR: 'qr-code', Loja: 'bag', Perfil: 'person',
        };
        return <Ionicons name={icons[route.name]} size={route.name === 'QR' ? 32 : size} color={color} />;
      },
    })}>
      <Tab.Screen name="Painel" component={PanelScreen} />
      <Tab.Screen name="AgendaTab" component={AgendaScreen} options={{ title: 'Agenda' }} />
      <Tab.Screen name="QR" component={CheckInScreen} options={{ title: 'Check-in' }} />
      <Tab.Screen name="Loja" component={StoreScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="AthleteRegister" component={AthleteRegisterScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="CheckIn" component={CheckInScreen} />
        <Stack.Screen name="Agenda" component={AgendaScreen} />
        <Stack.Screen name="Store" component={StoreScreen} />
        <Stack.Screen name="Gallery" component={GalleryScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen name="Transparency" component={TransparencyScreen} />
        <Stack.Screen name="Warnings" component={WarningsScreen} />
        <Stack.Screen name="Donations" component={DonationsScreen} />
        <Stack.Screen name="ReportCoach" component={ReportCoachScreen} />
        <Stack.Screen name="Directorate" component={DirectorateScreen} />
        <Stack.Screen name="ProtectedRegister" component={ProtectedRegisterScreen} />
        <Stack.Screen name="ApplyWarning" component={ApplyWarningScreen} />
        <Stack.Screen name="MaterialRequest" component={MaterialRequestScreen} />
        <Stack.Screen name="EventRequest" component={EventRequestScreen} />
        <Stack.Screen name="MeetingSuggestion" component={MeetingSuggestionScreen} />
        <Stack.Screen name="AdminFiles" component={AdminFilesScreen} />
        <Stack.Screen name="Invite" component={InviteScreen} />
        <Stack.Screen name="CouponManager" component={CouponManagerScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
