<template>
  <div class="trend-chart surface-card" v-loading="loading">
    <div class="chart-header">
      <div class="chart-titles">
        <h3>{{ title }}</h3>
        <p v-if="subtitle">{{ subtitle }}</p>
      </div>
      <div class="chart-actions">
        <slot name="actions" />
      </div>
    </div>

    <div v-if="meta" class="chart-meta">
      <slot name="meta">{{ meta }}</slot>
    </div>

    <div class="chart-container">
      <v-chart
        :option="normalizedOption"
        :autoresize="true"
        :style="{ height: `${height}px` }"
        :update-options="{ notMerge: false, lazyUpdate: true }"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  ToolboxComponent,
  VisualMapComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { deepMerge } from '@/utils/object'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  ToolboxComponent,
  VisualMapComponent,
])

const palette = ['#6366f1', '#22c55e', '#f97316', '#0ea5e9', '#f43f5e', '#8b5cf6']

const props = defineProps({
  title: { type: String, default: '指标趋势' },
  subtitle: { type: String, default: '' },
  meta: { type: String, default: '' },
  options: { type: Object, default: () => ({}) },
  height: { type: Number, default: 300 },
  loading: { type: Boolean, default: false },
})

const normalizedOption = computed(() => {
  const baseOption = {
    color: palette,
    grid: {
      left: '3%',
      right: '3%',
      top: 50,
      bottom: 24,
      containLabel: true,
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#94a3b8',
        },
      },
    },
    legend: {
      top: 10,
      right: 16,
      icon: 'roundRect',
      textStyle: {
        color: 'rgba(71, 85, 105, 0.9)',
        fontSize: 12,
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.4)' } },
      axisTick: { show: false },
      axisLabel: { color: 'rgba(71, 85, 105, 0.8)' },
    },
    yAxis: {
      type: 'value',
      splitLine: {
        lineStyle: {
          color: 'rgba(148, 163, 184, 0.25)',
          type: 'dashed',
        },
      },
      axisLabel: { color: 'rgba(71, 85, 105, 0.8)' },
    },
    series: [],
    dataset: undefined,
    toolbox: {
      show: true,
      feature: {
        saveAsImage: {
          title: '导出图片',
        },
      },
      top: 10,
      right: 10,
      iconStyle: {
        borderColor: 'rgba(71, 85, 105, 0.7)',
      },
    },
  }

  const merged = deepMerge(baseOption, props.options)

  if (Array.isArray(merged.series)) {
    merged.series = merged.series.map((serie, index) => {
      const next = { ...serie }
      const color = palette[index % palette.length]

      if (!next.type) {
        next.type = 'line'
      }

      if (next.type === 'line') {
        next.showSymbol = next.showSymbol ?? false
        next.smooth = next.smooth ?? true
        next.lineStyle = next.lineStyle || {}
        next.lineStyle.width = next.lineStyle.width ?? 3
        next.lineStyle.color = next.lineStyle.color || color

        if (next.areaStyle !== null) {
          next.areaStyle = next.areaStyle || {}
          next.areaStyle.color =
            next.areaStyle.color ||
            {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: `${color}66` },
                { offset: 1, color: `${color}08` },
              ],
            }
        }
      }

      if (next.type === 'bar') {
        next.barMaxWidth = next.barMaxWidth || 26
        next.itemStyle = next.itemStyle || {}
        next.itemStyle.borderRadius = next.itemStyle.borderRadius || [8, 8, 4, 4]
        next.itemStyle.color = next.itemStyle.color || color
      }

      return next
    })
  }

  if (merged.toolbox === false) {
    delete merged.toolbox
  }

  return merged
})
</script>

<style scoped>
.trend-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 200px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.chart-titles h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-neutral-700);
}

.chart-titles p {
  margin-top: 6px;
  font-size: 13px;
  color: var(--color-neutral-500);
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.chart-meta {
  font-size: 12px;
  color: rgba(71, 85, 105, 0.75);
}

.chart-container {
  position: relative;
  width: 100%;
}

:deep(.echarts) {
  width: 100% !important;
}

@media (max-width: 768px) {
  .trend-chart {
    padding: 12px;
  }

  .chart-header {
    flex-direction: column;
  }
}
</style>

