<!-- D:\dev\proj\art_gallery\client\src\Pages\Profile\users\AccessRequestsAdmin.vue -->
<template>
  <div class="access-requests-admin">
    <div class="admin-header">
      <h2>Управление заявками на доступ</h2>
      <p class="admin-subtitle">Рассмотрение заявок на роль художника или куратора</p>
    </div>
    
    <!-- Фильтры и статистика -->
    <div class="admin-controls">
      <div class="filters">
        <div class="filter-item">
          <label>Статус:</label>
          <select v-model="filters.status" class="filter-select">
            <option value="">Все заявки</option>
            <option value="pending">Ожидают рассмотрения</option>
            <option value="approved">Одобренные</option>
            <option value="rejected">Отклоненные</option>
            <option value="cancelled">Отмененные</option>
          </select>
        </div>
        
        <div class="filter-item">
          <label>Роль:</label>
          <select v-model="filters.requestedRole" class="filter-select">
            <option value="">Все роли</option>
            <option value="artist">Художник</option>
            <option value="curator">Куратор</option>
          </select>
        </div>
        
        <button class="btn-refresh" @click="refreshData" :disabled="loading">
          <span v-if="loading">⟳</span>
          <span v-else>Обновить</span>
        </button>
      </div>
      
      <div class="stats-cards">
        <div class="stat-card" v-for="stat in stats" :key="`${stat.requested_role}-${stat.status}`">
          <div class="stat-value">{{ stat.count }}</div>
          <div class="stat-label">{{ formatRole(stat.requested_role) }} ({{ stat.status }})</div>
        </div>
      </div>
    </div>
    
    <!-- Список заявок -->
    <div class="requests-container">
      <div v-if="loading" class="loading-admin">
        <div class="spinner-admin"></div>
        <p>Загрузка заявок...</p>
      </div>
      
      <div v-else-if="requests.length === 0" class="no-requests-admin">
        <p>Заявки не найдены</p>
      </div>
      
      <div v-else class="requests-list-admin">
        <div 
          class="request-card-admin" 
          v-for="request in requests" 
          :key="request.id"
          :class="`status-${request.status}`"
        >
          <div class="request-header-admin">
            <div class="user-info-admin">
              <div class="user-name-admin">
                {{ request.user_first_name }} {{ request.user_last_name }}
              </div>
              <div class="user-email-admin">{{ request.user_email }}</div>
              <div class="user-current-role">
                Текущая роль: {{ formatRole(request.user_role_name) }}
              </div>
            </div>
            
            <div class="request-meta">
              <div class="request-role">
                Запрашивает: <strong>{{ formatRole(request.requested_role) }}</strong>
              </div>
              <div class="request-date">
                {{ formatDateTime(request.created_at) }}
              </div>
              <div class="request-status-badge" :class="`badge-${request.status}`">
                {{ formatStatus(request.status) }}
              </div>
            </div>
          </div>
          
          <div class="request-body-admin">
            <div v-if="request.message" class="request-message">
              <strong>Сообщение:</strong>
              <p>{{ request.message }}</p>
            </div>
            
            <div v-if="request.reviewed_by" class="review-info">
              <div class="review-details">
                <span><strong>Рассмотрено:</strong> {{ formatDateTime(request.reviewed_at) }}</span>
                <span><strong>Администратор:</strong> {{ request.reviewer_username }}</span>
              </div>
            </div>
            
            <div v-if="request.status === 'pending'" class="request-actions-admin">
              <button 
                class="btn-approve"
                @click="approveRequest(request.id)"
                :disabled="processingRequest === request.id"
              >
                <span v-if="processingRequest === request.id">✓</span>
                <span v-else>Одобрить</span>
              </button>
              <button 
                class="btn-reject"
                @click="rejectRequest(request.id)"
                :disabled="processingRequest === request.id"
              >
                <span v-if="processingRequest === request.id">✗</span>
                <span v-else>Отклонить</span>
              </button>
            </div>
            
            <div v-else class="request-result">
              <span v-if="request.status === 'approved'" class="result-approved">
                Заявка одобрена
              </span>
              <span v-else-if="request.status === 'rejected'" class="result-rejected">
                Заявка отклонена
              </span>
              <span v-else class="result-cancelled">
                Заявка отменена пользователем
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Модальное окно отклонения -->
    <div v-if="showRejectModal" class="modal-overlay-admin" @click.self="closeRejectModal">
      <div class="modal-content-admin">
        <div class="modal-header-admin">
          <h4>Отклонить заявку</h4>
          <button class="close-btn-admin" @click="closeRejectModal">&times;</button>
        </div>
        <div class="modal-body-admin">
          <p>Укажите причину отклонения (необязательно):</p>
          <textarea 
            v-model="rejectReason" 
            class="reject-textarea" 
            rows="3"
            placeholder="Причина отклонения..."
          ></textarea>
        </div>
        <div class="modal-footer-admin">
          <button class="btn-modal-cancel" @click="closeRejectModal">Отмена</button>
          <button class="btn-modal-reject" @click="confirmReject">Отклонить</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import api from '@api'

export default {
  name: 'AccessRequestsAdmin',
  data() {
    return {
      loading: false,
      requests: [],
      stats: [],
      filters: {
        status: '',
        requestedRole: ''
      },
      processingRequest: null,
      showRejectModal: false,
      rejectRequestId: null,
      rejectReason: ''
    }
  },
  mounted() {
    this.loadData()
  },
  watch: {
    filters: {
      handler() {
        this.loadRequests()
      },
      deep: true
    }
  },
  methods: {
    async loadData() {
      this.loading = true
      try {
        await Promise.all([
          this.loadRequests(),
          this.loadStats()
        ])
      } catch (error) {
        console.error('Error loading data:', error)
        this.showError('Не удалось загрузить данные')
      } finally {
        this.loading = false
      }
    },
    
    async loadRequests() {
      try {
        const params = {}
        if (this.filters.status) params.status = this.filters.status
        if (this.filters.requestedRole) params.requestedRole = this.filters.requestedRole
        
        const response = await api.get('/access/admin/requests', { params })
        this.requests = response.data.requests
      } catch (error) {
        console.error('Error loading requests:', error)
        throw error
      }
    },
    
    async loadStats() {
      try {
        const response = await api.get('/access/admin/requests/stats')
        this.stats = response.data.stats
      } catch (error) {
        console.error('Error loading stats:', error)
        throw error
      }
    },
    
    refreshData() {
      this.loadData()
    },
    
    async approveRequest(requestId) {
      if (!confirm('Одобрить эту заявку? Пользователь получит новые права.')) return
      
      try {
        this.processingRequest = requestId
        const response = await api.put(`/access/admin/requests/${requestId}/approve`)
        
        this.showSuccess(response.data.message)
        await this.loadData()
      } catch (error) {
        console.error('Error approving request:', error)
        this.showError(error.response?.data?.error || 'Ошибка при одобрении')
      } finally {
        this.processingRequest = null
      }
    },
    
    async rejectRequest(requestId) {
      this.rejectRequestId = requestId
      this.showRejectModal = true
    },
    
    async confirmReject() {
      try {
        this.processingRequest = this.rejectRequestId
        const response = await api.put(`/access/admin/requests/${this.rejectRequestId}/reject`, {
          reason: this.rejectReason
        })
        
        this.showSuccess(response.data.message)
        this.closeRejectModal()
        await this.loadData()
      } catch (error) {
        console.error('Error rejecting request:', error)
        this.showError('Ошибка при отклонении')
      } finally {
        this.processingRequest = null
      }
    },
    
    closeRejectModal() {
      this.showRejectModal = false
      this.rejectRequestId = null
      this.rejectReason = ''
    },
    
    formatRole(role) {
      const roles = {
        'artist': 'Художник',
        'curator': 'Куратор',
        'user': 'Пользователь',
        'admin': 'Администратор'
      }
      return roles[role] || role
    },
    
    formatStatus(status) {
      const statuses = {
        'pending': 'Ожидает',
        'approved': 'Одобрена',
        'rejected': 'Отклонена',
        'cancelled': 'Отменена'
      }
      return statuses[status] || status
    },
    
    formatDateTime(dateString) {
      if (!dateString) return ''
      try {
        const date = new Date(dateString)
        return date.toLocaleDateString('ru-RU', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      } catch (error) {
        return dateString
      }
    },
    
    showSuccess(message) {
      if (this.$notify) {
        this.$notify({
          title: 'Успешно',
          text: message,
          type: 'success'
        })
      } else {
        alert(message)
      }
    },
    
    showError(message) {
      if (this.$notify) {
        this.$notify({
          title: 'Ошибка',
          text: message,
          type: 'error'
        })
      } else {
        alert('Ошибка: ' + message)
      }
    }
  }
}
</script>

<style scoped>
.access-requests-admin {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.admin-header {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #eaeaea;
}

.admin-header h2 {
  margin: 0 0 0.5rem;
  color: #333;
  font-size: 1.5rem;
}

.admin-subtitle {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
}

/* Контролы и фильтры */
.admin-controls {
  margin-bottom: 2rem;
}

.filters {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  min-width: 150px;
}

.filter-item label {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 0.3rem;
  font-weight: 500;
}

.filter-select {
  padding: 0.6rem 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  color: #333;
  background: white;
  transition: border-color 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.btn-refresh {
  padding: 0.6rem 1.2rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s;
  height: 40px;
  min-width: 100px;
}

.btn-refresh:hover:not(:disabled) {
  background: #5a6268;
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Статистика */
.stats-cards {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.stat-card {
  background: #f8f9fa;
  border: 1px solid #eaeaea;
  border-radius: 6px;
  padding: 1rem;
  min-width: 120px;
  text-align: center;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: bold;
  color: #333;
  margin-bottom: 0.3rem;
}

.stat-label {
  font-size: 0.8rem;
  color: #666;
  line-height: 1.3;
}

/* Список заявок */
.requests-container {
  min-height: 300px;
}

.loading-admin {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
}

.spinner-admin {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 123, 255, 0.2);
  border-top-color: #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.no-requests-admin {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

/* Карточки заявок */
.requests-list-admin {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.request-card-admin {
  background: white;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  overflow: hidden;
  transition: box-shadow 0.2s;
}

.request-card-admin:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.request-card-admin.status-pending {
  border-left: 4px solid #ffc107;
}

.request-card-admin.status-approved {
  border-left: 4px solid #28a745;
}

.request-card-admin.status-rejected {
  border-left: 4px solid #dc3545;
}

.request-card-admin.status-cancelled {
  border-left: 4px solid #6c757d;
}

.request-header-admin {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.2rem;
  background: #fafafa;
  border-bottom: 1px solid #eaeaea;
  flex-wrap: wrap;
  gap: 1rem;
}

.user-info-admin {
  flex: 1;
  min-width: 200px;
}

.user-name-admin {
  font-weight: 600;
  color: #333;
  font-size: 1.1rem;
  margin-bottom: 0.3rem;
}

.user-email-admin {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
}

.user-current-role {
  font-size: 0.85rem;
  color: #6c757d;
}

.request-meta {
  text-align: right;
  min-width: 200px;
}

.request-role {
  font-size: 0.95rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.request-date {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 0.5rem;
}

.request-status-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.badge-pending {
  background: #fff3cd;
  color: #856404;
}

.badge-approved {
  background: #d4edda;
  color: #155724;
}

.badge-rejected {
  background: #f8d7da;
  color: #721c24;
}

.badge-cancelled {
  background: #e2e3e5;
  color: #383d41;
}

/* Тело заявки */
.request-body-admin {
  padding: 1.2rem;
}

.request-message {
  margin-bottom: 1.2rem;
}

.request-message strong {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-size: 0.9rem;
}

.request-message p {
  margin: 0;
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  background: #f8f9fa;
  padding: 0.8rem;
  border-radius: 4px;
  border: 1px solid #eaeaea;
}

.review-info {
  margin-bottom: 1.2rem;
  padding-top: 1rem;
  border-top: 1px dashed #eaeaea;
}

.review-details {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  font-size: 0.85rem;
  color: #666;
}

.review-details strong {
  color: #333;
}

/* Действия */
.request-actions-admin {
  display: flex;
  gap: 0.8rem;
  margin-top: 1rem;
}

.btn-approve {
  padding: 0.6rem 1.5rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s;
  min-width: 100px;
}

.btn-approve:hover:not(:disabled) {
  background: #218838;
}

.btn-reject {
  padding: 0.6rem 1.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s;
  min-width: 100px;
}

.btn-reject:hover:not(:disabled) {
  background: #c82333;
}

.btn-approve:disabled,
.btn-reject:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.request-result {
  margin-top: 1rem;
  padding: 0.8rem;
  border-radius: 4px;
  font-weight: 500;
}

.result-approved {
  color: #155724;
  background: #d4edda;
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
}

.result-rejected {
  color: #721c24;
  background: #f8d7da;
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
}

.result-cancelled {
  color: #383d41;
  background: #e2e3e5;
  display: inline-block;
  padding: 0.4rem 0.8rem;
  border-radius: 4px;
}

/* Модальное окно отклонения */
.modal-overlay-admin {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 1rem;
}

.modal-content-admin {
  background: white;
  border-radius: 8px;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.modal-header-admin {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  border-bottom: 1px solid #eaeaea;
}

.modal-header-admin h4 {
  margin: 0;
  color: #333;
}

.close-btn-admin {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  line-height: 1;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn-admin:hover {
  color: #333;
}

.modal-body-admin {
  padding: 1.5rem;
}

.modal-body-admin p {
  margin: 0 0 1rem;
  color: #333;
}

.reject-textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9rem;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
}

.reject-textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.modal-footer-admin {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #eaeaea;
}

.btn-modal-cancel {
  padding: 0.6rem 1.2rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-modal-cancel:hover {
  background: #5a6268;
}

.btn-modal-reject {
  padding: 0.6rem 1.2rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
}

.btn-modal-reject:hover {
  background: #c82333;
}

/* Адаптивность */
@media (max-width: 768px) {
  .request-header-admin {
    flex-direction: column;
  }
  
  .request-meta {
    text-align: left;
    width: 100%;
  }
  
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-item {
    width: 100%;
  }
  
  .btn-refresh {
    width: 100%;
  }
  
  .stats-cards {
    justify-content: center;
  }
}
</style>