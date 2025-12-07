<template>
  <div class="left-column">
    <div class="avatar-section">
      <div class="avatar-container" @click="triggerFileInput">
        <img 
          v-if="user.avatar && !previewUrl" 
          :src="user.avatar" 
          alt="Аватар пользователя" 
          class="avatar"
        >
        <div v-else-if="!previewUrl" class="avatar-placeholder">
          <i class="placeholder-icon">{{ userInitials }}</i>
        </div>
        
        <!-- Индикатор загрузки -->
        <div v-if="uploading" class="upload-overlay">
          <div class="spinner"></div>
          <span>Загрузка...</span>
        </div>
        
        <!-- Preview нового аватара -->
        <div v-if="previewUrl" class="preview-overlay">
          <img :src="previewUrl" alt="Preview" class="preview-image" />
          <div class="preview-actions">
            <button @click.stop="confirmUpload" class="confirm-btn">✓</button>
            <button @click.stop="cancelUpload" class="cancel-btn">✕</button>
          </div>
        </div>
      </div>
      
      <!-- Скрытый input для выбора файла -->
      <input
        ref="fileInput"
        type="file"
        accept="image/jpeg, image/png, image/webp"
        @change="handleFileSelect"
        style="display: none"
      />
      
      <div class="avatar-actions">
        <button 
          class="upload-button" 
          @click="triggerFileInput"
          :disabled="uploading"
        >
          {{ uploading ? 'Загрузка...' : 'Загрузить фото' }}
        </button>
        <button 
          class="delete-button" 
          v-if="user.avatar && !uploading" 
          @click="deleteAvatar"
          :disabled="uploading"
        >
          Удалить фото
        </button>
      </div>

      <!-- Сообщение об ошибке -->
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { uploadService } from '/utils/uploadService.js'

export default {
  name: 'ProfileAvatar',
  props: {
    user: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      uploading: false,
      previewUrl: null,
      selectedFile: null,
      error: null
    }
  },
  computed: {
    userInitials() {
      const first = this.user.first_name ? this.user.first_name[0].toUpperCase() : '';
      const last = this.user.last_name ? this.user.last_name[0].toUpperCase() : '';
      return first + last || '?';
    }
  }, 
  methods: {
    triggerFileInput() {
      if (this.uploading) return;
      this.$refs.fileInput.click();
    },

    async handleFileSelect(event) {
      const file = event.target.files[0];
      if (!file) return;

      try {
        this.error = null;
        this.selectedFile = file;
        // Создаем preview
        this.previewUrl = await uploadService.createImagePreview(file, 200, 200);
      } catch (error) {
        this.error = error.message;
        this.resetFileInput();
      }
    },

    async confirmUpload() {
      if (!this.selectedFile) return;
      
      this.uploading = true;
      this.error = null;

      try {
        const result = await uploadService.uploadAvatar(this.selectedFile, this.user.id);
        
        console.log('Upload result:', result);
        
        this.$emit('avatar-updated', {
          avatar: result.avatar,
          user: this.user,
          forceUpdate: true  // Добавляем флаг
        });
        
        this.resetUpload();
        
      } catch (error) {
        this.error = error.message;
      } finally {
        this.uploading = false;
      }
    },

    async deleteAvatar() {
      if (!this.user.avatar || !confirm('Удалить аватар?')) return;

      this.uploading = true;
      try {
        await uploadService.deleteFile(this.user.avatar, 'avatar');
        
        // Эмитим событие с force флагом
        this.$emit('avatar-updated', {
          avatar: null,
          user: this.user,
          forceUpdate: true  // Добавляем флаг
        });
        
      } catch (error) {
        this.error = error.message;
      } finally {
        this.uploading = false;
      }
    },

    cancelUpload() {
      this.resetUpload();
    },

    resetUpload() {
      this.previewUrl = null;
      this.selectedFile = null;
      this.resetFileInput();
    },

    resetFileInput() {
      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    }
  },
  emits: ['avatar-updated']
}
</script>

<style scoped>
.left-column {
  flex: 0 0 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-right: 0.5rem;
}

.avatar-section {
  text-align: center;
  margin-bottom: 1rem;
}

.avatar-container {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 0 0.8rem 0;
  background: #f8f4e9;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid #d4af37;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-container:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1e8d0;
  color: #b8860b;
  font-size: 1.4rem;
  font-weight: bold;
}

.avatar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  width: 100%;
}

.upload-button, .delete-button {
  padding: 0.3rem 0.6rem;
  border: 1px solid #d4af37;
  border-radius: 3px;
  background: #fffbf0;
  cursor: pointer;
  font-size: 0.75rem;
  color: #8b6914;
  transition: all 0.3s ease;
  width: 100%;
  text-align: center;
}

.upload-button:hover:not(:disabled) {
  background: #d4af37;
  color: white;
}

.upload-button:disabled,
.delete-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.delete-button {
  color: #8b4513;
  border-color: #8b4513;
  background: #fff8dc;
}

.delete-button:hover:not(:disabled) {
  background: #8b4513;
  color: white;
}

/* Стили для overlay элементов */
.upload-overlay,
.preview-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  border-radius: 50%;
}

.preview-overlay {
  background: rgba(0, 0, 0, 0.8);
}

.preview-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.preview-actions {
  position: absolute;
  bottom: 10px;
  display: flex;
  gap: 10px;
}

.confirm-btn,
.cancel-btn {
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.confirm-btn {
  background: #4CAF50;
  color: white;
}

.confirm-btn:hover {
  background: #45a049;
  transform: scale(1.1);
}

.cancel-btn {
  background: #f44336;
  color: white;
}

.cancel-btn:hover {
  background: #da190b;
  transform: scale(1.1);
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  margin-top: 8px;
  padding: 8px;
  background: #ffebee;
  color: #c62828;
  border: 1px solid #ffcdd2;
  border-radius: 4px;
  font-size: 0.8rem;
  text-align: center;
}

@media (max-width: 768px) {
  .left-column {
    flex: none;
    width: 100%;
    max-width: none;
    min-width: auto;
  }
  
  .avatar-section {
    text-align: center;
  }
  
  .avatar-container {
    margin: 0 auto 0.8rem auto;
  }
}
</style>