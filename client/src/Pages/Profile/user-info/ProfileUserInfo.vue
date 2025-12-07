<template>
  <div class="profile-content">
    <!-- Левая колонка - Аватар -->
    <ProfileAvatar 
      :user="user" 
      @avatar-updated="handleAvatarUpdate"
    />
    
    <!-- Центральная колонка - Основная информация -->
    <ProfileInfoPanel 
      :user="user" 
      @edit-profile="enableEditing"
    />
    
    <!-- Правая колонка - Безопасность -->
    <ProfileSecurityPanel 
      :user="user"
      @logout="$emit('logout')"
      @change-password="handleChangePassword"
      @change-email="handleChangeEmail"
      @change-username="handleChangeUsername"
    />

    <!-- Модальное окно редактирования -->
    <ProfileEditModal
      :is-editing="isEditing"
      :is-saving="isSaving"
      :user="user"
      :edited-user="editedUser"
      :has-changes="hasChanges"
      @save-changes="saveChanges"
      @cancel-editing="cancelEditing"
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
import ProfileAvatar from './ProfileAvatar.vue' 
import ProfileInfoPanel from './ProfileInfoPanel.vue'  
import ProfileSecurityPanel from './ProfileSecurityPanel.vue' 
import ProfileEditModal from './ProfileEditModal.vue'  

export default {
  name: 'ProfileUserInfo',
  components: {
    ProfileAvatar,
    ProfileInfoPanel,
    ProfileSecurityPanel,
    ProfileEditModal
  },
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      isEditing: false,
      isSaving: false,
      editedUser: {
        username: '',
        first_name: '',
        last_name: '',
        phone: '',
        email: ''
      }
    }
  },
  computed: {
    hasChanges() {
      return (
        this.editedUser.first_name !== (this.user.first_name || '') ||
        this.editedUser.last_name !== (this.user.last_name || '') ||
        this.editedUser.phone !== (this.user.phone || '') ||
        this.editedUser.email !== (this.user.email || '')
      );
    }
  },
  methods: {
    enableEditing() {
      this.editedUser = {
        first_name: this.user.first_name || '',
        last_name: this.user.last_name || '',
        phone: this.user.phone || '',
      };
      this.isEditing = true;
    },

    cancelEditing() {
      this.isEditing = false;
      this.isSaving = false;
    },

    async saveChanges() {
      if (!this.hasChanges) {
        this.isEditing = false;
        return;
      }
      
      this.isSaving = true;
      
      try {
        console.log('Emitting update-user with data:', this.editedUser);
        await this.$emit('update-user', this.editedUser);
        this.isEditing = false;
        console.log('Edit form closed');
      } catch (error) {
        console.error('Ошибка при сохранении:', error);
      } finally {
        this.isSaving = false;
      }
    },

    handleChangePassword(passwordData) {
      this.$emit('change-password', passwordData);
    },
    
    handleChangeEmail(emailData) {
      this.$emit('change-email', emailData);
    },
    
    handleChangeUsername(usernameData) {
      this.$emit('change-username', usernameData);
    },
    
    handleAvatarUpdate({ avatar }) {
      console.log('handleAvatarUpdate received avatar:', avatar);
        
      // Только эмитим родителю, НЕ изменяем props
        this.$emit('update-user', { avatar });
      },
    
    handleDeleteAccount(accountData) {
      this.$emit('delete-account', accountData);
    }

  },


  emits: ['logout', 'update-user', 'change-password', 'change-email', 'change-username', 'delete-account']
}
</script>

<style scoped>
.profile-content {
  display: flex;
  gap: 1rem;
  margin: 0;
  padding: 1rem 0.5rem;
  align-items: flex-start;
  max-width: none;
  width: auto;
  justify-content: flex-start;
}

/* Принудительно смещаем весь контент влево */
body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

#app {
  margin: 0;
  padding: 0;
}

@media (max-width: 1024px) {
  .profile-content {
    padding: 0.8rem 0.3rem;
    gap: 0.8rem;
  }
}

@media (max-width: 768px) {
  .profile-content {
    flex-direction: column;
    padding: 0.8rem;
    gap: 0.8rem;
  }
}
</style>