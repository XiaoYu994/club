/**
 * api.js - API接口管理
 * 接口文档地址: http://localhost:8081/
 */
import request from '@/utils/request.js'

// 设置基础配置
const baseURL = 'http://192.168.234.200:8081'; // 后端服务地址
request.setConfig({
  baseURL: baseURL
})

/**
 * 用户相关接口
 */
const user = {
  /**
   * 微信登录
   * @param {string} code - 微信登录临时凭证
   * @returns {Promise} - 返回登录结果，包含token等信息
   */
  wxLogin: (code) => request.post('/user/wx-login', { code }),
  
  /**
   * 更新用户信息
   * @param {Object} data - 用户信息对象，包含头像、昵称等
   * @returns {Promise} - 返回更新结果
   */
  updateUserInfo: (data) => request.put("/user", data),
  
  /**
   * 获取当前登录用户信息
   * @returns {Promise} - 返回用户详细信息
   */
  getUserInfo: () => request.get('/user/info'),
  
  /**
   * 用户注销登录
   * @returns {Promise} - 返回注销结果
   */
  logout: () => request.post('/user/logout')
}

/**
 * 通用模块接口
 */
const common = {
  /**
   * 文件上传
   * @param {string} filePath - 文件本地路径
   * @returns {Promise} - 返回上传结果，包含文件URL等信息
   */
  upload: (filePath) => request.upload("/common/upload", filePath)
}

/**
 * 社团相关接口
 */
const club = {
  /**
   * 获取社团列表
   * @param {Object} params - 查询参数，包含分页、筛选条件等
   * @returns {Promise} - 返回社团列表数据
   */
  getClubList: (params) => request.get('/user/club', params),
  /**
   * 获取当前用户已加入的社团列表
   * @returns {Promise} - 返回社团列表数据
   */
  getMyClubs: () => request.get('/user/club/my'),
  /**
   * 获取用户管理的社团列表
   * @returns {Promise} - 返回用户作为管理员的社团列表
   */
  getUserClubs: () => request.get('/user/club/manage'),
  /**
   * 获取十佳社团列表
   */
  getTopTenClubs: () => request.get('/user/club/topTen'),
  getRecruitmentConfigs: () => request.get('/user/club/recruitment/configs'),
  getClubInfo: (id) => request.get(`/user/club/${id}`),
  createRecruitment: (data) => request.post('/user/club/recruitment', data),
  
  /**
   * 获取社团详情
   * @param {number|string} id - 社团ID
   * @returns {Promise} - 返回社团详细信息
   */
  getClubDetail: (id) => request.get(`/user/club/${id}`),
  
  /**
   * 获取社团扩展信息
   * @param {number|string} id - 社团ID
   * @returns {Promise} - 返回社团扩展信息(ext_json)
   */
  getClubExtJson: (id) => request.get(`/user/club/${id}/ext_json`),
  
  /**
   * 更新社团扩展信息
   * @param {number|string} id - 社团ID
   * @param {Object} data - 扩展信息JSON对象
   * @returns {Promise} - 返回更新结果
   */
  updateClubExtJson: (id, data) => request.put(`/user/club/${id}/ext_json`, data),
  
  /**
   * 获取用户在社团中的角色
   * @param {number|string} clubId - 社团ID
   * @returns {Promise} - 返回用户在社团中的角色信息，包含类型和状态
   */
  getUserRole: (clubId) => request.get(`/user/club/role/${clubId}`),
  
  /**
   * 检查用户加入社团的申请状态
   * @param {number|string} clubId - 社团ID
   * @returns {Promise} - 返回申请状态信息
   */
  checkApplyStatus: (clubId) => request.get(`/user/club/apply/status/${clubId}`),
  
  /**
   * 获取用户申请状态
   * @param {number|string} clubId - 社团ID
   * @returns {Promise} - 返回用户申请状态信息
   */
  getUserApplyStatus: (clubId) => request.get(`/user/club/apply/status/${clubId}`),
  
  /**
   * 获取社团当前招新信息
   * @param {number|string} clubId - 社团ID
   * @returns {Promise} - 返回当前有效的招新信息
   */
  getActiveRecruitment: (clubId) => request.get(`/user/club/recruitment/active/${clubId}`),
  
  /**
   * 获取社团所有当前招新活动
   * @param {number|string} clubId - 社团ID
   * @returns {Promise} - 返回当前所有有效的招新信息列表
   */
  getActiveRecruitments: (clubId) => request.get(`/user/club/recruitment/actives/${clubId}`),
  
  /**
   * 获取招新活动列表
   * @param {Object} params - 查询参数，包含分页、筛选条件等
   * @returns {Promise} - 返回招新活动列表
   */
  getRecruitmentList: (params) => request.get('/user/club/recruitment/list', params),
  
  /**
   * 更新招新活动状态
   * @param {number|string} recruitmentId - 招新活动ID
   * @param {number} status - 状态值：0=未开始，1=进行中，2=已结束
   * @returns {Promise} - 返回更新结果
   */
  updateRecruitmentStatus: (recruitmentId, status) => request.put(`/user/club/recruitment/${recruitmentId}/status`, { status }),
  
  /**
   * 创建社团招新活动
   */
  createRecruitment: (data) => request.post('/user/club/recruitment', data),
  
  /**
   * 获取招新详情
   * @param {number|string} recruitmentId - 招新ID
   * @returns {Promise} - 返回招新详细信息
   */
  getRecruitmentDetail: (recruitmentId) => request.get(`/user/club/recruitment/${recruitmentId}`),
  /**
   * 获取社团招新列表
   * @param {number|string} clubId - 社团ID
   * @param {Object} params - 查询参数，包含分页等
   * @returns {Promise} - 返回招新列表
   */
  listRecruitments: (clubId, params) => request.get(`/user/club/recruitment/club/${clubId}`, params),
  /**
   * 更新社团招新活动
   * @param {number|string} id - 招新ID
   * @param {Object} data - 招新信息
   * @returns {Promise}
   */
  updateRecruitment: (id, data) => request.put(`/user/club/recruitment/${id}`, data),
  /**
   * 删除社团招新活动
   * @param {number|string} id - 招新ID
   * @returns {Promise}
   */
  deleteRecruitment: (id) => request.delete(`/user/club/recruitment/${id}`),
  
  /**
   * 获取社团成员列表
   * @param {number|string} clubId - 社团ID
   * @param {Object} params - 查询参数，包含分页信息
   * @returns {Promise} - 返回社团成员列表
   */
  getClubMembers: (clubId, params) => request.get(`/user/club/members/${clubId}`, params),
  
  /**
   * 申请加入社团
   * @param {number|string} clubId - 社团ID
   * @param {Object} data - 申请信息
   * @returns {Promise} - 返回申请结果
   */
  applyJoinClub: (clubId, data) => request.post(`/user/club/apply/${clubId}`, data),
  
  /**
   * 取消加入社团申请
   * @param {number|string} applyId - 申请ID
   * @returns {Promise} - 返回取消结果
   */
  cancelApply: (applyId) => request.delete(`/user/club/apply/${applyId}`),
  
  /**
   * 退出社团
   * @param {number|string} clubId - 社团ID
   * @returns {Promise} - 返回退出结果
   */
  quitClub: (clubId) => request.delete(`/user/club/quit/${clubId}`),
  /**
   * 更新社团信息
   * @param {number|string} clubId - 社团ID
   * @param {Object} data - 社团信息对象
   */
  updateClub: (clubId, data) => request.put(`/user/club/${clubId}`, data),
  
  /**
   * 审核社团加入申请（管理员使用）
   * @param {number|string} applyId - 申请ID
   * @param {Object} data - 审核数据，包含审核结果和反馈
   * @returns {Promise} - 返回审核结果
   */
  reviewApply: (applyId, data) => request.put(`/user/club/apply/review/${applyId}`, data),
  
  /**
   * 获取社团申请列表（管理员使用）
   * @param {number|string} clubId - 社团ID
   * @param {Object} params - 查询参数，包含分页和筛选条件
   * @returns {Promise} - 返回申请列表
   */
  getApplyList: (clubId, params) => request.get(`/user/club/applies/${clubId}`, params),
  
  /**
   * 获取社团申请计数（管理员使用）
   * @param {number|string} clubId - 社团ID
   * @returns {Promise} - 返回各状态的申请计数
   */
  getApplyCounts: (clubId) => request.get(`/user/club/applies/counts/${clubId}`),
  
  /**
   * 更新成员角色（管理员使用）
   * @param {Object} data - 包含社团ID、用户ID和角色类型
   * @returns {Promise} - 返回更新结果
   */
  updateMemberRole: (data) => request.put(`/user/club/member/role`, data),
  
  /**
   * 更新成员状态（禁用/启用）
   */
  updateMemberStatus: (data) => request.put('/user/club/member/status', data),
  /**
   * 移除社团成员（管理员使用）
   * @param {Object} data - 包含社团ID和用户ID的数据
   * @returns {Promise} - 返回移除结果
   */
  removeMember: (data) => request.delete(`/user/club/member`, data),
  
  /**
   * 导出社团成员数据
   * @param {number|string} clubId - 社团ID
   * @returns {Promise} - 返回包含文件信息的对象
   */
  exportClubMembers: (clubId) => request.get(`/user/club/members/${clubId}/export-excel`),

  /**
   * 获取我的社团申请记录
   * @returns {Promise} - 返回用户的社团申请记录列表
   */
  getMyClubApplies: () => request.get('/user/club/my-applies'),

  /**
   * 测试获取申请数据（调试用）
   * @returns {Promise} - 返回原始申请数据用于调试
   */
  getMyClubAppliesTest: () => request.get('/user/club/my-applies-test'),
}

/**
 * 活动相关接口
 */
const activity = {
  /**
   * 获取活动列表
   * @param {Object} params - 查询参数，包含分页、筛选条件等
   * @returns {Promise} - 返回活动列表数据
   */
  getActivityList: (params) => request.get('/user/activity', params),
  
  /**
   * 获取社团活动列表
   * @param {number|string} clubId - 社团ID
   * @param {Object} params - 查询参数，包含分页信息
   * @returns {Promise} - 返回社团活动列表
   */
  getClubActivities: (clubId, params) => request.get(`/user/activity/club/${clubId}`, params),
  
  /**
   * 获取活动详情
   * @param {number|string} id - 活动ID
   * @returns {Promise} - 返回活动详细信息
   */
  getActivityDetail: (id) => request.get(`/user/activity/${id}`),
  
  /**
   * 报名活动
   * @param {number|string} id - 活动ID
   * @param {Object} data - 报名表单数据
   * @returns {Promise} - 返回报名结果
   */
  applyActivity: (id, data) => request.post(`/user/activity/apply/${id}`, data),
  
  /**
   * 检查用户报名状态
   * @param {number|string} activityId - 活动ID
   * @returns {Promise} - 返回用户在该活动的报名状态
   */
  checkApplyStatus: (activityId) => request.get(`/user/activity/is-apply/${activityId}`),
  
  /**
   * 取消报名
   * @param {number|string} applyId - 报名记录ID
   * @returns {Promise} - 返回取消结果
   */
  cancelApply: (applyId) => request.delete(`/user/activity/apply/${applyId}`),
  
  /**
   * 创建活动
   * @param {Object} data - 活动信息
   * @returns {Promise} - 返回创建结果
   */
  createActivity: (data) => request.post('/user/activity', data),
  
  /**
   * 更新活动信息
   * @param {Object} data - 更新的活动信息，包含ID
   * @returns {Promise} - 返回更新结果
   */
  updateActivity: (data) => request.put(`/user/activity`, data),
  
  /**
   * 删除活动
   * @param {number|string} id - 活动ID
   * @returns {Promise} - 返回删除结果
   */
  deleteActivity: (id) => request.delete(`/user/activity/${id}`),
  
  /**
   * 获取活动报名列表
   * @param {number|string} activityId - 活动ID
   * @param {Object} params - 查询参数
   * @returns {Promise} - 返回报名列表
   */
  getApplyList: (activityId, params) => request.get(`/user/activity/applies/${activityId}`, params),
  
  /**
   * 审核活动报名（管理员使用）
   * @param {number|string} applyId - 报名ID
   * @param {Object} data - 审核数据，包含审核结果和反馈
   * @returns {Promise} - 返回审核结果
   */
  reviewApply: (applyId, data) => request.put(`/user/activity/apply/review/${applyId}`, data),
  
  /**
   * 生成签到码
   * @param {Object} data - 包含活动ID、报名ID和有效期
   * @returns {Promise} - 返回签到码和二维码URL
   */
  generateCheckInCode: (data) => request.post('/user/activity/signCode', data),

  /**
   * 验证签到码er
   * @param {Object} data - 包含活动ID和签到码
   * @returns {Promise} - 返回签到结果，包含applyId和checkInTime
   */
  verifyCheckInCode: (data) => request.post('/user/activity/check-in', data),
  /**
   * 获取当前用户报名的活动列表
   */
  getMyActivities: () => request.get('/user/activity/my'),
  /**
   * 获取活动统计信息
   * @param {number|string} activityId - 活动ID
   * @returns {Promise} - 返回活动统计信息，包含报名人数、签到人数等
   */
  getActivityStats: (activityId) => request.get(`/user/activity/stats/${activityId}`),
  
  /**
   * 导出活动报名名单
   * @param {number|string} activityId - 活动ID
   * @returns {Promise} - 返回导出结果，包含下载链接
   */
  exportApplyList: (activityId) => request.get(`/user/activity/export/${activityId}`)
}

/**
 * 公告相关接口（用户端）
 */
const notice = {
  /**
   * 获取公告列表
   * @param {Object} params - 查询参数，包含分页、筛选条件等
   * @returns {Promise} - 返回公告列表数据
   */
  getNoticeList: (params) => request.get('/user/notice', params),
  /**
   * 获取公告详情
   * @param {number|string} id - 公告ID
   * @returns {Promise} - 返回公告详情
   */
  getNoticeDetail: (id) => request.get(`/user/notice/${id}`)
};

// 聊天相关API
export const chatAPI = {
  // 获取用户的聊天群组
  getGroups: () => request.get('/user/chat-api/groups', null),
  
  // 获取群组详情
  getGroupDetail: (groupId) => request.get(`/user/chat-api/group/${groupId}`, null),
  
  // 获取群组消息历史（显式传递 null 避免自动追加 '?'）
  getGroupMessages: (groupId, page, pageSize) => 
    request.get(`/user/chat-api/messages/group/${groupId}?page=${page}&pageSize=${pageSize}`, null),
  
  // 标记消息为已读
  markMessagesRead: (groupId) => request.put(`/user/chat-api/messages/read/${groupId}`, null),
  
  // 创建群组
  createChatGroup: (data) => request.post('/user/chat-api/group', data),
}

/**
 * 管理员相关接口
 */
const admin = {
  /**
   * 管理员登录
   * @param {Object} data - 包含用户名和密码
   * @returns {Promise} - 返回登录结果，包含token等信息
   */
  login: (data) => request.post('/admin/login', data),
  
  /**
   * 管理员退出登录
   * @returns {Promise} - 返回登出结果
   */
  logout: () => request.post('/admin/logout'),
  
  /**
   * 获取管理员信息
   * @returns {Promise} - 返回管理员详细信息
   */
  getInfo: () => request.get('/admin/info'),
  
  /**
   * 修改管理员密码
   * @param {Object} data - 包含旧密码和新密码
   * @returns {Promise} - 返回修改结果
   */
  updatePassword: (data) => request.put('/admin/password', data),
  
  /**
   * 获取系统统计数据
   * @returns {Promise} - 返回用户、社团、活动、公告的统计数据
   */
  getStatistics: () => request.get('/admin/statistics'),
  
  /**
   * 获取最近公告
   * @returns {Promise} - 返回最近发布的公告列表
   */
  getRecentNotices: () => request.get('/admin/notices/recent'),
  
  /**
   * 用户管理相关
   */
  user: {
    /**
     * 获取用户列表
     * @param {Object} params - 查询参数，包含分页、筛选条件
     * @returns {Promise} - 返回用户列表数据
     */
    getUsers: (params) => request.get('/admin/users', params),
    
    /**
     * 获取用户详情
     * @param {number|string} id - 用户ID
     * @returns {Promise} - 返回用户详情
     */
    getUserDetail: (id) => request.get(`/admin/users/${id}`),
    
    /**
     * 修改用户信息
     * @param {number|string} id - 用户ID
     * @param {Object} data - 用户信息
     * @returns {Promise} - 返回修改结果
     */
    updateUser: (id, data) => request.put(`/admin/users/${id}`, data),
    
    /**
     * 禁用/启用用户
     * @param {number|string} id - 用户ID
     * @param {Object} data - 包含状态信息
     * @returns {Promise} - 返回操作结果
     */
    updateUserStatus: (id, data) => request.put(`/admin/users/${id}/status`, data),
    /**
     * 导出用户列表
     * @param {Object} params - 查询参数
     * @returns {Promise} - 返回导出结果，包含下载链接
     */
    exportUsers: (params) => request.get('/admin/users/export', params)
  },
  
  /**
   * 社团管理相关
   */
  club: {
    /**
     * 获取社团列表
     * @param {Object} params - 查询参数，包含分页、筛选条件
     * @returns {Promise} - 返回社团列表数据
     */
    getClubs: (params) => request.get('/admin/clubs', params),

    /**
     * 创建社团
     * @param {Object} data - 社团信息
     * @returns {Promise} - 返回创建结果
     */
    createClub: (data) => request.post('/admin/clubs', data),
    
    /**
     * 删除社团
     * @param {number|string} id - 社团ID
     * @returns {Promise} - 返回删除结果
     */
    deleteClub: (id) => request.delete(`/admin/clubs/${id}`),
    
    /**
     * 修改社团状态
     * @param {Object} data - 包含clubId和status字段
     * @returns {Promise} - 返回状态修改结果
     */
    updateClubStatus: (data) => request.put(`/admin/clubs`, data),

    /**
     * 获取社团详细信息
     * @param {number|string} id - 社团ID
     * @returns {Promise} - 返回社团详细信息
     */
    getClubDetail: (id) => request.get(`/admin/clubs/${id}/detail`),

    /**
     * 更新社团信息
     * @param {number|string} id - 社团ID
     * @param {Object} data - 社团更新信息
     * @returns {Promise} - 返回更新结果
     */
    updateClub: (id, data) => request.put(`/admin/clubs/${id}`, data),

    /**
     * 修改社团排序
     * @param {Object} data - 包含clubId和orderNum字段
     * @returns {Promise} - 返回排序修改结果
     */
    updateClubOrder: (data) => request.put(`/admin/clubs/order`, data)
  },
  
  /**
   * 活动管理相关
   */
  activity: {
    /**
     * 获取活动列表
     * @param {Object} params - 查询参数，包含分页、筛选条件
     * @returns {Promise} - 返回活动列表数据
     */
    getActivities: (params) => request.get('/admin/activities', params),

    /**
     * 获取活动详细信息
     * @param {number|string} id - 活动ID
     * @returns {Promise} - 返回活动详细信息
     */
    getActivityDetail: (id) => request.get(`/admin/activities/${id}/detail`),
    
        
    /**
     * 删除活动
     * @param {number|string} id - 活动ID
     * @returns {Promise} - 返回删除结果
     */
    deleteActivity: (id) => request.delete(`/admin/activities/${id}`),
    
    /**
     * 修改活动状态（审核通过/拒绝）
     * @param {number|string} id - 活动ID
     * @param {Object} data - 包含状态和反馈信息
     * @returns {Promise} - 返回审核结果
     */
    updateActivityStatus: (data) => request.put(`/admin/activities`, data),
    /**
     * 导出活动报名名单
     * @param {number|string} activityId - 活动ID
     * @returns {Promise} - 返回导出结果，包含下载链接
     */
    exportApplyList: (activityId) => request.get(`/admin/activities/export/${activityId}`)
  },
  
  /**
   * 公告管理相关
   */
  notice: {
    /**
     * 获取公告列表
     * @param {Object} params - 查询参数，包含分页、筛选条件
     * @returns {Promise} - 返回公告列表数据
     */
    getNotices: (params) => request.get('/admin/notices', params),
    
    /**
     * 获取公告详情
     * @param {number|string} id - 公告ID
     * @returns {Promise} - 返回公告详情
     */
    getNoticeDetail: (id) => request.get(`/admin/notices/${id}`),
    
    /**
     * 创建公告
     * @param {Object} data - 公告信息
     * @returns {Promise} - 返回创建结果
     */
    createNotice: (data) => request.post('/admin/notices', data),
    
    /**
     * 修改公告
     * @param {number|string} id - 公告ID
     * @param {Object} data - 公告信息
     * @returns {Promise} - 返回修改结果
     */
    updateNotice: (id, data) => request.put(`/admin/notices/${id}`, data),
    
    /**
     * 删除公告
     * @param {number|string} id - 公告ID
     * @returns {Promise} - 返回删除结果
     */
    deleteNotice: (id) => request.delete(`/admin/notices/${id}`),
    
    /**
     * 设置公告置顶状态
     * @param {number|string} id - 公告ID
     * @param {number} isTop - 置顶状态 0=否 1=是
     * @returns {Promise} - 返回更新结果
     */
    updateTopStatus: (id, isTop) => request.put(`/admin/notices/${id}/top?isTop=${isTop}`)
  },
  
  /**
   * 管理员管理相关接口
   */
  admin: {
    /**
     * 获取管理员列表
     * @param {Object} params - 查询参数，包含pageNo, pageSize, keyword, status等
     * @returns {Promise} - 返回管理员列表数据
     */
    getAdmins: (params) => request.get('/admin', params),
    
    /**
     * 创建管理员
     * @param {Object} data - 管理员信息，包含username, password, realName, phone, description, type等
     * @returns {Promise} - 返回创建结果
     */
    createAdmin: (data) => request.post('/admin', data),
    
    /**
     * 更新管理员状态（启用/禁用）
     * @param {number|string} adminId - 管理员ID
     * @param {Object} data - 包含status字段，1=启用，0=禁用
     * @returns {Promise} - 返回操作结果
     */
    updateAdminStatus: (data) => request.put(`/admin/status`, data),
    
    /**
     * 重置管理员密码
     * @param {number|string} adminId - 管理员ID
     * @returns {Promise} - 返回重置结果，通常包含新的随机密码
     */
    resetAdminPassword: (adminId) => request.put(`/admin/${adminId}/reset`)
    ,
    
    /**
     * 删除管理员
     * @param {number|string} adminId - 管理员ID
     * @returns {Promise} - 返回删除操作结果
     */
    deleteAdmin: (adminId) => request.delete(`/admin/${adminId}`)
  },
  
  /**
   * 招新配置管理相关接口
   */
  recruitment: {
    
    /**
     * 分页获取招新配置列表
     * @param {Object} params - 查询参数，包含page, pageSize, keyword等
     * @returns {Promise} - 返回招新配置分页数据
     */
    getConfigPage: (params) => request.get('/admin/recruitment/configs/page', params),
    
    /**
     * 获取招新配置详情
     * @param {number|string} id - 配置ID
     * @returns {Promise} - 返回招新配置详情
     */
    getConfigDetail: (id) => request.get(`/admin/recruitment/configs/${id}`),
    
    /**
     * 创建招新配置
     * @param {Object} data - 招新配置信息
     * @returns {Promise} - 返回创建结果
     */
    createConfig: (data) => request.post('/admin/recruitment/configs', data),
    
    /**
     * 修改招新配置
     * @param {Object} data - 招新配置信息
     * @returns {Promise} - 返回修改结果
     */
    updateConfig: (data) => request.put('/admin/recruitment/configs', data),
    
    
    /**
     * 删除招新配置
     * @param {number|string} id - 招新配置ID
     * @returns {Promise} - 返回删除结果
     */
    deleteConfig: (id) => request.delete(`/admin/recruitment/configs/${id}`),
    
    /**
     * 分页获取招新审核列表
     * @param {Object} params - 查询参数，包含pageNo, pageSize, status等
     * @returns {Promise} - 返回招新审核分页数据
     */
    getAuditList: (params) => request.get('/admin/recruitment/audit', params),
    
    /**
     * 审核招新活动
     * @param {Object} data - 审核数据，包含id, status, reviewComment
     * @returns {Promise} - 返回审核结果
     */
    auditRecruitment: (data) => request.put('/admin/recruitment/audit', data),
    
    /**
     * 获取招新详情
     * @param {number|string} id - 招新ID
     * @returns {Promise} - 返回招新详情
     */
    getRecruitmentDetail: (id) => request.get(`/admin/recruitment/audit/${id}`),

    /**
     * 删除招新活动（管理员）
     * @param {number|string} id - 招新ID
     * @returns {Promise} - 返回删除结果
     */
    deleteRecruitment: (id) => request.delete(`/admin/recruitment/${id}`)
  }
};



// 将club对象导出为clubAPI
export const clubAPI = club;

export default {
  baseURL,
  user,
  club,
  common,
  activity,
  admin,
  notice // 导出用户端公告API
}