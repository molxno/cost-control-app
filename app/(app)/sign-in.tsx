import React, { useState } from 'react';
import { Alert, StyleSheet } from 'react-native';
import { Input, Button } from '@rneui/themed';
import { useSession } from '@/context/auth';
import { router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';

export default function SignIn() {
    const { signIn } = useSession();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        setLoading(true);
        try {
            await signIn(email, password);
            router.replace('/');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
        setLoading(false);
    };

    return (
        <ThemedView style={styles.container}>
            <Input
                label="Email"
                leftIcon={{ type: 'font-awesome', name: 'envelope' }}
                onChangeText={setEmail}
                value={email}
                placeholder="email@address.com"
                autoCapitalize="none"
            />
            <Input
                label="Password"
                leftIcon={{ type: 'font-awesome', name: 'lock' }}
                onChangeText={setPassword}
                value={password}
                secureTextEntry
                placeholder="Password"
                autoCapitalize="none"
            />
            <Button title="Sign In" loading={loading} onPress={handleSignIn} />
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 16,
    },
});
