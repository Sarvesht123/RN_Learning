import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FormField } from '@/components/FormField';
import { Header } from '@/components/Header';
import { colors } from '@/constants/colors';
import { requestPasswordReset } from '@/services/commerce';

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const submit = async () => {
    try {
      setBusy(true);
      await requestPasswordReset(email);
      setMessage('If an account exists, Magento will send password reset instructions.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Password reset request failed.');
    } finally {
      setBusy(false);
    }
  };
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Header title="Forgot Password" back />
        <FormField label="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        {message ? <Text style={styles.message}>{message}</Text> : null}
        <Pressable style={styles.button} disabled={busy || !email.trim()} onPress={submit}>
          {busy ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Send Reset Email</Text>}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, gap: 16 },
  message: { color: colors.muted, lineHeight: 20 },
  button: { height: 52, borderRadius: 11, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: colors.white, fontWeight: '900' },
});
