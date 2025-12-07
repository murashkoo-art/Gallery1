<template>
  <div class="profile" :key="authKey">
    <!-- Если пользователь не авторизован -->
    <template v-if="!currentUser">
      <!-- Форма входа -->
      <ProfileLogin 
        v-if="!showRegister"
        @login="handleLogin"
        @switch-to-register="showRegister = true"
        :loading="loading"
      />
      
      <!-- Форма регистрации -->
      <ProfileRegister 
        v-if="showRegister"
        @register="handleRegister"
        @switch-to-login="showRegister = false"
        :loading="loading"
      />
    </template>

    <!-- Если пользователь авторизован -->
    <template v-else>
      <ProfileUserInfo 
        :user="currentUser"
        @logout="handleLogout"
        @update-user="handleUpdateUser"
        @change-password="handleChangePassword"
        @change-email="handleChangeEmail"
        @change-username="handleChangeUsername"
        @delete-account="handleDeleteAccount"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { apiService } from '/utils/api.js'
import ProfileLogin from './auth/ProfileLogin.vue'
import ProfileRegister from './auth/ProfileRegister.vue'
import ProfileUserInfo from './user-info/ProfileUserInfo.vue'

const route = useRoute()
const router = useRouter()

const currentUser = ref(null)
const showRegister = ref(false)
const loading = ref(false)
const authKey = ref(Date.now())

// Обрабатываем параметры URL при загрузке и изменении маршрута
const handleRouteParams = () => {
  if (route.query.form === 'register') {
    showRegister.value = true
  } else {
    showRegister.value = false
  }
}

// Следим за изменениями маршрута
watch(
  () => route.query,
  () => {
    handleRouteParams()
  }
);

// Методы
const loadSavedUser = async () => {
  const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser')
  if (savedUser) {
    try {
      currentUser.value = JSON.parse(savedUser)
      await loadUserProfile()
    } catch (error) {
      console.error('Error loading saved user:', error)
      clearUserData()
    }
  } else {
    // Если пользователь не авторизован, обрабатываем параметры URL
    handleRouteParams()
  }
}

const handleLogin = async (loginData) => {
  try {
    loading.value = true
    const response = await apiService.login(loginData)
    console.log('After login - API token:', apiService.token ? 'SET' : 'NOT SET');
    currentUser.value = response.user || response.data
    if (response.token) {
      currentUser.value.token = response.token;
    }
    if (loginData.rememberMe) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    } else {
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    }
    
    await loadUserProfile()
    
    // Очищаем параметры URL после успешного входа
    router.replace('/profile')
  } catch (error) {
    throw new Error(error.message || 'Неверный email или пароль')
  } finally {
    loading.value = false
  }
}

const handleRegister = async (registerData) => {
  try {
    loading.value = true
    const response = await apiService.register(registerData)
    
    // После успешной регистрации автоматически логинимся
    if (response.user) {
      currentUser.value = response.user
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
      
      // Очищаем параметры URL после успешной регистрации
      router.replace('/profile')
    }
    
    return response
  } catch (error) {
    throw new Error(error.message || 'Ошибка при регистрации')
  } finally {
    loading.value = false
  }
}

const handleUpdateUser = async (updatedData) => {
  try {
    loading.value = true
    
    // Если обновляется только аватар
    if (updatedData.avatar !== undefined && Object.keys(updatedData).length === 1) {
      // Аватар уже загружен/удален через отдельные endpoints
      // Просто обновляем локальное состояние
      currentUser.value = { 
        ...currentUser.value, 
        avatar: updatedData.avatar  // ТОЛЬКО аватар
      };
      
      // Обновляем данные в хранилище
      if (localStorage.getItem('currentUser')) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
      } else {
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser.value))
      }
      
      loading.value = false;
      return { success: true };
    }
    
    // Для других данных - обычный запрос
    const response = await apiService.updateUserProfile(updatedData);
    
    currentUser.value = { 
      ...currentUser.value, 
      ...updatedData,
      ...(response.user || response.data || response)
    }
    
    // Обновляем данные в хранилище
    if (localStorage.getItem('currentUser')) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    } else {
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    }
    
    return response
  } catch (error) {
    throw new Error(error.message || 'Ошибка при обновлении профиля')
  } finally {
    loading.value = false
  }
}

const clearUserData = () => {
  console.log('Clearing user data...');
  currentUser.value = null
  localStorage.removeItem('currentUser')
  sessionStorage.removeItem('currentUser')
  showRegister.value = false
  // Также очищаем токен в apiService если есть
  if (apiService.token) {
    apiService.token = null;
    }
};

const handleLogout = () => {
  console.log('Logging out...');
  
  clearUserData();
  
  // Обновляем ключ для принудительного ререндера
  authKey.value = Date.now();
  
  // Сбрасываем showRegister
  showRegister.value = false;
  
  console.log('Logout complete');
  console.log('currentUser after logout:', currentUser.value);
  console.log('!currentUser value:', !currentUser.value);
  
  // Явная навигация
  router.push('/profile');
};

const loadUserProfile = async () => {
  if (!currentUser.value || !currentUser.value.id) return
  
  try {
    const response = await apiService.getUserProfile()
    Object.assign(currentUser.value, response.user || response.data)
    
    // Сохраняем обновленные данные
    if (localStorage.getItem('currentUser')) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    } else {
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    }
  } catch (error) {
    console.error('Error loading profile:', error)
  }
}

const handleChangePassword = async (passwordData) => {
  try {
    loading.value = true;
    await apiService.changePassword(passwordData);
  } catch (error) {
    throw new Error(error.message || 'Ошибка при изменении пароля');
  } finally {
    loading.value = false;
  }
};

const handleChangeEmail = async (emailData) => {
  try {
    loading.value = true;
    const response = await apiService.changeEmail(emailData);
    
    // Обновляем локальное состояние
    currentUser.value = { 
      ...currentUser.value, 
      email: emailData.email,
      email_verified: false
    };
    
    // Обновляем хранилище
    if (localStorage.getItem('currentUser')) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    } else {
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    }
    
    return response;
  } catch (error) {
    throw new Error(error.message || 'Ошибка при изменении email');
  } finally {
    loading.value = false;
  }
};

const handleChangeUsername = async (usernameData) => {
  try {
    loading.value = true;
    const response = await apiService.changeUsername(usernameData);
    
    // Обновляем локальное состояние
    currentUser.value = { 
      ...currentUser.value, 
      username: usernameData.username
    };
    
    // Обновляем хранилище
    if (localStorage.getItem('currentUser')) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    } else {
      sessionStorage.setItem('currentUser', JSON.stringify(currentUser.value))
    }
    
    return response;
  } catch (error) {
    throw new Error(error.message || 'Ошибка при изменении логина');
  } finally {
    loading.value = false;
  }
};

const handleDeleteAccount = async (accountData) => {
  try {
    loading.value = true;
    
    // Дополнительное подтверждение
    if (!confirm('Вы уверены? Это действие нельзя отменить! Все ваши данные будут удалены.')) {
      loading.value = false;
      return;
    }
    
    await apiService.deleteAccount(accountData);
    
    // Очищаем данные и выходим
    clearUserData();
    showRegister.value = false;
    
    // Показываем сообщение
    alert('Аккаунт успешно удален');
    
    // Редирект на главную
    router.replace('/');
    
  } catch (error) {
    throw new Error(error.message || 'Ошибка при удалении аккаунта');
  } finally {
    loading.value = false;
  }
};

// Хук жизненного цикла
onMounted(async () => {
  await loadSavedUser()
})
</script>

<style scoped>
.profile {
  max-width: 400px;
  margin: 0 auto;
  padding: 2rem;
}
</style>