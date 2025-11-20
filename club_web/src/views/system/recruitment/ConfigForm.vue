<template>
  <div class="config-form-container">
    <el-card shadow="never">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-button link @click="goBack" :icon="ArrowLeft">返回</el-button>
            <span class="title">{{ isEdit ? '编辑配置' : '新建配置' }}</span>
          </div>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
        class="config-form"
        v-loading="loading"
      >
        <el-form-item label="配置标题" prop="name">
          <el-input v-model="form.name" placeholder="例如：2025年秋季社团招新" />
        </el-form-item>

        <el-form-item label="学期" prop="semester">
          <el-input v-model="form.semester" placeholder="例如：2025-2026-1" />
        </el-form-item>

        <el-form-item label="招新时间" prop="dateRange">
          <el-date-picker
            v-model="form.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="x"
          />
        </el-form-item>

        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="备注" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入备注说明（选填）"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="submitForm" :loading="submitting">
            保存
          </el-button>
          <el-button @click="goBack">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import * as recruitApi from '@/api/system/recruitment'

const route = useRoute()
const router = useRouter()
const formRef = ref(null)
const loading = ref(false)
const submitting = ref(false)

const isEdit = computed(() => route.params.id && route.params.id !== 'new')

const form = reactive({
  id: null,
  name: '',
  semester: '',
  dateRange: [],
  status: 1,
  description: ''
})

const rules = {
  name: [{ required: true, message: '请输入配置标题', trigger: 'blur' }],
  semester: [{ required: true, message: '请输入学期', trigger: 'blur' }],
  dateRange: [{ required: true, message: '请选择招新时间', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const fetchData = async () => {
  if (!isEdit.value) return
  loading.value = true
  try {
    const res = await recruitApi.getRecruitConfigDetail(route.params.id)
    if (res?.data) {
      const data = res.data
      form.id = data.id
      form.name = data.name
      form.semester = data.semester
      form.status = data.status
      form.description = data.description
      if (data.globalStartTime && data.globalEndTime) {
        form.dateRange = [data.globalStartTime, data.globalEndTime]
      }
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取详情失败')
  } finally {
    loading.value = false
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const data = {
          name: form.name,
          semester: form.semester,
          status: form.status,
          description: form.description,
          globalStartTime: form.dateRange[0],
          globalEndTime: form.dateRange[1]
        }
        
        if (isEdit.value) {
          data.id = form.id
          await recruitApi.updateRecruitConfig(data)
          ElMessage.success('更新成功')
        } else {
          await recruitApi.createRecruitConfig(data)
          ElMessage.success('创建成功')
        }
        goBack()
      } catch (error) {
        console.error(error)
        ElMessage.error('保存失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

const goBack = () => {
  router.push('/recruitment/configs')
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.config-form-container {
  max-width: 800px;
  margin: 0 auto;
}
.card-header {
  display: flex;
  align-items: center;
}
.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
.title {
  font-size: 18px;
  font-weight: 600;
}
.config-form {
  margin-top: 20px;
}
</style>

