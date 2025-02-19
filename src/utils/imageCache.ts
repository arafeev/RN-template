import { Image } from 'react-native';
import FastImage from 'react-native-fast-image';

interface CacheConfig {
    urls: string[];
    priority?: FastImage.Priority;
}

class ImageCache {
    static preloadImages(config: CacheConfig) {
        const { urls, priority = FastImage.priority.normal } = config;

        FastImage.preload(
            urls.map(uri => ({
                uri,
                priority,
            }))
        );
    }

    static clearCache() {
        FastImage.clearMemoryCache();
        FastImage.clearDiskCache();
    }
}

export default ImageCache; 