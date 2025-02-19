declare module 'react-native-fast-image' {
    import { Component } from 'react';
    import { ImageStyle, StyleProp, ViewProps } from 'react-native';

    namespace FastImage {
        interface Source {
            uri?: string;
            headers?: { [key: string]: string };
            priority?: Priority;
            cache?: CacheControl;
        }

        interface Priority {
            low: 'low';
            normal: 'normal';
            high: 'high';
        }

        interface CacheControl {
            immutable: 'immutable';
            web: 'web';
            cacheOnly: 'cacheOnly';
        }

        interface PreloadItem {
            uri: string;
            priority?: number;
        }

        interface ResizeMode {
            contain: 'contain';
            cover: 'cover';
            stretch: 'stretch';
            center: 'center';
        }
    }

    interface FastImageProps extends ViewProps {
        source: FastImage.Source | number;
        resizeMode?: keyof FastImage.ResizeMode;
        fallback?: boolean;
        onLoadStart?(): void;
        onProgress?(event: { nativeEvent: { loaded: number; total: number } }): void;
        onLoad?(): void;
        onError?(): void;
        onLoadEnd?(): void;
        style?: StyleProp<ImageStyle>;
        tintColor?: string;
    }

    class FastImage extends Component<FastImageProps> {
        static resizeMode: FastImage.ResizeMode;
        static priority: FastImage.Priority;
        static cacheControl: FastImage.CacheControl;
        static preload(sources: FastImage.PreloadItem[]): Promise<void>;
        static clearMemoryCache(): Promise<void>;
        static clearDiskCache(): Promise<void>;
    }

    export default FastImage;
} 