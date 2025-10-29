import React from 'react'
import { View, StyleSheet, Dimensions } from 'react-native'
import ShimmerSkeleton from './ShimmerSkeleton'

const { width: screenWidth } = Dimensions.get('window')

const COLORS = {
  white: '#FFFFFF',
  background: '#F8F9FC',
  gray: '#9199B1',
}

const ProfileScreenSkeleton = () => {
  return (
    <View style={styles.container}>
      {/* Header Gradient Background */}
      <View style={styles.headerGradient} />

      {/* Profile Avatar Section */}
      <View style={styles.avatarSection}>
        {/* Avatar Circle */}
        <ShimmerSkeleton
          width={120}
          height={120}
          borderRadius={60}
          style={{ marginBottom: 16 }}
        />

        {/* User Name */}
        <ShimmerSkeleton
          width={screenWidth * 0.5}
          height={28}
          borderRadius={8}
          style={{ marginBottom: 8 }}
        />

        {/* User Subtitle */}
        <ShimmerSkeleton
          width={screenWidth * 0.6}
          height={16}
          borderRadius={6}
        />
      </View>

      {/* Health Summary Card */}
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <ShimmerSkeleton
            width={20}
            height={20}
            borderRadius={10}
            style={{ marginRight: 8 }}
          />
          <ShimmerSkeleton
            width={140}
            height={18}
            borderRadius={6}
          />
        </View>

        {/* Health Stats Row */}
        <View style={styles.healthStats}>
          {/* BMI Stat */}
          <View style={styles.statItem}>
            <ShimmerSkeleton
              width={40}
              height={24}
              borderRadius={6}
              style={{ marginBottom: 6 }}
            />
            <ShimmerSkeleton
              width={30}
              height={14}
              borderRadius={4}
              style={{ marginBottom: 4 }}
            />
            <ShimmerSkeleton
              width={60}
              height={12}
              borderRadius={4}
            />
          </View>

          <View style={styles.statDivider} />

          {/* Last Checkup Stat */}
          <View style={styles.statItem}>
            <ShimmerSkeleton
              width={50}
              height={24}
              borderRadius={6}
              style={{ marginBottom: 6 }}
            />
            <ShimmerSkeleton
              width={70}
              height={14}
              borderRadius={4}
            />
          </View>

          <View style={styles.statDivider} />

          {/* Records Stat */}
          <View style={styles.statItem}>
            <ShimmerSkeleton
              width={20}
              height={24}
              borderRadius={6}
              style={{ marginBottom: 6 }}
            />
            <ShimmerSkeleton
              width={50}
              height={14}
              borderRadius={4}
            />
          </View>
        </View>
      </View>

      {/* Personal Details Card */}
      <View style={[styles.card, styles.personalDetailsCard]}>
        {/* Card Header with Edit Button */}
        <View style={styles.cardHeaderWithButton}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ShimmerSkeleton
              width={40}
              height={40}
              borderRadius={12}
              style={{ marginRight: 12 }}
            />
            <ShimmerSkeleton
              width={130}
              height={18}
              borderRadius={6}
            />
          </View>
          <ShimmerSkeleton
            width={40}
            height={40}
            borderRadius={12}
          />
        </View>

        {/* Input Fields */}
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.fieldContainer}>
            <ShimmerSkeleton
              width={80}
              height={14}
              borderRadius={4}
              style={{ marginBottom: 8 }}
            />
            <ShimmerSkeleton
              width="100%"
              height={50}
              borderRadius={12}
            />
          </View>
        ))}

        {/* Weight and Height Row */}
        <View style={styles.fieldRow}>
          <View style={{ flex: 1 }}>
            <ShimmerSkeleton
              width={80}
              height={14}
              borderRadius={4}
              style={{ marginBottom: 8 }}
            />
            <ShimmerSkeleton
              width="100%"
              height={50}
              borderRadius={12}
            />
          </View>
          <View style={{ width: 16 }} />
          <View style={{ flex: 1 }}>
            <ShimmerSkeleton
              width={80}
              height={14}
              borderRadius={4}
              style={{ marginBottom: 8 }}
            />
            <ShimmerSkeleton
              width="100%"
              height={50}
              borderRadius={12}
            />
          </View>
        </View>
      </View>

      {/* Contact Details Card */}
      <View style={styles.card}>
        {/* Card Header with Edit Button */}
        <View style={styles.cardHeaderWithButton}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ShimmerSkeleton
              width={40}
              height={40}
              borderRadius={12}
              style={{ marginRight: 12 }}
            />
            <ShimmerSkeleton
              width={130}
              height={18}
              borderRadius={6}
            />
          </View>
          <ShimmerSkeleton
            width={40}
            height={40}
            borderRadius={12}
          />
        </View>

        {/* Input Fields */}
        {[1, 2, 3].map((item) => (
          <View key={item} style={styles.fieldContainer}>
            <ShimmerSkeleton
              width={60}
              height={14}
              borderRadius={4}
              style={{ marginBottom: 8 }}
            />
            <ShimmerSkeleton
              width="100%"
              height={50}
              borderRadius={12}
            />
          </View>
        ))}
      </View>

      {/* Settings Card */}
      <View style={styles.card}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <ShimmerSkeleton
            width={40}
            height={40}
            borderRadius={12}
            style={{ marginRight: 12 }}
          />
          <ShimmerSkeleton
            width={80}
            height={18}
            borderRadius={6}
          />
        </View>

        {/* Settings Items */}
        {[1, 2, 3, 4].map((item) => (
          <View key={item} style={styles.settingsItem}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <ShimmerSkeleton
                width={36}
                height={36}
                borderRadius={10}
                style={{ marginRight: 12 }}
              />
              <ShimmerSkeleton
                width={screenWidth * 0.4}
                height={16}
                borderRadius={6}
              />
            </View>
            <ShimmerSkeleton
              width={20}
              height={20}
              borderRadius={10}
            />
          </View>
        ))}
      </View>

      {/* Sign Out Button */}
      <View style={styles.signOutContainer}>
        <ShimmerSkeleton
          width={screenWidth - 32}
          height={54}
          borderRadius={16}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: '#E8EAEE',
  },
  avatarSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  personalDetailsCard: {
    borderWidth: 2,
    borderColor: '#E8EAEE',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardHeaderWithButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  healthStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.gray + '30',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldRow: {
    flexDirection: 'row',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray + '20',
  },
  signOutContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 40,
  },
})

export default ProfileScreenSkeleton
