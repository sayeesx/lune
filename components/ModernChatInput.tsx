import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons"
import React, { useState } from "react"
import { Dimensions, Platform, StyleSheet, TextInput, TouchableOpacity, View } from "react-native"

const { width: screenWidth } = Dimensions.get("window")

interface ModernChatInputProps {
  onSendMessage: (text: string) => void
  onUploadMedia?: () => void
  onVoicePress?: () => void
  placeholder?: string
  initialValue?: string
}

export const ModernChatInput = React.forwardRef<TextInput, ModernChatInputProps>(
  (
    {
      onSendMessage,
      onUploadMedia,
      onVoicePress,
      placeholder = "Message",
      initialValue = "",
    },
    ref
  ) => {
    const [inputText, setInputText] = useState<string>(initialValue)

    const handleSendMessage = () => {
      const trimmedText = inputText.trim()
      if (trimmedText) {
        onSendMessage(trimmedText)
        setInputText("")
      }
    }

    const renderInputContent = () => (
      <View style={styles.inputContentWrapper}>
        <TouchableOpacity style={styles.iconButton} onPress={onUploadMedia} activeOpacity={0.7}>
          <MaterialCommunityIcons name="paperclip" size={20} color="#8E8EA0" />
        </TouchableOpacity>

        <TextInput
          ref={ref}
          style={styles.textInput}
          placeholder={placeholder}
          placeholderTextColor="#8E8EA0"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSendMessage}
          multiline={true}
          maxLength={2000}
          returnKeyType="send"
          blurOnSubmit={true}
        />

        {inputText.trim() ? (
          <TouchableOpacity
            style={styles.sendButton}
            onPress={handleSendMessage}
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons name="arrow-up" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.iconButton} onPress={onVoicePress} activeOpacity={0.7}>
            <MaterialCommunityIcons name="microphone" size={20} color="#8E8EA0" />
          </TouchableOpacity>
        )}
      </View>
    )

    return (
      <View style={styles.container}>
          {renderInputContent()}
      </View>
    )
  }
)

ModernChatInput.displayName = "ModernChatInput"

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 28 : 12,
    borderTopWidth: 1,
    borderTopColor: "#E8EAEE",
  },
  inputContentWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#F5F6FA",
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
    borderWidth: 1,
    borderColor: "#E8EAEE",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: "#100F15",
    paddingVertical: 8,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#2652F9",
    alignItems: "center",
    justifyContent: "center",
  },
})
