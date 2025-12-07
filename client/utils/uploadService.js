class UploadService {
  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
  console.log('Base URL for uploads:', this.baseURL);
  console.log('VITE_API_URL from env:', import.meta.env.VITE_API_URL);
  }
  
  /**
   * Загрузка файла на сервер
   */
async uploadFile(file, type = 'avatar', options = {}) {
  try {
    console.log('Starting file upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadType: type
    });

    // Валидация файла
    this.validateFile(file, type);

    const formData = new FormData();
    if (type === 'avatar') {
      formData.append('avatar', file);  // для аватара
    } else {
      formData.append('file', file);    // для других типов
    }
    formData.append('type', type);
    
    let token = null;
    const currentUserStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (currentUserStr) {
      try {
        const currentUser = JSON.parse(currentUserStr);
        token = currentUser.token;
        console.log('Token extracted from currentUser:', token ? 'YES' : 'NO');
      } catch (e) {
        console.error('Error parsing currentUser:', e);
      }
    }


    console.log(' FormData contents for type:', type);
    for (let pair of formData.entries()) {
      console.log(pair[0] + ':', typeof pair[1] === 'object' ? pair[1].name || 'File' : pair[1]);
    }
    console.log('Token exists:', !!token);
    console.log('Checking token sources:');
    console.log('localStorage token:', localStorage.getItem('token'));
    console.log('sessionStorage token:', sessionStorage.getItem('token'));
    console.log('localStorage currentUser:', localStorage.getItem('currentUser'));
    console.log('sessionStorage currentUser:', sessionStorage.getItem('currentUser'));
    console.log('Full URL:', `${this.baseURL}/upload`);
    console.log('Making request to:', `${this.baseURL}/upload`);
    
    const endpoint = type === 'avatar' ? '/users/avatar' : '/upload';
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    console.log('Response status:', response.status);
    
    // Проверим content-type перед парсингом
    const contentType = response.headers.get('content-type');
    console.log('Response content-type:', contentType);
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
        console.log('Server error details (upload):', errorData);
      } catch (e) {
        const text = await response.text();
        console.error('Server returned text:', text.substring(0, 500));
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      throw new Error(errorData.message || errorData.error || `Ошибка загрузки: ${response.status}`);
    }

    // Проверяем что ответ JSON
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Expected JSON but got:', text.substring(0, 200));
      throw new Error('Server returned non-JSON response');
    }

    const result = await response.json();
    console.log('Upload successful:', result);
    return result;
    
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
}

  /**
   * Загрузка аватара пользователя
   */
  async uploadAvatar(file, userId) {
    return this.uploadFile(file, 'avatar', { userId });
  }

  /**
   * Удаление файла
   */
  async deleteFile(fileUrl, type = 'avatar') {
    try {
      let token = null;
      const currentUserStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
      if (currentUserStr) {
        try {
          const currentUser = JSON.parse(currentUserStr);
          token = currentUser.token;
        } catch (e) {
          console.error('Error parsing currentUser:', e);
        }
      }
      const endpoint = type === 'avatar' ? '/users/avatar' : '/upload';
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          fileUrl,
          type
        })
      });

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
          console.log('Delete error details:', errorData);
          throw new Error(errorData.message || errorData.error || `Ошибка удаления: ${response.status}`);
        } catch (e) {
          const text = await response.text();
          console.error('Server returned text on delete:', text);
          throw new Error(`Ошибка удаления: ${response.status} ${response.statusText}`);
        }
      }

      return await response.json();
      
    } catch (error) {
      console.error('Delete file error:', error);
      throw error;
    }
  }

  /**
   * Валидация файла
   */
  validateFile(file, type = 'avatar') {
    const config = this.getUploadConfig(type);
    
    if (file.size > config.maxSize) {
      throw new Error(`Файл слишком большой. Максимальный размер: ${config.maxSize / 1024 / 1024}MB`);
    }

    const fileExtension = file.name.split('.').pop().toLowerCase();
    if (!config.allowedTypes.includes(file.type) && !config.allowedExtensions.includes(fileExtension)) {
      throw new Error(`Недопустимый формат файла. Разрешены: ${config.allowedExtensions.join(', ')}`);
    }
  }

  /**
   * Конфигурация загрузки по типам
   */
  getUploadConfig(type) {
    const configs = {
      avatar: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
        allowedExtensions: ['jpg', 'jpeg', 'png', 'webp']
      },
      artwork: {
        maxSize: 20 * 1024 * 1024, // 20MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'gif']
      }
    };

    return configs[type] || configs.avatar;
  }

  /**
   * Создание preview изображения
   */
  createImagePreview(file, maxWidth = 300, maxHeight = 300) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      reader.onload = (e) => {
        img.onload = () => {
          let { width, height } = img;
          
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        };

        img.onerror = reject;
        img.src = e.target.result;
      };

      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Создаем и экспортируем экземпляр сервиса
export const uploadService = new UploadService();