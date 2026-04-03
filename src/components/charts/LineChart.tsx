import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { makeStyles, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import { useTheme } from '../../context/ThemeContext';
import { useT } from '../../i18n';

export interface DataPoint {
  date: string; // ISO date string
  value: number;
  label?: string; // optional display label for x-axis
}

interface LineChartProps {
  data: DataPoint[];
  width: number;
  height?: number;
  lineColor?: string;
  fillColor?: string;
  unit?: string;
  formatValue?: (value: number) => string;
  title?: string;
  emptyMessage?: string;
}

const PADDING_LEFT = 45;
const PADDING_RIGHT = 16;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 28;

export function LineChart({
  data,
  width,
  height = 200,
  lineColor: lineColorProp,
  fillColor,
  unit = '',
  formatValue = (v) => v.toFixed(1),
  title,
  emptyMessage,
}: LineChartProps) {
  const { colors } = useTheme();
  const styles = useStyles();
  const { t } = useT();
  const lineColor = lineColorProp ?? colors.primary;
  const resolvedEmptyMessage = emptyMessage ?? t('chartNoData');
  const chartWidth = width - PADDING_LEFT - PADDING_RIGHT;
  const chartHeight = height - PADDING_TOP - PADDING_BOTTOM;

  const { path, fillPath, points, yLabels, minVal, maxVal } = useMemo(() => {
    if (data.length < 2) {
      return { path: '', fillPath: '', points: [], yLabels: [], minVal: 0, maxVal: 0 };
    }

    const values = data.map((d) => d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Add padding to range
    const range = max - min || 1;
    const padding = range * 0.1;
    const yMin = min - padding;
    const yMax = max + padding;
    const yRange = yMax - yMin;

    // Map data points to SVG coordinates
    const pts = data.map((d, i) => {
      const x = PADDING_LEFT + (i / (data.length - 1)) * chartWidth;
      const y = PADDING_TOP + chartHeight - ((d.value - yMin) / yRange) * chartHeight;
      return { x, y, ...d };
    });

    // Build SVG path with smooth curves
    let pathD = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const prev = pts[i - 1];
      const curr = pts[i];
      const cpx = (prev.x + curr.x) / 2;
      pathD += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }

    // Fill path (area under curve)
    const fillD =
      pathD +
      ` L ${pts[pts.length - 1].x} ${PADDING_TOP + chartHeight}` +
      ` L ${pts[0].x} ${PADDING_TOP + chartHeight} Z`;

    // Y-axis labels (3-5 ticks)
    const tickCount = 4;
    const yLbls = [];
    for (let i = 0; i <= tickCount; i++) {
      const val = yMin + (yRange / tickCount) * i;
      const y = PADDING_TOP + chartHeight - (i / tickCount) * chartHeight;
      yLbls.push({ value: val, y });
    }

    return {
      path: pathD,
      fillPath: fillD,
      points: pts,
      yLabels: yLbls,
      minVal: yMin,
      maxVal: yMax,
    };
  }, [data, chartWidth, chartHeight]);

  if (data.length < 2) {
    return (
      <View style={[styles.container, { width }]}>
        {title && <Text style={styles.title}>{title}</Text>}
        <View style={[styles.emptyContainer, { height }]}>
          <Text style={styles.emptyText}>{resolvedEmptyMessage}</Text>
          <Text style={styles.emptySubtext}>
            {t('chartMinEntries')}
          </Text>
        </View>
      </View>
    );
  }

  const lastPoint = points[points.length - 1];
  const firstPoint = points[0];
  const trend = lastPoint.value - firstPoint.value;
  const defaultFill = fillColor || (lineColor + '15');

  return (
    <View style={[styles.container, { width }]}>
      {title && (
        <View style={styles.headerRow}>
          <Text style={styles.title}>{title}</Text>
          <View style={styles.trendContainer}>
            <Text
              style={[
                styles.trendText,
                { color: trend >= 0 ? colors.success : colors.error },
              ]}
            >
              {trend >= 0 ? '+' : ''}
              {formatValue(trend)}
              {unit}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.currentValueRow}>
        <Text style={[styles.currentValue, { color: lineColor }]}>
          {formatValue(lastPoint.value)}
        </Text>
        <Text style={styles.currentUnit}>{unit}</Text>
      </View>

      <Svg width={width} height={height}>
        {/* Horizontal grid lines */}
        {yLabels.map((label, i) => (
          <React.Fragment key={i}>
            <Line
              x1={PADDING_LEFT}
              y1={label.y}
              x2={width - PADDING_RIGHT}
              y2={label.y}
              stroke={colors.border}
              strokeWidth={1}
              strokeDasharray="4,4"
            />
            <SvgText
              x={PADDING_LEFT - 8}
              y={label.y + 4}
              fontSize={9}
              fill={colors.textMuted}
              textAnchor="end"
              fontFamily={fonts.data}
            >
              {formatValue(label.value)}
            </SvgText>
          </React.Fragment>
        ))}

        {/* Area fill */}
        <Path d={fillPath} fill={defaultFill} />

        {/* Line */}
        <Path
          d={path}
          fill="none"
          stroke={lineColor}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {points.map((pt, i) => {
          // Only show first, last, and every Nth point to avoid clutter
          const showDot =
            i === 0 || i === points.length - 1 || points.length <= 10;
          if (!showDot) return null;
          return (
            <Circle
              key={i}
              cx={pt.x}
              cy={pt.y}
              r={i === points.length - 1 ? 5 : 3}
              fill={i === points.length - 1 ? lineColor : colors.surface}
              stroke={lineColor}
              strokeWidth={2}
            />
          );
        })}

        {/* X-axis labels (first and last) */}
        <SvgText
          x={PADDING_LEFT}
          y={height - 4}
          fontSize={9}
          fill={colors.textMuted}
          textAnchor="start"
          fontFamily={fonts.data}
        >
          {formatDate(data[0].date)}
        </SvgText>
        <SvgText
          x={width - PADDING_RIGHT}
          y={height - 4}
          fontSize={9}
          fill={colors.textMuted}
          textAnchor="end"
          fontFamily={fonts.data}
        >
          {formatDate(data[data.length - 1].date)}
        </SvgText>
      </Svg>
    </View>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day = d.getDate();
  const months = ['jan', 'fev', 'mar', 'avr', 'mai', 'jun', 'jul', 'aou', 'sep', 'oct', 'nov', 'dec'];
  return `${day} ${months[d.getMonth()]}`;
}

const useStyles = makeStyles((colors) => ({
  container: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.text,
  },
  trendContainer: {
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  trendText: {
    fontFamily: fonts.data,
    fontSize: fontSizes.xs,
    fontWeight: '700',
  },
  currentValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  currentValue: {
    fontFamily: fonts.data,
    fontSize: fontSizes['2xl'],
    fontWeight: '700',
  },
  currentUnit: {
    fontFamily: fonts.body,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: fontSizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontFamily: fonts.body,
    fontSize: fontSizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
}));
