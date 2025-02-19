import React from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    ViewStyle,
    ScrollView,
} from 'react-native';

interface ScreenTemplateProps {
    children: React.ReactNode;
    style?: ViewStyle;
    scrollable?: boolean;
}

export const ScreenTemplate: React.FC<ScreenTemplateProps> = ({
    children,
    style,
    scrollable = false,
}) => {
    const Content = scrollable ? ScrollView : View;

    return (
        <SafeAreaView style={styles.container}>
            <Content style={[styles.content, style]}>
                {children}
            </Content>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E2124',
    },
    content: {
        flex: 1,
        padding: 16,
    },
}); 