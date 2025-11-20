<template>
  <div class="settings-container">
    <el-tabs v-model="activeTab" class="settings-tabs">
      <!-- 轮播图管理 -->
      <el-tab-pane label="轮播图管理" name="banners">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>移动端首页轮播图</span>
              <el-button type="primary" icon="Plus" @click="handleAddBanner">新增轮播图</el-button>
            </div>
          </template>

          <el-table :data="bannerList" v-loading="loading" style="width: 100%">
            <el-table-column label="封面图" width="180">
              <template #default="{ row }">
                <el-image 
                  :src="row.coverImage" 
                  fit="cover" 
                  style="width: 160px; height: 90px; border-radius: 4px"
                  :preview-src-list="[row.coverImage]"
                >
                  <template #error>
                    <div class="image-placeholder">无图片</div>
                  </template>
                </el-image>
              </template>
            </el-table-column>
            <el-table-column prop="title" label="标题" min-width="150" />
            <el-table-column prop="content" label="跳转链接" min-width="200" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'info'">
                  {{ row.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="handleEditBanner(row)">编辑</el-button>
                <el-popconfirm title="确定删除该轮播图吗？" @confirm="handleDeleteBanner(row)">
                  <template #reference>
                    <el-button link type="danger">删除</el-button>
                  </template>
                </el-popconfirm>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <!-- 学期配置 -->
      <el-tab-pane label="学期配置" name="semester">
        <el-card shadow="never">
          <template #header>
            <div class="card-header">
              <span>当前学期配置</span>
              <el-button type="primary" link @click="$router.push('/recruitment/configs')">前往招新配置管理</el-button>
            </div>
          </template>
          
          <div class="semester-info" v-if="currentConfig">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="当前学期">{{ currentConfig.semester || '未设置' }}</el-descriptions-item>
              <el-descriptions-item label="招新配置名称">{{ currentConfig.name }}</el-descriptions-item>
              <el-descriptions-item label="全局招新时间">
                {{ formatTime(currentConfig.globalStartTime) }} 至 {{ formatTime(currentConfig.globalEndTime) }}
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="currentConfig.status === 1 ? 'success' : 'info'">
                  {{ currentConfig.status === 1 ? '启用' : '禁用' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>
            <div class="semester-tip">
              <el-icon><InfoFilled /></el-icon>
              <span>当前学期信息由"启用的招新配置"决定。如需修改，请前往招新配置管理页面。</span>
            </div>
          </div>
          <el-empty v-else description="当前没有启用的招新配置，请前往配置" />
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <!-- 轮播图编辑弹窗 -->
    <el-dialog
      :title="dialog.title"
      v-model="dialog.visible"
      width="500px"
      destroy-on-close
    >
      <el-form :model="form" :rules="rules" ref="formRef" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入轮播图标题" />
        </el-form-item>
        <el-form-item label="封面图" prop="coverImage">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :http-request="customUpload"
            :before-upload="beforeUpload"
          >
            <img v-if="form.coverImage" :src="form.coverImage" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">建议尺寸：750x400，支持 jpg/png</div>
        </el-form-item>
        <el-form-item label="跳转链接" prop="content">
          <el-input v-model="form.content" placeholder="请输入跳转链接（可选）" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialog.visible = false">取消</el-button>
          <el-button type="primary" @click="submitForm" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, InfoFilled } from '@element-plus/icons-vue'
import * as noticesApi from '@/api/system/notices'
import * as recruitApi from '@/api/system/recruitment'
import { formatTime } from '@/utils/format'
import { upload } from '@/utils/request'

const activeTab = ref('banners')
const loading = ref(false)
const bannerList = ref([])
const currentConfig = ref(null)

// 轮播图表单
const dialog = reactive({
  visible: false,
  title: ''
})
const formRef = ref(null)
const submitting = ref(false)
const form = reactive({
  id: null,
  title: '',
  coverImage: '',
  content: '', // 用作链接
  status: 1,
  type: 3, // 3=轮播图
  isTop: 1
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  coverImage: [{ required: true, message: '请上传封面图', trigger: 'change' }]
}

// 获取轮播图列表
const fetchBanners = async () => {
  loading.value = true
  try {
    const res = await noticesApi.getNoticeList({
      pageNo: 1,
      pageSize: 100,
      type: 3 // 获取类型为3的公告作为轮播图
    })
    if (res?.data) {
      bannerList.value = res.data.list || []
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('获取轮播图失败')
  } finally {
    loading.value = false
  }
}

// 获取当前学期配置
const fetchCurrentConfig = async () => {
  try {
    // 获取启用的配置
    const res = await recruitApi.getRecruitConfigList({
      pageNo: 1,
      pageSize: 1,
      status: 1
    })
    if (res?.data?.list?.length > 0) {
      currentConfig.value = res.data.list[0]
    } else {
      currentConfig.value = null
    }
  } catch (error) {
    console.error(error)
  }
}

const handleAddBanner = () => {
  dialog.title = '新增轮播图'
  dialog.visible = true
  form.id = null
  form.title = ''
  form.coverImage = ''
  form.content = ''
  form.status = 1
}

const handleEditBanner = (row) => {
  dialog.title = '编辑轮播图'
  dialog.visible = true
  form.id = row.id
  form.title = row.title
  form.coverImage = row.coverImage
  form.content = row.content
  form.status = row.status
}

const handleDeleteBanner = async (row) => {
  try {
    await noticesApi.deleteNotice(row.id)
    ElMessage.success('删除成功')
    fetchBanners()
  } catch (error) {
    console.error(error)
    ElMessage.error('删除失败')
  }
}

const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitting.value = true
      try {
        const data = {
          title: form.title,
          coverImage: form.coverImage,
          content: form.content || '#', // 内容不能为空，如果没填链接则填#
          status: form.status,
          type: 3,
          isTop: 1
        }
        
        if (form.id) {
          await noticesApi.updateNotice(form.id, data)
          ElMessage.success('更新成功')
        } else {
          await noticesApi.createNotice(data)
          ElMessage.success('创建成功')
        }
        dialog.visible = false
        fetchBanners()
      } catch (error) {
        console.error(error)
        ElMessage.error('保存失败')
      } finally {
        submitting.value = false
      }
    }
  })
}

// 图片上传
const customUpload = async (options) => {
  const formData = new FormData()
  formData.append('file', options.file)
  
  try {
    const res = await upload('/common/upload', formData)
    
    if (res && res.code === 200) {
      form.coverImage = res.data.url
      ElMessage.success('上传成功')
    } else {
      ElMessage.error(res?.msg || '上传失败')
    }
  } catch (error) {
    console.error(error)
    ElMessage.error('上传出错')
  }
}

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
  }
  return isImage && isLt2M
}

onMounted(() => {
  fetchBanners()
  fetchCurrentConfig()
})
</script>

<style scoped>
.settings-container {
  padding: 0;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.image-placeholder {
  width: 160px;
  height: 90px;
  background: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
  border-radius: 4px;
}
.semester-info {
  padding: 20px;
}
.semester-tip {
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 14px;
}
.avatar-uploader .avatar {
  width: 178px;
  height: 100px; /* 16:9 aspect ratio approx */
  display: block;
  object-fit: cover;
}
.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}
.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 100px;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}
.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}
</style>
