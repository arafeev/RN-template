import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Alert,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { authService } from '../services/authService';

interface FormData {
    username: string;
    password: string;
    agreeToTerms: boolean;
}

export const AuthScreen = () => {
    const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
        defaultValues: {
            username: '',
            password: '',
            agreeToTerms: false,
        },
    });

    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: FormData) => {
        if (!data.agreeToTerms) {
            Alert.alert('Error', 'Please agree to Terms & Conditions');
            return;
        }

        try {
            setIsLoading(true);
            // Using email as username for Firebase Auth
            await authService.signIn({
                email: `${data.username}@yourdomain.com`, // You might want to adjust this based on your requirements
                password: data.password,
            });
        } catch (error: any) {
            if (error.message.includes('user-not-found')) {
                // If user doesn't exist, try to create one
                try {
                    await authService.signUp({
                        email: `${data.username}@yourdomain.com`,
                        password: data.password,
                    });
                } catch (signUpError: any) {
                    Alert.alert('Error', signUpError.message);
                }
            } else {
                Alert.alert('Error', error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <View style={styles.content}>
                <Text style={styles.title}>Create or Log in Account</Text>
                <Text style={styles.subtitle}>Create your account to start playing</Text>

                <View style={styles.form}>
                    <Controller
                        control={control}
                        rules={{
                            required: 'Username is required',
                            minLength: {
                                value: 3,
                                message: 'Username must be at least 3 characters',
                            },
                        }}
                        name="username"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your username"
                                    onChangeText={onChange}
                                    value={value}
                                    autoCapitalize="none"
                                />
                                {errors.username && (
                                    <Text style={styles.errorText}>{errors.username.message}</Text>
                                )}
                            </View>
                        )}
                    />

                    <Controller
                        control={control}
                        rules={{
                            required: 'Password is required',
                            minLength: {
                                value: 6,
                                message: 'Password must be at least 6 characters',
                            },
                        }}
                        name="password"
                        render={({ field: { onChange, value } }) => (
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Enter your password"
                                    onChangeText={onChange}
                                    value={value}
                                    secureTextEntry
                                />
                                {errors.password && (
                                    <Text style={styles.errorText}>{errors.password.message}</Text>
                                )}
                            </View>
                        )}
                    />

                    <Controller
                        control={control}
                        name="agreeToTerms"
                        render={({ field: { onChange, value } }) => (
                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={() => onChange(!value)}
                            >
                                <View style={[styles.checkbox, value && styles.checkboxChecked]}>
                                    {value && <Text style={styles.checkmark}>✓</Text>}
                                </View>
                                <Text style={styles.termsText}>I agree with Terms & Conditions</Text>
                            </TouchableOpacity>
                        )}
                    />

                    <TouchableOpacity
                        style={[styles.signInButton, isLoading && styles.signInButtonDisabled]}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isLoading}
                    >
                        <Text style={styles.signInButtonText}>
                            {isLoading ? 'Please wait...' : 'Sign In'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 32,
    },
    form: {
        gap: 16,
    },
    inputContainer: {
        gap: 4,
    },
    input: {
        height: 50,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        paddingHorizontal: 16,
        fontSize: 16,
    },
    errorText: {
        color: '#FF3B30',
        fontSize: 12,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderWidth: 2,
        borderColor: '#6C63FF',
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkboxChecked: {
        backgroundColor: '#6C63FF',
    },
    checkmark: {
        color: '#FFFFFF',
        fontSize: 14,
    },
    termsText: {
        color: '#333',
        fontSize: 14,
    },
    signInButton: {
        height: 50,
        backgroundColor: '#6C63FF',
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    signInButtonDisabled: {
        opacity: 0.7,
    },
    signInButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
}); 