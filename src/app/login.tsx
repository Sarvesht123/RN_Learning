import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FormField } from '@/components/FormField';
import { Header } from '@/components/Header';
import { useCustomer } from '@/context/CustomerContext';
import { colors } from '@/constants/colors';

export default function Login() {
  const [email, setEmail] = useState('learner@example.com'); const [password, setPassword] = useState('password');
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const { signIn } = useCustomer(); const router = useRouter();
  const submit = async () => { try { setBusy(true); setError(''); await signIn(email, password); router.replace('/account'); } catch (e) { setError(e instanceof Error ? e.message : 'Sign in failed'); } finally { setBusy(false); } };
  return <SafeAreaView style={styles.safe}><View style={styles.content}><Header title="Sign In" back /><Text style={styles.title}>Welcome back</Text><Text style={styles.copy}>Use the prefilled test account in mock mode.</Text><FormField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" /><FormField label="Password" value={password} onChangeText={setPassword} secureTextEntry />{error ? <Text style={styles.error}>{error}</Text> : null}<Pressable style={styles.button} onPress={submit} disabled={busy}>{busy ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Sign In</Text>}</Pressable><Pressable onPress={() => router.push('/register')}><Text style={styles.link}>New customer? Create an account</Text></Pressable></View></SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, content: { padding: 16 }, title: { fontSize: 28, fontWeight: '900', marginTop: 20 }, copy: { color: colors.muted, marginVertical: 8, marginBottom: 24 }, error: { color: colors.primary, marginBottom: 10 }, button: { height: 52, backgroundColor: colors.primary, borderRadius: 11, alignItems: 'center', justifyContent: 'center' }, buttonText: { color: 'white', fontWeight: '900' }, link: { textAlign: 'center', color: colors.primary, fontWeight: '700', marginTop: 20 } });
