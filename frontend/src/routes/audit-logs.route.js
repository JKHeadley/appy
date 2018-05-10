import AuditLogs from '../components/views/audit-logs/AuditLogs.vue'

const routes = [
  {
    path: 'audit-logs',
    component: AuditLogs,
    name: 'AuditLogs',
    meta: {
      description: 'List of audit logs',
      title: 'AuditLogs',
      requiresAuth: true
    }
  }
]

export default routes
