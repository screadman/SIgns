import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Platform,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { spacing } from '../../constants/theme';
import type { PathNodeState } from '../../lib/learningPath';
import { PathNode } from './PathNode';

export type LearningPathItem = {
  id: string;
  state: PathNodeState;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  progressPercent?: number;
  accentColor?: string;
  stars?: number;
  bubbleLabel?: string | null;
  accessibilityLabel: string;
  onPress?: () => void;
};

export type LearningPathLayout = 'zigzag' | 'pairs';

type LearningPathProps = {
  items: LearningPathItem[];
  size?: 'md' | 'lg';
  /** Home course map uses zigzag; inside a unit uses pairs. */
  layout?: LearningPathLayout;
};

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

/**
 * Smooth Duolingo-like S-wave: center → left → farther left →
 * center → right → farther right → center…
 * Period of 6 nodes; amplitude is a fraction of screen width.
 */
function waveOffsetX(index: number, amplitude: number): number {
  return Math.sin((index * Math.PI) / 3) * amplitude;
}

/**
 * Learning islands without dotted connectors.
 * - zigzag: soft sine-wave path (Home modules)
 * - pairs: first centered, then two-by-two (inside a unit)
 */
export function LearningPath({
  items,
  size = 'lg',
  layout = 'zigzag',
}: LearningPathProps) {
  const { width } = useWindowDimensions();
  const currentIndex = items.findIndex((item) => item.state === 'current');
  const resolvedCurrent = currentIndex >= 0 ? currentIndex : 0;
  const prevCurrentRef = useRef(resolvedCurrent);
  const [activatingTo, setActivatingTo] = useState<number | null>(null);
  const nodePop = useRef(new Animated.Value(1)).current;

  // Keep the wave gentle (not a harsh zigzag).
  const waveAmplitude = Math.min(72, Math.max(44, width * 0.17));

  useEffect(() => {
    const previous = prevCurrentRef.current;
    if (resolvedCurrent > previous) {
      setActivatingTo(resolvedCurrent);
      nodePop.setValue(0.75);
      Animated.spring(nodePop, {
        toValue: 1,
        friction: 5,
        tension: 120,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start(() => {
        setActivatingTo(null);
        prevCurrentRef.current = resolvedCurrent;
      });
      return;
    }
    prevCurrentRef.current = resolvedCurrent;
    nodePop.setValue(1);
  }, [resolvedCurrent, nodePop]);

  function renderNode(
    item: LearningPathItem,
    index: number,
    slotStyle?: object,
  ) {
    const isActivating = activatingTo === index && item.state === 'current';
    return (
      <Animated.View
        key={item.id}
        style={[
          slotStyle ?? styles.nodeSlot,
          isActivating && { transform: [{ scale: nodePop }] },
        ]}
      >
        <PathNode
          state={item.state}
          label={item.label}
          icon={item.icon}
          progressPercent={item.progressPercent}
          accentColor={item.accentColor}
          stars={item.stars}
          bubbleLabel={item.bubbleLabel}
          onPress={item.onPress}
          accessibilityLabel={item.accessibilityLabel}
          size={size}
        />
      </Animated.View>
    );
  }

  if (layout === 'pairs') {
    const first = items[0];
    const rest = items.slice(1);
    const pairs: LearningPathItem[][] = [];
    for (let i = 0; i < rest.length; i += 2) {
      pairs.push(rest.slice(i, i + 2));
    }

    return (
      <View style={styles.track}>
        {first ? (
          <View style={styles.firstRow}>{renderNode(first, 0)}</View>
        ) : null}

        {pairs.map((pair, pairIndex) => (
          <View key={`pair-${pairIndex}`} style={styles.pairRow}>
            {pair.map((item, offset) => {
              const index = 1 + pairIndex * 2 + offset;
              return renderNode(item, index);
            })}
            {pair.length === 1 ? <View style={styles.nodeSlot} /> : null}
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.waveTrack}>
      {items.map((item, index) => {
        const offsetX = waveOffsetX(index, waveAmplitude);
        return (
          <View key={item.id} style={styles.waveRow}>
            {renderNode(item, index, [
              styles.waveSlot,
              { transform: [{ translateX: offsetX }] },
            ])}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    width: '100%',
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  firstRow: {
    width: '100%',
    alignItems: 'center',
  },
  pairRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.sm,
  },
  nodeSlot: {
    alignItems: 'center',
    minWidth: 148,
    flex: 1,
    overflow: 'visible',
  },
  waveTrack: {
    width: '100%',
    paddingTop: spacing.xs,
    paddingBottom: spacing.md,
    alignItems: 'center',
    overflow: 'visible',
  },
  waveRow: {
    width: '100%',
    alignItems: 'center',
    // Tight Duolingo-like vertical rhythm (about half a node).
    marginBottom: spacing['2sm'],
    overflow: 'visible',
  },
  waveSlot: {
    alignItems: 'center',
    overflow: 'visible',
  },
});
