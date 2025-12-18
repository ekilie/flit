import Toast from 'react-native-toast-message';

export const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  Toast.show({
    type,
    text1: message,
    position: 'bottom',
    visibilityTime: 3000,
    autoHide: true,
    bottomOffset: 60,
  });
};
