import Toast from 'react-native-toast-message';


export const showToast = {
  success: (title: string, message?: string) => {
    Toast.show({
      type: 'success',
      text1: title,
      text2: message,
      position: 'bottom',
      visibilityTime: 3000,
      autoHide: true,
      bottomOffset: 40,
      props: {
        backgroundColor: '#10b981', // Bright green
        textColor: '#ffffff',
      },
    });
  },
  error: (title: string, message?: string) => {
    Toast.show({
      type: 'error',
      text1: title,
      text2: message,
      position: 'bottom',
      visibilityTime: 3000,
      autoHide: true,
      bottomOffset: 40,
      props: {
        backgroundColor: '#ef4444', // Bright red
        textColor: '#ffffff',
      },
    });
  },
  warning: (title: string, message?: string) => {
    Toast.show({
      type: 'warning',
      text1: title,
      text2: message,
      position: 'bottom',
      visibilityTime: 3000,
      autoHide: true,
      bottomOffset: 40,
      props: {
        backgroundColor: '#f59e0b', // Dark yellow
        textColor: '#ffffff',
      },
    });
  },
};