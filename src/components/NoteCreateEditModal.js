import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ScrollView, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import api from '../services/api';

const COLORS = {
    default: '#ffffff',
    red: '#ffcdd2',
    blue: '#bbdefb',
    green: '#c8e6c9',
    yellow: '#fff9c4',
    purple: '#e1bee7',
};

const NoteCreateEditModal = ({ modalVisible, onClose, note, refreshNotes }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedColor, setSelectedColor] = useState('default');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        if (note) {
            setTitle(note.title || '');
            setContent(note.content || '');
            setSelectedColor(note.color || 'default');
        }
        setIsEditing(note?.id ? false : true);
    }, [note]);

    const handleSaveNote = async () => {
        console.log('Saving note:', { title, content, selectedColor });
        if (!title.trim() || !content.trim()) {
            Alert.alert('Validation Error', 'Title and content cannot be empty.');
            return;
        }

        try {
            const noteData = {
                title,
                content,
                color: selectedColor,
            };
            if (note?.id) {
                await api.updateNote(note.id, noteData);
            } else {
                await api.createNote(noteData);
            }
            refreshNotes();
            onClose();
        } catch (error) {
            console.error('Error saving note:', error);
            Alert.alert('Error', 'There was an error saving your note. Please try again.');
        }
    };

    const handleDeleteNote = async () => {
        Alert.alert(
            'Delete Note',
            'Are you sure you want to delete this note?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    onPress: async () => {
                        try {
                            await api.deleteNote(note.id);
                            refreshNotes();
                            onClose();
                        } catch (error) {
                            console.error('Error deleting note:', error);
                            Alert.alert('Error', 'There was an error deleting your note. Please try again.');
                        }
                    },
                },
            ],
            { cancelable: false }
        );
    };

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>
                            {note?.id ? 'Edit Note' : 'Create Note'}
                        </Text>
                        <TouchableOpacity onPress={onClose}>
                            <Icon name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView>
                        {isEditing ? (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Note title"
                                    value={title}
                                    onChangeText={setTitle}
                                />
                                <TextInput
                                    style={styles.contentInput}
                                    placeholder="Note content"
                                    value={content}
                                    onChangeText={setContent}
                                    multiline
                                    textAlignVertical="top"
                                />
                            </>
                        ) : (
                            <>
                                <Text style={styles.titleText}>{title}</Text>
                                <Text style={styles.contentText}>{content}</Text>
                            </>
                        )}

                        <View style={styles.colorPicker}>
                            {Object.entries(COLORS).map(([key, color]) => (
                                <TouchableOpacity
                                    key={key}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        selectedColor === key && styles.selectedColor,
                                    ]}
                                    onPress={() => setSelectedColor(key)}
                                />
                            ))}
                        </View>

                        <TouchableOpacity
                            style={styles.saveButton}
                            onPress={isEditing ? handleSaveNote : () => setIsEditing(true)}
                        >
                            <Text style={styles.saveButtonText}>{isEditing ? 'Save Note' : 'Edit Note'}</Text>
                        </TouchableOpacity>

                        {note?.id && ( // Show delete button only if note exists
                            <TouchableOpacity
                                style={[styles.saveButton, { backgroundColor: 'red' }]}
                                onPress={handleDeleteNote}
                            >
                                <Text style={styles.saveButtonText}>Delete Note</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        padding: 16,
        maxHeight: '90%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    contentInput: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
        height: 200,
    },
    colorPicker: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 16,
    },
    colorOption: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    selectedColor: {
        borderWidth: 2,
        borderColor: '#007AFF',
    },
    saveButton: {
        backgroundColor: '#007AFF',
        borderRadius: 8,
        padding: 16,
        alignItems: 'center',
        marginBottom: 16,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    titleText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    contentText: {
        fontSize: 16,
        marginBottom: 16,
    },
});

export default NoteCreateEditModal;