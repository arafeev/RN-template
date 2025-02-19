import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthScreen } from '../screens/AuthScreen';
import { MainMenuScreen } from '../screens/MainMenuScreen';
import { GameScreen } from '../screens/GameScreen';
import { OnlineGameScreen } from '../screens/OnlineGameScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { RulesScreen } from '../screens/RulesScreen';
import { CardCollectionScreen } from '../screens/CardCollectionScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { CharacterSelectScreen } from '../screens/CharacterSelectScreen';
import { authService } from '../services/authService';
import type { UserProfile } from '../services/authService';

export type RootStackParamList = {
    Auth: undefined;
    MainMenu: undefined;
    Game: { gameId: string; characterId?: string };
    OnlineGame: undefined;
    Friends: undefined;
    Rules: undefined;
    CardCollection: undefined;
    Settings: undefined;
    CharacterSelect: { gameId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = authService.onAuthStateChanged((user) => {
            setUser(user);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    if (isLoading) {
        return null; // Or your loading screen component
    }

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#1E2124',
                    },
                    headerTintColor: '#FFFFFF',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}
            >
                {!user ? (
                    <Stack.Screen
                        name="Auth"
                        component={AuthScreen}
                        options={{ headerShown: false }}
                    />
                ) : (
                    <>
                        <Stack.Screen
                            name="MainMenu"
                            component={MainMenuScreen}
                            options={{ title: 'MAFIA COMMAND' }}
                        />
                        <Stack.Screen
                            name="CharacterSelect"
                            component={CharacterSelectScreen}
                            options={{ title: 'Select Character' }}
                        />
                        <Stack.Screen
                            name="Game"
                            component={GameScreen}
                            options={{ title: 'Game' }}
                        />
                        <Stack.Screen
                            name="OnlineGame"
                            component={OnlineGameScreen}
                            options={{ title: 'Online Game' }}
                        />
                        <Stack.Screen
                            name="Friends"
                            component={FriendsScreen}
                            options={{ title: 'Friends' }}
                        />
                        <Stack.Screen
                            name="Rules"
                            component={RulesScreen}
                            options={{ title: 'Rules' }}
                        />
                        <Stack.Screen
                            name="CardCollection"
                            component={CardCollectionScreen}
                            options={{ title: 'Card Collection' }}
                        />
                        <Stack.Screen
                            name="Settings"
                            component={SettingsScreen}
                            options={{ title: 'Settings' }}
                        />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}; 