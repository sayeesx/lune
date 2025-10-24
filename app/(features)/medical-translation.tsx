import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function MedicalTranslationScreen() {
  const insets = useSafeAreaInsets();
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  const medicalTerms = [
    { term: 'Hypertension', translation: 'High blood pressure' },
    { term: 'Myocardial Infarction', translation: 'Heart attack' },
    { term: 'Diabetes Mellitus', translation: 'Diabetes (high blood sugar)' },
    { term: 'Pneumonia', translation: 'Lung infection' },
    { term: 'Arthritis', translation: 'Joint inflammation' },
    { term: 'Bronchitis', translation: 'Airway inflammation' },
    { term: 'Gastritis', translation: 'Stomach lining inflammation' },
    { term: 'Dermatitis', translation: 'Skin inflammation' },
    { term: 'Osteoporosis', translation: 'Bone weakening condition' },
    { term: 'Hyperthyroidism', translation: 'Overactive thyroid gland' }
  ];

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    
    setIsTranslating(true);
    
    // Simulate translation delay
    setTimeout(() => {
      // Simple translation logic - in real app, this would call an AI service
      const found = medicalTerms.find(item => 
        item.term.toLowerCase().includes(inputText.toLowerCase()) ||
        item.translation.toLowerCase().includes(inputText.toLowerCase())
      );
      
      if (found) {
        if (inputText.toLowerCase().includes(found.term.toLowerCase())) {
          setTranslatedText(found.translation);
        } else {
          setTranslatedText(found.term);
        }
      } else {
        setTranslatedText('Medical term not found. Please try a different term or consult with a healthcare professional.');
      }
      
      setIsTranslating(false);
    }, 1500);
  };

  const handleTermPress = (term: string, translation: string) => {
    setInputText(term);
    setTranslatedText(translation);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Medical Translation</Text>
          <View style={styles.placeholder} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Translation Input */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionTitle}>Translate Medical Terms</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Enter medical term or description..."
              placeholderTextColor="#999"
              value={inputText}
              onChangeText={setInputText}
              multiline
              numberOfLines={3}
            />
            <TouchableOpacity 
              style={[styles.translateButton, isTranslating && styles.translateButtonDisabled]}
              onPress={handleTranslate}
              disabled={isTranslating || !inputText.trim()}
            >
              <MaterialCommunityIcons 
                name={isTranslating ? "loading" : "translate"} 
                size={20} 
                color="#FFF" 
              />
              <Text style={styles.translateButtonText}>
                {isTranslating ? 'Translating...' : 'Translate'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Translation Result */}
          {translatedText && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Translation:</Text>
              <Text style={styles.resultText}>{translatedText}</Text>
            </View>
          )}
        </View>

        {/* Common Terms */}
        <View style={styles.termsSection}>
          <Text style={styles.sectionTitle}>Common Medical Terms</Text>
          <View style={styles.termsList}>
            {medicalTerms.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.termItem}
                onPress={() => handleTermPress(item.term, item.translation)}
                activeOpacity={0.7}
              >
                <View style={styles.termContent}>
                  <Text style={styles.termText}>{item.term}</Text>
                  <Text style={styles.translationText}>{item.translation}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <MaterialCommunityIcons name="information" size={24} color="#007AFF" />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Important Note</Text>
              <Text style={styles.infoText}>
                This translation tool is for educational purposes only. 
                Always consult with a healthcare professional for accurate medical advice.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: screenWidth * 0.06,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: screenWidth * 0.05,
    fontFamily: 'Inter-Bold',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: screenWidth * 0.06,
  },
  inputSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: screenWidth * 0.05,
    fontFamily: 'Inter-Bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 16,
  },
  textInput: {
    fontSize: screenWidth * 0.04,
    fontFamily: 'Inter-Regular',
    color: '#1A1A1A',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  translateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  translateButtonDisabled: {
    backgroundColor: '#CCC',
  },
  translateButtonText: {
    color: '#FFF',
    fontSize: screenWidth * 0.04,
    fontFamily: 'Inter-SemiBold',
  },
  resultContainer: {
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  resultTitle: {
    fontSize: screenWidth * 0.04,
    fontFamily: 'Inter-SemiBold',
    color: '#10B981',
    marginBottom: 8,
  },
  resultText: {
    fontSize: screenWidth * 0.04,
    fontFamily: 'Inter-Regular',
    color: '#1A1A1A',
    lineHeight: 22,
  },
  termsSection: {
    marginBottom: 30,
  },
  termsList: {
    gap: 12,
  },
  termItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  termContent: {
    flex: 1,
  },
  termText: {
    fontSize: screenWidth * 0.04,
    fontFamily: 'Inter-SemiBold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  translationText: {
    fontSize: screenWidth * 0.035,
    fontFamily: 'Inter-Regular',
    color: '#666',
    lineHeight: 20,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: screenWidth * 0.04,
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
    marginBottom: 4,
  },
  infoText: {
    fontSize: screenWidth * 0.035,
    fontFamily: 'Inter-Regular',
    color: '#1A1A1A',
    lineHeight: 20,
  },
});
