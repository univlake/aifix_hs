// 权限后缀（module.action 中的 action）→ 中文
export const ACTION_LABELS: Record<string, string> = {
    list: '列表',
    create: '新增',
    update: '编辑',
    delete: '删除',
    manage: '管理',
    view: '查看',
    review: '审核',
    assign: '分配',
    tree: '树形',
    portrait: '画像',
    file: '文件上传',
    oss: 'OSS上传',
};

// 权限模块 slug → 中文；与侧边栏 / 模块目录保持一致，客户无需查数据库就能看懂权限
export const MODULE_LABELS: Record<string, string> = {
    // 系统
    users: '账号管理',
    roles: '角色管理',
    permissions: '权限管理',
    'base-data': '基础数据',
    upload: '文件上传',
    homes: '仪表板',
    todos: '待办事项',

    // 企业与人员
    companies: '企业管理',
    personnels: '人员管理',
    'company-map': '企业地图',
    'focus-companies': '重点监管企业',
    'enterprise-report': '企业报表',

    // 安全架构与标准
    'safety-architectures': '安全生产组织架构',
    'production-standardizations': '安全生产标准化',
    'occupational-health-safeties': '职业健康安全管理体系',
    'safety-management': '安全管理人员',
    'certificate-statuses': '持证情况',
    'elimination-control-staff': '淘汰控制人员',

    // 单位
    'skill-units': '技术服务单位',
    'design-units': '设计单位',
    'evaluation-units': '施工单位',

    // 备案/变更
    'filing-permissions': '安全资质管理',
    'change-manages': '变更管理',
    'three-togethers': '三同时管理',

    // 建筑与作业
    buildings: '建筑物及构筑物',
    'job-management': '作业管理',
    'space-works': '有限空间辨识',

    // 设备与危化
    'special-equipment': '特种设备',
    'special-equipment-staff': '特种设备人员',
    'dangerous-equipment': '重大危险设备',
    'hazardous-chemicals': '危险化学品',
    'hazardous-processes': '较大危险工艺',
    'major-hazards': '重大危险源',
    'major-hazardous-processes': '重点监管危险工艺',

    // 职业健康
    'occupational-hazards': '职业危害因素清单',
    'health-systems': '职业健康体系',
    'health-files': '健康档案',
    'health-reports': '职业病报告',
    'health-checkups': '健康检查',
    'hygiene-evaluations': '职业健康评估检测',

    // 消防与应急
    'fire-safeties': '消防安全管理',
    'fire-equipment': '消防器材',
    'fire-facilities': '消防设施',
    'emergency-drills': '应急演练',
    'emergency-supplies': '应急物资',
    'emergency-teams': '应急队伍',

    // 培训
    'internal-trainings': '内部培训',
    'external-trainings': '外部培训',
    'other-trainings': '相关方培训',
    'training-files': '培训资料',
    'training-videos': '培训视频',

    // 会议与通知
    meetings: '会议',
    'meeting-sign-ups': '会议报名',
    'internal-meetings': '内部会议',
    'office-notifies': '任务型通知公告',
    'new-notifies': '通知型通知公告',

    // 投入
    'security-investments': '安全投入',
    'funding-executions': '经费执行情况',

    // 隐患与风险
    'hidden-danger-infos': '隐患信息',
    'rectification-sheets': '整改单',
    'rectification-sheet-count': '整改单统计',
    hazards: '风险源管理',
    risks: '风险管理',
    'risk-logs': '风险监测预警',
    'inherent-risk-logs': '固有风险日志',
    'float-risk-logs': '动态风险日志',
    'risk-distribution-maps': '企业分布图',
    'monthly-investigations': '隐患管理',

    // 事故与统计
    'accident-bulletins': '事故上报',
    'information-drafts': '信息稿件管理',
    'expert-inspections': '专家检查',
    'month-statistics': '月度数据上报',
    'year-statistics': '年度数据上报',

    // 考核
    'daily-checks': '日常检查',
    'daily-check-templates': '日常检查模板',
    'accident-checks': '安全生产体系考核',
    'accident-check-templates': '安全生产体系考核模板',
    'add-points': '加分项考核',
    'add-points-templates': '加分项考核模板管理',
    'norm-checks': '标准化管理体系检查',
    'system-checks': '活动材料及上报考核',

    // 集团
    'bloc-experts': '专家库',
    'bloc-risks': '风险监控',
    'bloc-notices': '集团通知',
    'bloc-accident-bulletins': '集团事故快报',

    // 其他
    'checklist-libraries': '检查表库',
    'assess-detects': '安全评价与检测',
    'regulation-libraries': '法律法规库',
    'online-inspection': '在线巡检',
};

export function formatModule(name: string): string {
    if (MODULE_LABELS[name]) {
        return MODULE_LABELS[name];
    }

    return name
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

export function formatAction(action: string): string {
    return ACTION_LABELS[action] ?? action;
}
