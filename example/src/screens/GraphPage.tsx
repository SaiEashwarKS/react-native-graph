import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { View, StyleSheet, Text, Button, ScrollView } from 'react-native'
import { LineGraph } from 'react-native-graph'
import {
  interpolateColor,
  useDerivedValue,
  withTiming,
} from 'react-native-reanimated'
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets'
import type { GraphRange } from '../../../src/LineGraphProps'
import { SelectionDot } from '../components/CustomSelectionDot'
import { Toggle } from '../components/Toggle'
import {
  generateRandomGraphData,
  generateSinusGraphData,
} from '../data/GraphData'
import { useColors } from '../hooks/useColors'
import { hapticFeedback } from '../utils/HapticFeedback'

import { lineData, lineData2 } from './lineData'

const POINT_COUNT = 70
const POINTS = generateRandomGraphData(POINT_COUNT)
const COLOR = '#6a7ee7'
const GRADIENT_FILL_COLORS = ['#7476df5D', '#7476df4D', '#7476df00']
const SMALL_POINTS = generateSinusGraphData(9)

// const newLineData = lineData.map((point) => {
//   return { value: point[1], date: new Date(point[0]) }
// })

const halfLineData = lineData.slice(0, 195).map((point) => {
  return { value: point[1]!, date: new Date(point[0]) }
})
const halfNullData = lineData
  .slice(195)
  .map((point) => ({ value: null, date: new Date(point[0]) }))

const newLineData = [...halfLineData, ...halfNullData]

const formattedLineData = lineData.map((point) => ({
  value: point[1],
  date: new Date(point[0]),
}))

// const newLineData = [
//   ...formattedLineData,
//   ...Array(390 - formattedLineData.length)
//     .fill(undefined)
//     .map((_p, index) => ({
//       value: null,
//       date: new Date(
//         formattedLineData[0].date.getTime() +
//           (formattedLineData.length + index) * 60 * 1000
//       ),
//     })),
// ]

// const newLineData: { date: Date; value: number | null }[] = Array<number>(100)
//   .fill(0)
//   .map((_, index) => ({
//     date: new Date(
//       new Date(2000, 0, 1).getTime() + 1000 * 60 * 60 * 24 * index
//     ),
//     value: Math.random(),
//     // value: null,
//   }))

export function GraphPage() {
  const colors = useColors()

  const [isAnimated, setIsAnimated] = useState(true)
  const [enablePanGesture, setEnablePanGesture] = useState(true)
  const [enableFadeInEffect, setEnableFadeInEffect] = useState(false)
  const [enableCustomSelectionDot, setEnableCustomSelectionDot] =
    useState(false)
  const [enableGradient, setEnableGradient] = useState(true)
  const [enableRange, setEnableRange] = useState(false)
  const [enableIndicator, setEnableIndicator] = useState(true)
  const [indicatorPulsating, setIndicatorPulsating] = useState(true)

  const [points, setPoints] = useState(newLineData)

  const refreshData = useCallback(() => {
    // setPoints(
    //   Array<number>(100)
    //     .fill(0)
    //     .map((_, index) => ({
    //       date: new Date(
    //         new Date(2000, 0, 1).getTime() + 1000 * 60 * 60 * 24 * index
    //       ),
    //       value: Math.random(),
    //     }))
    // )
    // hapticFeedback('impactLight')
  }, [])

  const timer = useRef<ReturnType<typeof setInterval> | null>(null)

  const indexRef = useRef(195)

  const updateData = (
    index: number,
    { date, value }: { date: Date; value: number }
  ) => {
    setPoints((prev) => [
      ...prev.slice(0, index),
      { value, date },
      ...prev.slice(index + 1),
    ])
    // newLineDataRef.current = updatedData;
  }

  useEffect(() => {
    if (!timer.current && newLineData.length && lineData) {
      timer.current = setInterval(() => {
        // setPoints((prev) => {
        //   if (indexRef.current >= newLineData.length) {
        //     return prev
        //   }
        //   // const val = 183 + 2 * Math.random()
        //   // return [
        //   //   ...prev.slice(0, indexRef.current),
        //   //   {
        //   //     date: prev[indexRef.current]?.date,
        //   //     // value: lineData[indexRef.current][1],
        //   //     value: val,
        //   //   },
        //   //   ...prev.slice(indexRef.current + 1),
        //   // ]
        //   // return [
        //   //   ...prev.slice(0, 303),
        //   //   {
        //   //     date: prev[303]?.date,
        //   //     // value: lineData[303][1],
        //   //     value: val,
        //   //   },
        //   //   // ...prev.slice(303 + 1),
        //   // ]
        //   // return [
        //   //   ...prev,
        //   //   {
        //   //     date: new Date(prev[prev.length - 1]?.date.getTime() + 60 * 1000),
        //   //     value: val,
        //   //   },
        //   // ]
        // })
        const data = formattedLineData[indexRef.current]

        if (!data?.value) {
          return
        }
        updateData(indexRef.current, {
          date: data.date,
          value: data.value,
        })
        indexRef.current += 1
      }, 1000)
    }
  }, [])

  useEffect(() => {
    return () => {
      timer.current && clearInterval(timer.current)
    }
  }, [])

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.row}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          react-native-graph
        </Text>
        {/* <LineGraph
          style={styles.miniGraph}
          animated={false}
          color={colors.foreground}
          points={SMALL_POINTS}
        /> */}
      </View>

      <View style={styles.spacer} />

      <ScrollView
        style={styles.controlsScrollView}
        contentContainerStyle={styles.controlsScrollViewContent}
      >
        <LineGraph
          // baseLineY={157.4}
          style={styles.graph}
          animated={isAnimated}
          color={COLOR}
          points={points}
          gradientFillColors={enableGradient ? GRADIENT_FILL_COLORS : undefined}
          enablePanGesture={enablePanGesture}
          enableFadeInMask={enableFadeInEffect}
          onGestureStart={() => hapticFeedback('impactLight')}
          SelectionDot={enableCustomSelectionDot ? SelectionDot : undefined}
          enableIndicator={enableIndicator}
          horizontalPadding={enableIndicator ? 15 : 0}
          indicatorPulsating={indicatorPulsating}
          panGestureDelay={0}
        />

        <Button title="Refresh" onPress={refreshData} />
        <Toggle
          title="Animated:"
          isEnabled={isAnimated}
          setIsEnabled={setIsAnimated}
        />
        <Toggle
          title="Enable Gesture:"
          isEnabled={enablePanGesture}
          setIsEnabled={setEnablePanGesture}
        />
        <Toggle
          title="Enable Fade-in effect:"
          isEnabled={enableFadeInEffect}
          setIsEnabled={setEnableFadeInEffect}
        />
        <Toggle
          title="Custom Selection Dot:"
          isEnabled={enableCustomSelectionDot}
          setIsEnabled={setEnableCustomSelectionDot}
        />
        <Toggle
          title="Enable Gradient:"
          isEnabled={enableGradient}
          setIsEnabled={setEnableGradient}
        />
        <Toggle
          title="Enable Range:"
          isEnabled={enableRange}
          setIsEnabled={setEnableRange}
        />
        <Toggle
          title="Enable Indicator:"
          isEnabled={enableIndicator}
          setIsEnabled={setEnableIndicator}
        />
        <Toggle
          title="Indicator pulsating:"
          isEnabled={indicatorPulsating}
          setIsEnabled={setIndicatorPulsating}
        />
      </ScrollView>

      <View style={styles.spacer} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StaticSafeAreaInsets.safeAreaInsetsTop + 15,
    paddingBottom: StaticSafeAreaInsets.safeAreaInsetsBottom + 15,
  },
  spacer: {
    flexGrow: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    paddingHorizontal: 15,
  },
  graph: {
    alignSelf: 'center',
    width: '100%',
    aspectRatio: 1.7,
    marginVertical: 20,
  },
  miniGraph: {
    width: 40,
    height: 35,
    marginLeft: 5,
  },
  controlsScrollView: {
    flexGrow: 1,
    paddingHorizontal: 15,
  },
  controlsScrollViewContent: {
    justifyContent: 'center',
  },
})
