import { Text } from 'react-native';
import { Screen, Card } from '../components/Layout';
import { useApp } from '../context/AppContext';
import colors from '../theme/colors';
export default function WarningsScreen(){ const {user}=useApp(); const count=user?.warnings||0; return <Screen title="Advertências">{count>0?<Card style={{borderColor:colors.red}}><Text style={{fontSize:20,fontWeight:'900',color:colors.red}}>Você possui {count} advertência(s)</Text><Text style={{color:colors.muted,lineHeight:24,marginTop:10}}>Procure seu orientador ou a diretoria para regularizar a situação.</Text></Card>:<Card><Text style={{fontSize:20,fontWeight:'900'}}>Nenhuma advertência registrada.</Text><Text style={{color:colors.muted,marginTop:8}}>Continue mantendo disciplina e compromisso.</Text></Card>}</Screen> }
