declare module 'react-native-vector-icons/MaterialCommunityIcons' {
    import { Component } from 'react';
    import { TextProps } from 'react-native';

    interface IconProps extends TextProps {
        name: string;
        size?: number;
        color?: string;
    }

    export default class Icon extends Component<IconProps> {
        static getImageSource(
            name: string,
            size?: number,
            color?: string
        ): Promise<any>;
        static getRawGlyphMap(): { [name: string]: number };
        static loadFont(file?: string): Promise<void>;
        static hasIcon(name: string): boolean;
    }
} 