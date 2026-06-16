import { View, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

interface ProgressBarProps {
  percentage: number;
  height?: number;
  color?: string;
}

export function ProgressBar({ percentage, height = 5, color }: ProgressBarProps) {
  const clampedFill = Math.min(percentage, 100);
  const barColor = color ?? (percentage >= 100 ? Colors.red : Colors.indigo);

  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.fill,
          { width: `${clampedFill}%`, backgroundColor: barColor, borderRadius: height / 2 },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: Colors.slate100,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    height: '100%',
  },
});
