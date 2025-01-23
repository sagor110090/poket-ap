import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    ScrollView
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../../../services/api';
import NoteCard from '../../../components/NoteCard';
import NoteSearch from '../../../components/NoteSearch';
import NoteCreateEditModal from '../../../components/NoteCreateEditModal';

const ArchiveTab = ({ navigation }) => {
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState(null);
    const [perPage, setPerPage] = useState(10);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        fetchNotes();
    }, [searchQuery, perPage, page]);

    // Refresh tasks when screen comes into focus
    useFocusEffect(
        React.useCallback(() => {
            fetchNotes();
        }, [])
    );



    const fetchNotes = async () => {
        try {
            const response = await api.fetchNotes(searchQuery, perPage, page, 'archived');
            setTotalPages(Math.ceil(response.total / perPage) || 1);
            setNotes(response.data || []);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setIsLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = React.useCallback(() => {
        setRefreshing(true);
        fetchNotes();
    }, []);

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No tasks found</Text>

        </View>
    );

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <NoteSearch searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onRefresh={onRefresh}
            />

            <FlatList
                data={notes}
                renderItem={({ item }) => (
                    <NoteCard
                        item={item}
                        refreshNotes={onRefresh}
                    />
                )}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmptyList}
                ListFooterComponent={() => (
                    <View style={styles.paginationContainer}>
                        {totalPages > 1 && (
                            <>
                                <TouchableOpacity
                                    style={styles.paginationButton}
                                    onPress={() => {
                                        setPage(prevPage => {
                                            const newPage = prevPage - 1;
                                            setIsLoading(true);
                                            return newPage;
                                        });
                                    }}
                                    disabled={page === 1}
                                >
                                    <Text style={styles.paginationButtonText}>Prev</Text>
                                </TouchableOpacity>
                                <Text style={styles.paginationText}>{page}</Text>
                                <TouchableOpacity
                                    style={styles.paginationButton}
                                    onPress={() => {
                                        setPage(prevPage => {
                                            const newPage = prevPage + 1;
                                            setIsLoading(true);
                                            return newPage;
                                        });
                                    }}
                                    disabled={page === totalPages}
                                >
                                    <Text style={styles.paginationButtonText}>Next</Text>
                                </TouchableOpacity>
                            </>
                        )}

                    </View>
                )
                }
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#007AFF']}
                    />
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => setModalVisible(true)}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>

            <NoteCreateEditModal
                modalVisible={modalVisible}
                onClose={() => setModalVisible(false)}
                note={null}
                refreshNotes={onRefresh}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FD',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        flexGrow: 1,
        padding: 16,
    },
    categoryContainer: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        marginRight: 8,
    },
    categoryButtonActive: {
        backgroundColor: '#007AFF',
    },
    categoryButtonText: {
        fontSize: 14,
        color: '#666',
    },
    categoryButtonTextActive: {
        color: '#fff',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 16,
    },
    addButton: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#007AFF',
        borderRadius: 20,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    fab: {
        position: 'absolute',
        right: 16,
        bottom: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    fabText: {
        fontSize: 24,
        color: '#fff',
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    paginationButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F0F0F0',
        marginRight: 8,
    },
    paginationButtonText: {
        fontSize: 14,
        color: '#666',
    },
    paginationText: {
        fontSize: 14,
        color: '#666',
        marginRight: 8,
    },
});

export default ArchiveTab;
