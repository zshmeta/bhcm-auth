import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, FlatList } from 'react-native';
import { MarketDataProvider, useMarketDataContext } from './context/MarketDataContext';
import { Button } from './components/Button';
import { useEffect, useState } from 'react';

const Watchlist = () => {
    const { subscribe, unsubscribe, latestData, isConnected } = useMarketDataContext();
    const symbols = ['BTC-USD', 'ETH-USD', 'SOL-USD'];

    useEffect(() => {
        symbols.forEach(s => subscribe(s));
        return () => symbols.forEach(s => unsubscribe(s));
    }, []);

    return (
        <View style={styles.listContainer}>
            <Text style={styles.status}>Status: {isConnected ? 'Connected 🟢' : 'Disconnected 🔴'}</Text>
            <FlatList
                data={symbols}
                keyExtractor={item => item}
                renderItem={({ item }) => {
                    const data = latestData[item];
                    return (
                        <View style={styles.row}>
                            <Text style={styles.symbol}>{item}</Text>
                            <Text style={styles.price}>
                                {data ? `$${data.price.toFixed(2)}` : 'Loading...'}
                            </Text>
                        </View>
                    );
                }}
            />
        </View>
    );
};

export default function App() {
    return (
        <MarketDataProvider>
            <SafeAreaView style={styles.container}>
                <Text style={styles.header}>BHC Markets Mobile</Text>
                <Watchlist />
                <Button title="Trade Now" onPress={() => alert('Coming Soon')} />
                <StatusBar style="auto" />
            </SafeAreaView>
        </MarketDataProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        marginTop: 50,
        marginHorizontal: 20
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20
    },
    listContainer: {
        marginBottom: 20
    },
    status: {
        marginBottom: 10,
        color: '#666'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    symbol: {
        fontSize: 18,
        fontWeight: '600'
    },
    price: {
        fontSize: 18,
        fontVariant: ['tabular-nums']
    }
});
