
<template>
  <div class="access-request-button">
    <button 
      class="request-btn"
      @click="showModal = true"
    >
      <span class="btn-text">Запросить повышенный доступ</span>
    </button>
    
    <!-- Модальное окно -->
    <RequestAccessModal
      v-if="showModal"
      :is-visible="showModal"
      @close="closeModal"
      @request-submitted="handleRequestSubmitted"
    />
  </div>
</template>

<script>
import RequestAccessModal from '../user-info/RequestAccessModal.vue'

export default {
  name: 'AccessRequestButton',
  components: {
    RequestAccessModal
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showModal: false
    }
  },
  methods: {
    closeModal() {
      this.showModal = false
    },
    
    handleRequestSubmitted(request) {
      this.$emit('request-submitted', request)
    }
  },
  emits: ['request-submitted']
}
</script>

<style scoped>
.access-request-button {
  width: 100%;
  margin-top: 0.5rem;
}

.request-btn {
  width: 100%;
  padding: 0.8rem 1.2rem;
  background: linear-gradient(135deg, #d4af37, #b8860b);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(184, 134, 11, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.3);
}

.request-btn:hover {
  background: linear-gradient(135deg, #b8860b, #8b6914);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(184, 134, 11, 0.3);
  border-color: rgba(212, 175, 55, 0.5);
}

.request-btn:active {
  transform: translateY(0);
}

.request-btn:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(184, 134, 11, 0.3);
}

.btn-icon {
  font-size: 1.1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff8e1;
}

.btn-text {
  flex: 1;
  text-align: center;
  letter-spacing: 0.3px;
  text-shadow: 0 1px 1px rgba(139, 105, 20, 0.3);
}

/* Адаптивность */
@media (max-width: 768px) {
  .request-btn {
    padding: 0.7rem 1rem;
    font-size: 0.9rem;
  }
  
  .btn-icon {
    font-size: 1rem;
  }
}

/* Состояние disabled (если потребуется) */
.request-btn:disabled {
  background: linear-gradient(135deg, #e0c98c, #c0a66b);
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
  border-color: rgba(212, 175, 55, 0.2);
  color: rgba(255, 255, 255, 0.7);
}
</style>