import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  FlatList,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAddressAutocomplete } from '@/lib/maps/hooks/useGoogleMaps';
import { PlacePrediction, Coordinates } from '@/lib/maps/types';
import { useCurrentTheme } from '@/context/CentralTheme';

interface AddressAutocompleteProps {
  value: string;
  onChangeText: (text: string) => void;
  onSelectPlace: (prediction: PlacePrediction) => void;
  placeholder?: string;
  currentLocation?: Coordinates;
  icon?: string;
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChangeText,
  onSelectPlace,
  placeholder = 'Search address...',
  currentLocation,
  icon = 'location-outline',
}) => {
  const theme = useCurrentTheme();
  const [showPredictions, setShowPredictions] = useState(false);
  const { predictions, isLoading, searchAddress, clearPredictions } =
    useAddressAutocomplete(currentLocation);

  useEffect(() => {
    if (value.length >= 2) {
      searchAddress(value);
      setShowPredictions(true);
    } else {
      clearPredictions();
      setShowPredictions(false);
    }
  }, [value]);

  const handleSelectPrediction = (prediction: PlacePrediction) => {
    onSelectPlace(prediction);
    setShowPredictions(false);
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputContainer,
          { backgroundColor: theme.cardBackground, borderColor: theme.border },
        ]}
      >
        <View
          style={[styles.iconContainer, { backgroundColor: `${theme.primary}15` }]}
        >
          <Ionicons name={icon as any} size={20} color={theme.primary} />
        </View>
        <TextInput
          style={[styles.input, { color: theme.text }]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.subtleText}
        />
        {isLoading && <ActivityIndicator size="small" color={theme.primary} />}
      </View>

      {showPredictions && predictions.length > 0 && (
        <View
          style={[
            styles.predictionsContainer,
            { backgroundColor: theme.cardBackground, borderColor: theme.border },
          ]}
        >
          <FlatList
            data={predictions}
            keyExtractor={(item) => item.placeId}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.predictionItem,
                  {
                    backgroundColor: pressed
                      ? `${theme.primary}10`
                      : theme.cardBackground,
                  },
                ]}
                onPress={() => handleSelectPrediction(item)}
              >
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={theme.mutedText}
                  style={styles.predictionIcon}
                />
                <View style={styles.predictionText}>
                  <Text style={[styles.mainText, { color: theme.text }]}>
                    {item.mainText}
                  </Text>
                  <Text style={[styles.secondaryText, { color: theme.subtleText }]}>
                    {item.secondaryText}
                  </Text>
                </View>
              </Pressable>
            )}
            style={styles.predictionsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    fontSize: 16,
  },
  predictionsContainer: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    maxHeight: 300,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  predictionsList: {
    maxHeight: 300,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e0e0e0',
  },
  predictionIcon: {
    marginRight: 12,
  },
  predictionText: {
    flex: 1,
  },
  mainText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  secondaryText: {
    fontSize: 14,
  },
});

