<template>
  <div class="right-column">
    <div class="security-panel">
      <h3 class="panel-title">Безопасность</h3>
      
      <div class="security-actions">
        <button class="security-button" @click="openChangeLogin">
          Изменить логин
        </button>
        <button class="security-button" @click="openChangePassword">
          Изменить пароль
        </button>
        <button class="security-button" @click="openChangeEmail">
          Изменить email
        </button>
      </div>

      <button class="logout-button-outline" @click="$emit('logout')">
        Выйти из аккаунта
      </button>

      <button class="delete-account-button" @click="openDeleteAccount">
        Удалить аккаунт
      </button>
    </div>
    
   <ChangePasswordModal
      v-if="showPasswordModal"
      :is-open="showPasswordModal"
      @close="closeModals"
      @submit="handleChangePassword"
    />
    
    <ChangeEmailModal
      v-if="showEmailModal"
      :is-open="showEmailModal"
      :current-email="currentEmail"
      @close="closeModals"
      @submit="handleChangeEmail"
    />
    
    <ChangeUsernameModal
      v-if="showLoginModal"
      :is-open="showLoginModal"
      :current-username="currentUsername"
      @close="closeModals"
      @submit="handleChangeUsername"
    />
    
    <DeleteAccountModal
      v-if="showDeleteAccountModal"
      :is-open="showDeleteAccountModal"
      :current-email="currentEmail"
      @close="closeModals"
      @submit="handleDeleteAccount"
    />
  </div>
</template>

<script>
import ChangePasswordModal from '../components/ChangePasswordModal.vue'
import ChangeEmailModal from '../components/ChangeEmailModal.vue'
import ChangeUsernameModal from '../components/ChangeUsernameModal.vue'
import DeleteAccountModal from '../components/DeleteAccountModal.vue'

export default {
  name: 'ProfileSecurityPanel',
  components: {
    ChangePasswordModal,
    ChangeEmailModal,
    ChangeUsernameModal,
    DeleteAccountModal
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      showPasswordModal: false,
      showEmailModal: false,
      showLoginModal: false,
      showDeleteAccountModal: false
    }
  },
  computed: {
    currentEmail() {
      return this.user?.email || '';
    },
    currentUsername() {
      return this.user?.username || '';
    }
  },
  methods: {
    openChangeLogin() {
      this.showLoginModal = true;
    },
    
    openChangePassword() {
      this.showPasswordModal = true;
    },
    
    openChangeEmail() {
      this.showEmailModal = true;
    },
    
    closeModals() {
      this.showPasswordModal = false;
      this.showEmailModal = false;
      this.showLoginModal = false;
      this.showDeleteAccountModal = false;
    },

    async handleDeleteAccount(accountData) {
     try {
    await this.$emit('delete-account', accountData);
      } catch (error) {
    throw error;
       }
    },

    openDeleteAccount() {
    this.showDeleteAccountModal = true;
    },
    
    async handleChangePassword(passwordData) {
      try {
        await this.$emit('change-password', passwordData);
      } catch (error) {
        throw error;
      }
    },
    
    async handleChangeEmail(emailData) {
      try {
        await this.$emit('change-email', emailData);
      } catch (error) {
        throw error;
      }
    },
    
    async handleChangeUsername(usernameData) {
      try {
        await this.$emit('change-username', usernameData);
      } catch (error) {
        throw error;
      }
    }
  },
  emits: ['logout', 'change-password', 'change-email', 'change-username', 'delete-account']
}
</script>

<style scoped>
.right-column {
  flex: 0 0 200px;
  min-width: 180px;
}

.security-panel {
  background: #fffbf0;
  padding: 1rem;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(184, 134, 11, 0.1);
  border: 1px solid #f1e8d0;
  margin-bottom: 1rem;
}

.panel-title {
  margin: 0 0 1rem 0;
  font-size: 1rem;
  color: #8b6914;
  border-bottom: 2px solid #d4af37;
  padding-bottom: 0.4rem;
}

.security-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.8rem;
}

.security-button {
  padding: 0.5rem;
  border: 1px solid #d4af37;
  background: #fffbf0;
  color: #8b6914;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.3s ease;
  text-align: left;
}

.security-button:hover {
  background: #d4af37;
  color: white;
}

.logout-button-outline {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #8b4513;
  background: #fff8dc;
  color: #8b4513;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.3s ease;
}

.logout-button-outline:hover {
  background: #8b4513;
  color: white;
}

@media (max-width: 1024px) {
  .right-column {
    flex: 0 0 180px;
    min-width: 160px;
  }
}

@media (max-width: 768px) {
  .right-column {
    flex: none;
    width: 100%;
    max-width: none;
    min-width: auto;
  }
}

.delete-account-button {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #dc3545;
  background: #fff;
  color: #dc3545;
  border-radius: 3px;
  cursor: pointer;
  font-size: 0.75rem;
  margin-top: 0.8rem;
  transition: all 0.3s ease;
}

.delete-account-button:hover {
  background: #dc3545;
  color: white;
}

</style>