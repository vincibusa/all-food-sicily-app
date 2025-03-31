const tintColorLight = '#d83027'; // Rosso siciliano
const tintColorDark = '#ff6347';

export default {
  light: {
    text: '#000000',
    background: '#ffffff',
    tint: tintColorLight,
    tabIconDefault: '#cccccc',
    tabIconSelected: tintColorLight,
    border: '#eeeeee',
    card: '#f9f9f9',
    cardShadow: 'rgba(0, 0, 0, 0.1)',
    primary: tintColorLight,
    secondary: '#ffab40', // Arancione siciliano
    accent: '#4caf50',    // Verde per elementi naturali/cibo
  },
  dark: {
    text: '#ffffff',
    background: '#121212',
    tint: tintColorDark,
    tabIconDefault: '#666666',
    tabIconSelected: tintColorDark,
    border: '#333333',
    card: '#1e1e1e',
    cardShadow: 'rgba(0, 0, 0, 0.5)',
    primary: tintColorDark,
    secondary: '#ffcc80',
    accent: '#81c784',
  },
}; 