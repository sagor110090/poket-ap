import React, { useState } from 'react';

import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import NoteCreateEditModal from './NoteCreateEditModal';

const COLORS = {
    default: '#ffffff',
    red: '#ffcdd2',
    blue: '#bbdefb',
    green: '#c8e6c9',
    yellow: '#fff9c4',
    purple: '#e1bee7',
};





const NoteCard = ({ item, refreshNotes }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const handlePinNote = async () => {
        try {
            await api.pinNote(item.id, !item.is_pinned); // Toggle pin state
            refreshNotes(); // Call the refresh function
        } catch (error) {
            console.error('Error pinning note:', error);
        }
    };

    const handleArchiveNote = async () => {
        try {
            await api.archiveNote(item.id, !item.is_archived); // Toggle archive state
            refreshNotes(); // Call the refresh function
        } catch (error) {
            console.error('Error archiving note:', error);
        }
    };

    const handleDeleteNote = async () => {
        try {

            Alert.alert(
                'Delete Note',
                'Are you sure you want to delete this note?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: async () => {
                            try {
                                await api.deleteNote(item.id);
                                refreshNotes(); // Call the refresh function
                            } catch (error) {
                                console.error('Error deleting note:', error);
                            }
                        },
                    },
                ]
            );
        } catch (error) {
            console.error('Error deleting note:', error);
        }
    };

    const handleEditNote = () => {
        setModalVisible(true); // Show the modal
    };

    const closeModal = () => {
        setModalVisible(false); // Hide the modal
    };



    return (
        <TouchableOpacity
            style={[styles.noteCard, { backgroundColor: COLORS[item.color] }]}
            onPress={handleEditNote}
        >
            <View style={styles.noteHeader}>
                <Text style={styles.noteTitle}>{item.title.substring(0, 30)}</Text>
                <View style={styles.noteActions}>
                    <TouchableOpacity onPress={handlePinNote} style={styles.noteAction}>
                        <Ionicons
                            name={item.is_pinned ? 'pricetag' : 'pricetag-outline'}
                            size={24}
                            color="#666"
                        />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleArchiveNote} style={styles.noteAction}>
                        <Ionicons
                            name={item.is_archived ? 'archive' : 'archive-outline'}
                            size={24}
                            color="#666"
                        />
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={styles.noteContent} numberOfLines={3}>
                {item.content}
            </Text>
            <Text style={styles.noteDate}>{new Date(item.created_at).toLocaleDateString()} - {new Date(item.created_at).toLocaleTimeString()}</Text>

            <NoteCreateEditModal
                note={item}
                modalVisible={modalVisible}
                onClose={closeModal}
                refreshNotes={refreshNotes}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    noteCard: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
    },
    noteHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    noteTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    noteContent: {
        fontSize: 16,
        marginBottom: 8,
    },
    noteDate: {
        fontSize: 12,
        color: '#666',
    },
    noteActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    noteAction: {
        marginRight: 5,
    },
});

export default NoteCard;