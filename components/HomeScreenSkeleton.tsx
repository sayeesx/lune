import React from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import ShimmerSkeleton from './ShimmerSkeleton'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

const HomeScreenSkeleton = () => {
  const insets = useSafeAreaInsets()

  // Use the same calculations as the actual home screen
  const avatarSize = Math.max(48, screenWidth * 0.12)
  const featureCardWidth = (screenWidth - 32 - 16 - 8) / 2
  const featureCardPadding = Math.max(16, screenWidth * 0.04)

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        {/* Profile, Premium, and Notification Buttons */}
        <View style={styles.profileSection}>
          {/* Profile Avatar - exact same size as actual */}
          <ShimmerSkeleton
            width={avatarSize}
            height={avatarSize}
            borderRadius={avatarSize / 2}
          />

          <View style={{ flex: 1 }} />

          {/* Try Premium Button - responsive width */}
          <ShimmerSkeleton
            width={110}
            height={screenHeight * 0.01 * 2 + 24}
            borderRadius={20}
            style={{ marginRight: 8 }}
          />

          {/* Notification Button */}
          <ShimmerSkeleton
            width={40}
            height={40}
            borderRadius={20}
          />
        </View>

        {/* Greeting Section */}
        <View style={styles.greetingSection}>
          {/* Greeting Text - responsive */}
          <ShimmerSkeleton
            width={screenWidth * 0.5}
            height={40}
            borderRadius={8}
            style={{ marginBottom: 4 }}
          />

          {/* Tagline - responsive */}
          <ShimmerSkeleton
            width={screenWidth * 0.7}
            height={screenWidth * 0.04 * 1.5}
            borderRadius={6}
          />
        </View>
      </View>

      {/* Feature Cards Grid */}
      <View style={styles.featuresSection}>
        <View style={styles.featuresGrid}>
          {[1, 2, 3, 4].map((item) => (
            <View 
              key={item} 
              style={[
                styles.featureCard,
                {
                  width: featureCardWidth,
                  padding: featureCardPadding,
                  marginBottom: Math.max(16, screenHeight * 0.02),
                }
              ]}
            >
              {/* Card Header with Icon and Arrow */}
              <View style={styles.cardHeader}>
                <ShimmerSkeleton
                  width={40}
                  height={40}
                  borderRadius={12}
                />
                <ShimmerSkeleton
                  width={24}
                  height={24}
                  borderRadius={12}
                />
              </View>

              {/* Card Title - responsive */}
              <ShimmerSkeleton
                width={featureCardWidth * 0.8}
                height={screenWidth * 0.04 * 1.2}
                borderRadius={6}
                style={{ marginBottom: 8 }}
              />

              {/* Card Description - two lines */}
              <ShimmerSkeleton
                width={featureCardWidth - featureCardPadding * 2}
                height={screenWidth * 0.032 * 1.2}
                borderRadius={6}
                style={{ marginBottom: 4 }}
              />
              <ShimmerSkeleton
                width={(featureCardWidth - featureCardPadding * 2) * 0.7}
                height={screenWidth * 0.032 * 1.2}
                borderRadius={6}
              />
            </View>
          ))}
        </View>
      </View>

      {/* Ask Lune AI Section */}
      <View style={styles.chatHistorySection}>
        {/* Section Title - responsive */}
        <ShimmerSkeleton
          width={screenWidth * 0.3}
          height={screenWidth * 0.045 * 1.3}
          borderRadius={8}
          style={{ marginBottom: 16 }}
        />

        {/* Suggestion Pills - exact same width calculation */}
        <View style={styles.chatPillsRow}>
          {[1, 2].map((item) => (
            <ShimmerSkeleton
              key={item}
              width={(screenWidth * 0.88 - 12) / 2}
              height={56}
              borderRadius={20}
            />
          ))}
        </View>

        {/* Chat with Lune AI Button - exact same width */}
        <ShimmerSkeleton
          width={screenWidth * 0.88}
          height={52}
          borderRadius={16}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: screenWidth * 0.06,
    paddingBottom: screenHeight * 0.03,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: screenHeight * 0.03,
  },
  greetingSection: {
    marginBottom: screenHeight * 0.01,
  },
  featuresSection: {
    marginBottom: screenHeight * 0.04,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E8EAEE',
    marginHorizontal: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  chatHistorySection: {
    paddingHorizontal: screenWidth * 0.06,
  },
  chatPillsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
})

export default HomeScreenSkeleton
