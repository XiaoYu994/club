<template>
  <div class="dashboard-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">数据仪表盘</h2>
      <el-button type="primary" :icon="Refresh" @click="refreshData" :loading="loading">
        刷新数据
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="24" :sm="12" :md="6" v-for="stat in stats" :key="stat.key">
        <div class="stat-card" :class="`stat-${stat.key}`">
          <div class="stat-icon-wrapper">
            <div class="stat-icon" :style="{ background: stat.color }">
              <el-icon :size="32">
                <component :is="stat.icon" />
              </el-icon>
            </div>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ formatNumber(stat.value) }}</div>
            <div class="stat-label">{{ stat.label }}</div>
          </div>
        </div>
      </el-col>
    </el-row>


    <!-- 数据分布图表 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <el-icon><PieChart /></el-icon>
                <span>社团类别分布</span>
              </div>
            </div>
          </template>
          <div class="chart-wrapper">
            <v-chart
              class="chart"
              :option="clubCategoryOption"
              :loading="loading"
              autoresize
            />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <el-icon><PieChart /></el-icon>
                <span>活动状态分布</span>
              </div>
            </div>
          </template>
          <div class="chart-wrapper">
            <v-chart
              class="chart"
              :option="activityStatusOption"
              :loading="loading"
              autoresize
            />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <el-icon><DataAnalysis /></el-icon>
                <span>用户状态分布</span>
              </div>
            </div>
          </template>
          <div class="chart-wrapper">
            <v-chart
              class="chart"
              :option="userStatusOption"
              :loading="loading"
              autoresize
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 趋势数据图表 -->
    <el-row :gutter="20" class="charts-row">
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <el-icon><TrendCharts /></el-icon>
                <span>增长趋势</span>
              </div>
              <div class="card-actions">
                <el-radio-group v-model="selectedDays" @change="handleDaysChange" size="small">
                  <el-radio-button :label="7">近7天</el-radio-button>
                  <el-radio-button :label="30">近30天</el-radio-button>
                </el-radio-group>
              </div>
            </div>
          </template>
          <div class="chart-wrapper-large">
            <v-chart
              class="chart"
              :option="growthTrendOption"
              :loading="trendLoading"
              autoresize
            />
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <div class="card-title">
                <el-icon><TrendCharts /></el-icon>
                <span>活跃度趋势</span>
              </div>
              <div class="card-actions">
                <el-tag size="small" type="success">{{ selectedDays }}天数据</el-tag>
              </div>
            </div>
          </template>
          <div class="chart-wrapper-large">
            <v-chart
              class="chart"
              :option="activityTrendOption"
              :loading="trendLoading"
              autoresize
            />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 热门社团排行 -->
    <el-card class="top-clubs-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="card-title">
            <el-icon><Trophy /></el-icon>
            <span>热门社团排行</span>
          </div>
        </div>
      </template>
      <div v-if="topClubs.length === 0" class="empty-clubs">
        <el-empty description="暂无数据" :image-size="80" />
      </div>
      <div v-else class="top-clubs-list">
        <div
          v-for="(club, index) in topClubs"
          :key="club.clubId"
          class="club-item"
        >
          <div class="club-rank" :class="`rank-${index + 1}`">
            {{ index + 1 }}
          </div>
          <div class="club-info">
            <div class="club-name">{{ club.clubName }}</div>
            <div class="club-meta">成员数: {{ club.memberCount || 0 }}</div>
          </div>
          <el-button link type="primary" @click="goToClubDetail(club.clubId)">
            查看详情
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 快捷操作 -->
    <el-card class="quick-actions-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <div class="card-title">
            <el-icon><Operation /></el-icon>
            <span>快捷操作</span>
          </div>
        </div>
      </template>
      <div class="quick-actions">
        <div class="action-item" @click="goToUsers">
          <div class="action-icon user">
            <el-icon :size="24"><User /></el-icon>
          </div>
          <div class="action-content">
            <div class="action-title">用户管理</div>
            <div class="action-desc">管理系统用户信息</div>
          </div>
          <el-icon class="action-arrow"><ArrowRight /></el-icon>
        </div>
        <div class="action-item" @click="goToClubs">
          <div class="action-icon club">
            <el-icon :size="24"><OfficeBuilding /></el-icon>
          </div>
          <div class="action-content">
            <div class="action-title">社团管理</div>
            <div class="action-desc">管理社团信息</div>
          </div>
          <el-icon class="action-arrow"><ArrowRight /></el-icon>
        </div>
        <div class="action-item" @click="goToActivities">
          <div class="action-icon activity">
            <el-icon :size="24"><Calendar /></el-icon>
          </div>
          <div class="action-content">
            <div class="action-title">活动管理</div>
            <div class="action-desc">管理活动信息</div>
          </div>
          <el-icon class="action-arrow"><ArrowRight /></el-icon>
        </div>
        <div class="action-item" @click="goToNotices">
          <div class="action-icon notice">
            <el-icon :size="24"><Bell /></el-icon>
          </div>
          <div class="action-content">
            <div class="action-title">公告管理</div>
            <div class="action-desc">管理系统公告</div>
          </div>
          <el-icon class="action-arrow"><ArrowRight /></el-icon>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  User,
  OfficeBuilding,
  Calendar,
  Bell,
  Refresh,
  PieChart,
  DataAnalysis,
  TrendCharts,
  Operation,
  ArrowRight,
  Trophy,
  Document,
} from '@element-plus/icons-vue'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { PieChart as EChartsPieChart, BarChart, LineChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
} from 'echarts/components'
import VChart from 'vue-echarts'
import { dashboardApi } from '@/api/system'

use([
  CanvasRenderer,
  EChartsPieChart,
  BarChart,
  LineChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
])

const router = useRouter()
const loading = ref(false)
const trendLoading = ref(false)
const selectedDays = ref(7)
const statistics = ref({
  userCount: 0,
  clubCount: 0,
  activityCount: 0,
  noticeCount: 0,
  pendingActivityCount: 0,
  pendingClubApplyCount: 0,
  clubCategoryDistribution: {},
  activityStatusDistribution: {},
  userStatusDistribution: {},
  totalActivityApplies: 0,
  totalCheckedIn: 0,
  averageCheckInRate: 0,
  averageActivityParticipation: 0,
  topClubs: [],
})
const topClubs = computed(() => statistics.value.topClubs || [])
const trendData = ref({
  dates: [],
  userTrend: [],
  clubTrend: [],
  activityTrend: [],
  activityApplyTrend: [],
  clubApplyTrend: [],
})

const stats = computed(() => [
  {
    key: 'users',
    label: '用户总数',
    value: statistics.value.userCount || 0,
    icon: 'User',
    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    key: 'clubs',
    label: '社团总数',
    value: statistics.value.clubCount || 0,
    icon: 'OfficeBuilding',
    color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    key: 'activities',
    label: '活动总数',
    value: statistics.value.activityCount || 0,
    icon: 'Calendar',
    color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
  {
    key: 'pending',
    label: '待审核事项',
    value: (statistics.value.pendingActivityCount || 0) + (statistics.value.pendingClubApplyCount || 0),
    icon: 'Document',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  },
])

const formatNumber = (num) => {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万'
  }
  return num.toLocaleString()
}

// 社团类别分布饼图
const clubCategoryOption = computed(() => {
  const distribution = statistics.value.clubCategoryDistribution || {}
  const data = Object.entries(distribution).map(([name, value]) => ({
    value,
    name,
  }))
  
  const colors = ['#667eea', '#f5576c', '#4facfe', '#43e97b', '#fa709a']
  
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      itemGap: 12,
      textStyle: {
        fontSize: 12,
      },
    },
    series: [
      {
        name: '社团类别',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}\n{c}',
          fontSize: 12,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        data: data.map((item, index) => ({
          ...item,
          itemStyle: { color: colors[index % colors.length] },
        })),
      },
    ],
  }
})

// 活动状态分布饼图
const activityStatusOption = computed(() => {
  const distribution = statistics.value.activityStatusDistribution || {}
  const data = Object.entries(distribution).map(([name, value]) => ({
    value,
    name,
  }))
  
  const colorMap = {
    '待审核': '#fa709a',
    '进行中': '#4facfe',
    '已结束': '#43e97b',
    '已取消': '#94a3b8',
    '未知': '#cbd5e1'
  }
  
  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'middle',
      itemGap: 12,
      textStyle: {
        fontSize: 12,
      },
    },
    series: [
      {
        name: '活动状态',
        type: 'pie',
        radius: ['45%', '75%'],
        center: ['60%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: '#fff',
          borderWidth: 2,
        },
        label: {
          show: true,
          formatter: '{b}\n{c}',
          fontSize: 12,
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
          },
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)',
          },
        },
        data: data.map(item => ({
          ...item,
          itemStyle: { color: colorMap[item.name] || '#cbd5e1' },
        })),
      },
    ],
  }
})

// 用户状态分布柱状图
const userStatusOption = computed(() => {
  const distribution = statistics.value.userStatusDistribution || {}
  const categories = Object.keys(distribution)
  const values = Object.values(distribution)
  
  return {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisTick: {
        alignWithLabel: true,
      },
    },
    yAxis: {
      type: 'value',
    },
    series: [
      {
        name: '用户数',
        type: 'bar',
        barWidth: '60%',
        itemStyle: {
          borderRadius: [4, 4, 0, 0],
          color: (params) => {
            const colors = {
              '正常': '#43e97b',
              '已禁用': '#f5576c',
            }
            return colors[params.name] || '#667eea'
          },
        },
        data: values,
      },
    ],
  }
})

// 用户和社团增长趋势折线图
const growthTrendOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  legend: {
    data: ['新增用户', '新增社团', '新增活动'],
    top: 0,
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: trendData.value.dates,
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: '新增用户',
      type: 'line',
      smooth: true,
      itemStyle: { color: '#667eea' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
            { offset: 1, color: 'rgba(102, 126, 234, 0.05)' }
          ]
        }
      },
      data: trendData.value.userTrend,
    },
    {
      name: '新增社团',
      type: 'line',
      smooth: true,
      itemStyle: { color: '#f5576c' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(245, 87, 108, 0.3)' },
            { offset: 1, color: 'rgba(245, 87, 108, 0.05)' }
          ]
        }
      },
      data: trendData.value.clubTrend,
    },
    {
      name: '新增活动',
      type: 'line',
      smooth: true,
      itemStyle: { color: '#4facfe' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(79, 172, 254, 0.3)' },
            { offset: 1, color: 'rgba(79, 172, 254, 0.05)' }
          ]
        }
      },
      data: trendData.value.activityTrend,
    },
  ],
}))

// 活动报名和招新趋势折线图
const activityTrendOption = computed(() => ({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  legend: {
    data: ['活动报名', '社团招新'],
    top: 0,
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true,
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: trendData.value.dates,
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: '活动报名',
      type: 'line',
      smooth: true,
      itemStyle: { color: '#43e97b' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(67, 233, 123, 0.3)' },
            { offset: 1, color: 'rgba(67, 233, 123, 0.05)' }
          ]
        }
      },
      data: trendData.value.activityApplyTrend,
    },
    {
      name: '社团招新',
      type: 'line',
      smooth: true,
      itemStyle: { color: '#fa709a' },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(250, 112, 154, 0.3)' },
            { offset: 1, color: 'rgba(250, 112, 154, 0.05)' }
          ]
        }
      },
      data: trendData.value.clubApplyTrend,
    },
  ],
}))

const fetchStatistics = async () => {
  loading.value = true
  try {
    const response = await dashboardApi.getStatistics()
    if (response?.data) {
      statistics.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch statistics:', error)
    ElMessage.error('获取统计数据失败')
  } finally {
    loading.value = false
  }
}

const fetchTrendData = async (days) => {
  trendLoading.value = true
  try {
    const response = await dashboardApi.getTrendData(days)
    if (response?.data) {
      trendData.value = response.data
    }
  } catch (error) {
    console.error('Failed to fetch trend data:', error)
    ElMessage.error('获取趋势数据失败')
  } finally {
    trendLoading.value = false
  }
}

const handleDaysChange = (days) => {
  selectedDays.value = days
  fetchTrendData(days)
}

const refreshData = () => {
  fetchStatistics()
  fetchTrendData(selectedDays.value)
}

const goToUsers = () => router.push('/users')
const goToClubs = () => router.push('/clubs')
const goToActivities = () => router.push('/activities')
const goToNotices = () => router.push('/notices')
const goToClubDetail = (clubId) => router.push(`/clubs/${clubId}`)

onMounted(() => {
  fetchStatistics()
  fetchTrendData(selectedDays.value)
})
</script>

<style scoped>
.dashboard-container {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.stats-row {
  margin-bottom: 24px;
}

.stat-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.stat-icon-wrapper {
  flex-shrink: 0;
}

.stat-icon {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1.2;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.charts-row {
  margin-bottom: 24px;
}

.chart-card {
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.card-title .el-icon {
  font-size: 18px;
  color: #6366f1;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.chart-wrapper {
  height: 320px;
  padding: 16px 0;
}

.metric-card {
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.metric-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.metric-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.metric-info {
  flex: 1;
}

.metric-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.metric-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.chart-wrapper-large {
  height: 400px;
  padding: 16px 0;
}

.chart {
  height: 100%;
  width: 100%;
}

.quick-actions-card {
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 16px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.action-item:hover {
  background: #ffffff;
  border-color: #6366f1;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.1);
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.action-icon.user {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.action-icon.club {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.action-icon.activity {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.action-icon.notice {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  color: white;
}

.action-content {
  flex: 1;
}

.action-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.action-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.action-arrow {
  color: var(--el-text-color-placeholder);
  transition: all 0.3s ease;
}

.action-item:hover .action-arrow {
  color: #6366f1;
  transform: translateX(4px);
}

.top-clubs-card {
  margin-bottom: 20px;
}

.empty-clubs {
  padding: 40px 0;
}

.top-clubs-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.club-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background: var(--el-bg-color-page);
  transition: all 0.3s ease;
}

.club-item:hover {
  background: var(--el-fill-color-light);
  transform: translateX(4px);
}

.club-rank {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
  flex-shrink: 0;
}

.club-rank.rank-1 {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
  color: #fff;
}

.club-rank.rank-2 {
  background: linear-gradient(135deg, #c0c0c0 0%, #e8e8e8 100%);
  color: #fff;
}

.club-rank.rank-3 {
  background: linear-gradient(135deg, #cd7f32 0%, #e6a85c 100%);
  color: #fff;
}

.club-rank:not(.rank-1):not(.rank-2):not(.rank-3) {
  background: var(--el-fill-color);
  color: var(--el-text-color-regular);
}

.club-info {
  flex: 1;
}

.club-name {
  font-weight: 600;
  font-size: 16px;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
}

.club-meta {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .stat-value {
    font-size: 28px;
  }

  .stat-icon {
    width: 60px;
    height: 60px;
  }

  .chart-wrapper {
    height: 280px;
  }

  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>
