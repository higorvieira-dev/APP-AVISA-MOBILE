import { Alert, StyleSheet, Text, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
import colors from '../theme/colors';
import { Button } from '../components/Fields';
import { Screen } from '../components/Layout';

export default function CheckInScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  if (!permission) return <Screen title="Check-in"><Text>Carregando câmera...</Text></Screen>;
  if (!permission.granted) return <Screen title="Check-in"><Text style={{ color:colors.muted, lineHeight:22 }}>Permita o acesso à câmera para ler QR Code de treino, evento ou presença.</Text><Button title="Permitir câmera" onPress={requestPermission} /></Screen>;
  return <View style={styles.container}><CameraView style={StyleSheet.absoluteFillObject} barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={scanned ? undefined : ({ data }) => { setScanned(true); Alert.alert('Check-in realizado', `QR lido: ${data}`); }} /><View style={styles.overlay}><Text style={styles.title}>Aponte para o QR Code</Text><View style={styles.frame} /><Button title="Ler novamente" onPress={() => setScanned(false)} /></View></View>;
}
const styles = StyleSheet.create({ container:{flex:1,backgroundColor:'#000'}, overlay:{flex:1,justifyContent:'center',alignItems:'center',padding:24}, title:{color:'#fff',fontSize:24,fontWeight:'900',marginBottom:30}, frame:{width:260,height:260,borderWidth:4,borderColor:colors.primary,borderRadius:30,marginBottom:40} });
