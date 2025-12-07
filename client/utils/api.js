// App/utils/api.js
class ApiService {
  constructor() {
    //на основе текущего домена
    this.baseURL = window.location.origin;
    this.token = null;
    
    // Восстанавливаем токен при инициализации
    const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.token = user.token || user.access_token;
      } catch (error) {
        console.error('Error parsing saved user:', error);
      }
    }
  }

  async request(endpoint, options = {}) {
    try {
      console.log('Making request to:', endpoint);
      console.log('Current token:', this.token ? 'YES' : 'NO');
      const url = `${this.baseURL}${endpoint}`;
      
      // Добавляем токен в заголовки, если он есть
      const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
        console.log('Sending Authorization header with token');
      } else {
        console.log('No token available!');
      }
      
      console.log('📨 Request headers:', headers);
      
      // ВАЖНО: Добавляем credentials
      const config = {
        ...options,
        headers,
        credentials: 'include' // ← ЭТА СТРОЧКА ОБЯЗАТЕЛЬНА
      };
      
      const response = await fetch(url, config);
      
      // Логируем ответ
      console.log(`Response status: ${response.status} ${response.statusText}`);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  setToken(token) {
    this.token = token;
    console.log('Token set:', token ? token.substring(0, 20) + '...' : 'NULL');
  }

  clearToken() {
    this.token = null;
  }

  // Регистрация
  async register(userData) {
    const response = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response;
  }

  // Вход
  async login(credentials) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    console.log('Login response token:', response.token ? 'RECEIVED' : 'MISSING');
    // Сохраняем токен если он есть в ответе
    if (response.token || response.access_token) {
      this.setToken(response.token || response.access_token);
    }
    
    return response;
  }


  // Получить профиль пользователя
  async getUserProfile() { 
    return this.request('/api/users/profile');
  }


  // Обновить профиль
  async updateUserProfile(profileData) {  
      console.log('Updating profile with data:', profileData);
      return this.request('/api/users/profile', {  
          method: 'PUT',
          body: JSON.stringify(profileData),
      });
  }
  // Изменить email
  async changeEmail(emailData) {
    return this.request('/api/users/email', {
      method: 'PUT',
      body: JSON.stringify(emailData),
    });
  }

    // Изменить логин (username)
    async changeUsername(usernameData) {
      return this.request('/api/users/username', {
        method: 'PUT',
        body: JSON.stringify(usernameData),
      });
    }

  // Изменить пароль
  async changePassword(passwordData) {
    return this.request('/api/users/password', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }


  // Получить всех пользователей (для админа)
  async getAllUsers() {
    return this.request('/api/users');
  }

  // Удалить аккаунт
    async deleteAccount(accountData) {
      return this.request('/api/users/account', {
        method: 'DELETE',
        body: JSON.stringify(accountData),
      });
    }

  // Выход
  logout() {
    this.clearToken();
  }
  
  

}

export const apiService = new ApiService();
export default apiService;