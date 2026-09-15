import { ChartWheel, type ChartWheelProps } from './ChartWheel'

export type PremiumChartWheelProps = Omit<ChartWheelProps, 'zodiac' | 'ticks'>

/**
 * The chart as the product's signature object: the same wheel with its zodiac
 * band and degree scale switched on.
 *
 * A preset rather than a second implementation — there is one piece of chart
 * geometry in CYKLOS, and every screen that shows a chart shows that one.
 */
export function PremiumChartWheel(props: PremiumChartWheelProps) {
  return <ChartWheel {...props} zodiac ticks />
}
