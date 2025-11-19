// 系统管理员端路由配置
// 仅包含需要在侧边菜单中展示的主要页面，以及部分辅助隐藏页面

export const systemMenuRoutes = [
  {
    path: 'dashboard',
    name: 'SystemDashboard',
    component: () => import('@/views/system/Dashboard.vue'),
    meta: {
      title: '数据仪表盘',
      icon: 'Monitor',
      affix: true,
      requiresAuth: true,
      roles: ['SUPER', 'ADMIN'],
      menuGroup: '概览',
    },
  },
  {
    path: 'clubs',
    name: 'SystemClubs',
    component: () => import('@/views/system/clubs/List.vue'),
    meta: {
      title: '社团管理',
      icon: 'OfficeBuilding',
      requiresAuth: true,
      roles: ['SUPER', 'ADMIN'],
      menuGroup: '业务管理',
    },
  },
  {
    path: 'users',
    name: 'SystemUsers',
    component: () => import('@/views/system/users/List.vue'),
    meta: {
      title: '用户管理',
      icon: 'User',
      requiresAuth: true,
      roles: ['SUPER', 'ADMIN'],
      menuGroup: '业务管理',
    },
  },
  {
    path: 'activities',
    name: 'SystemActivities',
    component: () => import('@/views/system/activities/List.vue'),
    meta: {
      title: '活动管理',
      icon: 'Calendar',
      requiresAuth: true,
      roles: ['SUPER', 'ADMIN'],
      menuGroup: '业务管理',
    },
  },
  {
    path: 'recruitment/configs',
    name: 'SystemRecruitConfigs',
    component: () => import('@/views/system/recruitment/Configs.vue'),
    meta: {
      title: '招新配置',
      icon: 'EditPen',
      requiresAuth: true,
      roles: ['SUPER', 'ADMIN'],
      menuGroup: '招新与审批',
    },
  },
  {
    path: 'recruitment/audit',
    name: 'SystemRecruitAudit',
    component: () => import('@/views/system/recruitment/Audit.vue'),
    meta: {
      title: '招新审核',
      icon: 'DocumentChecked',
      requiresAuth: true,
      roles: ['SUPER', 'ADMIN'],
      menuGroup: '招新与审批',
    },
  },
  {
    path: 'notices',
    name: 'SystemNotices',
    component: () => import('@/views/system/notices/List.vue'),
    meta: {
      title: '公告管理',
      icon: 'Bell',
      requiresAuth: true,
      roles: ['SUPER', 'ADMIN'],
      menuGroup: '内容与通知',
    },
  },
  {
    path: 'finance',
    name: 'SystemFinance',
    component: () => import('@/views/system/finance/List.vue'),
    meta: {
      title: '财务管理',
      icon: 'Coin',
      requiresAuth: true,
      roles: ['SUPER'],
      menuGroup: '运营支持',
    },
  },
  {
    path: 'resources',
    name: 'SystemResources',
    component: () => import('@/views/system/resources/List.vue'),
    meta: {
      title: '资源管理',
      icon: 'Box',
      requiresAuth: true,
      roles: ['SUPER', 'ADMIN'],
      menuGroup: '运营支持',
    },
  },
  {
    path: 'admins',
    name: 'SystemAdmins',
    component: () => import('@/views/system/admins/List.vue'),
    meta: {
      title: '平台管理员',
      icon: 'UserFilled',
      requiresAuth: true,
      roles: ['SUPER'],
      menuGroup: '系统管理',
    },
  },
  {
    path: 'settings/base',
    name: 'SystemSettingsBase',
    component: () => import('@/views/system/settings/Base.vue'),
    meta: {
      title: '基础配置',
      icon: 'Setting',
      requiresAuth: true,
      roles: ['SUPER', 'ADMIN'],
      menuGroup: '系统管理',
    },
  },
  {
    path: 'logs/operations',
    name: 'SystemLogOperations',
    component: () => import('@/views/system/logs/Operation.vue'),
    meta: {
      title: '操作日志',
      icon: 'Document',
      requiresAuth: true,
      roles: ['SUPER'],
      menuGroup: '系统管理',
    },
  },
  {
    path: 'logs/logins',
    name: 'SystemLogLogins',
    component: () => import('@/views/system/logs/Login.vue'),
    meta: {
      title: '登录日志',
      icon: 'Lock',
      requiresAuth: true,
      roles: ['SUPER'],
      menuGroup: '系统管理',
    },
  },
]

export const hiddenSystemRoutes = [
  {
    path: 'clubs/new',
    name: 'SystemClubCreate',
    component: () => import('@/views/system/clubs/ClubForm.vue'),
    meta: {
      title: '创建社团',
      requiresAuth: true,
      roles: ['SUPER', 'ADMIN'],
      hidden: true,
    },
  },
  {
    path: 'clubs/:id',
    name: 'SystemClubDetail',
    component: () => import('@/views/system/clubs/ClubDetail.vue'),
    meta: {
      title: '社团详情',
      requiresAuth: true,
      roles: ['SUPER', 'ADMIN'],
      hidden: true,
      activePath: '/clubs',
    },
  },
  {
    path: 'clubs/:id/edit',
    name: 'SystemClubEdit',
    component: () => import('@/views/system/clubs/ClubForm.vue'),
    meta: {
      title: '编辑社团',
      requiresAuth: true,
      roles: ['SUPER', 'ADMIN'],
      hidden: true,
      activePath: '/clubs',
    },
  },
  {
    path: 'users/:id',
    name: 'SystemUserDetail',
    component: () => import('@/views/system/users/Detail.vue'),
    meta: {
      title: '用户详情',
      requiresAuth: true,
      roles: ['SUPER', 'ADMIN'],
      hidden: true,
      activePath: '/users',
    },
  },
  {
    path: 'activities/:id',
    name: 'SystemActivityDetail',
    component: () => import('@/views/system/activities/Detail.vue'),
    meta: {
      title: '活动详情',
      requiresAuth: true,
      roles: ['SUPER', 'ADMIN'],
      hidden: true,
      activePath: '/activities',
    },
  },
  {
    path: 'recruitment/configs/:id',
    name: 'SystemRecruitConfigEdit',
    component: () => import('@/views/system/recruitment/ConfigForm.vue'),
    meta: {
      title: '配置详情',
      requiresAuth: true,
      roles: ['SUPER', 'ADMIN'],
      hidden: true,
      activePath: '/recruitment/configs',
    },
  },
  {
    path: 'recruitment/audit/:id',
    name: 'SystemRecruitAuditDetail',
    component: () => import('@/views/system/recruitment/AuditDetail.vue'),
    meta: {
      title: '审核详情',
      requiresAuth: true,
      roles: ['SUPER', 'ADMIN'],
      hidden: true,
      activePath: '/recruitment/audit',
    },
  },
  {
    path: 'account/password',
    name: 'SystemPassword',
    component: () => import('@/views/system/Password.vue'),
    meta: {
      title: '修改密码',
      requiresAuth: true,
      roles: ['SUPER', 'ADMIN'],
      hidden: true,
    },
  },
]

export default [...systemMenuRoutes, ...hiddenSystemRoutes]

