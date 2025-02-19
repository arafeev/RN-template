import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
    Home: undefined;
    CharacterSelect: {
        gameId: string;
    };
    Game: {
        gameId: string;
        characterId: string;
    };
    OnlineGame: undefined;
    Settings: undefined;
    Friends: undefined;
}; 