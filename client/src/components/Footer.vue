<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-section">
        <h4>Контакты</h4>
        <p>г. Москва, ул. Искусств, 1 618</p>
        <p>+7 (495) 123-45-67</p>
        <p>info@goldenratio.gallery</p>
      </div>
      
      <div class="footer-section">
        <h4>Ссылки</h4>
        <Navigation type="footer" :list-links="mainLinks" />
      </div>
      
      <div class="footer-section">
        <h4>Соцсети</h4>
        <div class="social-links">
          <a href="#" class="nav-link">MAX</a>
          <a href="#" class="nav-link">Одноклассники</a>
          <a href="#" class="nav-link">ВКонтакте</a>
        </div>
      </div>
    </div>
    
    <div class="footer-bottom">
      <p>© 2025 Golden Ratio Gallery. Все права защищены.</p>
    </div>
  </footer>
</template>

<script setup>
import Navigation from './Navigation.vue'

const mainLinks = [
  { path: '/', title: 'Главная' },
  { path: '/gallery', title: 'Галерея' },
  { path: '/profile', title: 'Профиль' }
]
</script>

<style scoped>
/* Футер */
.footer {
  background: #1a1a1a;
  color: white;
  padding: 3rem 0 1rem;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h4 {
  color: #d4af37;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}

.footer-section p {
  color: #ccc;
  margin-bottom: 0.5rem;
  display: block;
}

.social-links {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.social-links a {
  color: #ccc;
  text-decoration: none;
  transition: color 0.3s ease;
  display: block;
}

.social-links a:hover {
  color: #d4af37;
}

.footer-bottom {
  border-top: 1px solid #333;
  padding-top: 1rem;
  text-align: center;
  color: #666;
}

/* Адаптивность */
@media (max-width: 768px) {
  .footer-content {
    grid-template-columns: 1fr;
    text-align: center;
  }
}
</style>