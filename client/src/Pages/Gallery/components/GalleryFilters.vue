<!-- client/src/Pages/Gallery/components/GalleryFilters.vue -->
<template>
  <div class="gallery-filters">
    <div class="filter-group">
      <select v-model="localFilters.artist" @change="emitFilters">
        <option value="">Все художники</option>
        <option value="1">Винсент Ван Гог</option>
        <option value="2">Леонардо да Винчи</option>
        <option value="3">Эдвард Мунк</option>
      </select>
      
      <select v-model="localFilters.style" @change="emitFilters">
        <option value="">Все стили</option>
        <option value="Пост-импрессионизм">Пост-импрессионизм</option>
        <option value="Ренессанс">Ренессанс</option>
        <option value="Экспрессионизм">Экспрессионизм</option>
      </select>
      
      <input 
        type="number" 
        v-model="localFilters.year" 
        placeholder="Год"
        @input="emitFilters"
      />
      
      <button @click="resetFilters" class="reset-btn">
        Сбросить фильтры
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GalleryFilters',
  props: {
    filters: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      localFilters: { ...this.filters }
    }
  },
  watch: {
    filters: {
      handler(newFilters) {
        this.localFilters = { ...newFilters }
      },
      deep: true
    }
  },
  methods: {
    emitFilters() {
      this.$emit('filter-change', { ...this.localFilters })
    },
    resetFilters() {
      this.localFilters = {
        artist: null,
        exhibition: null,
        year: null,
        style: null
      }
      this.emitFilters()
    }
  }
}
</script>

<style scoped>
.gallery-filters {
  margin-bottom: 3rem;
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, #fff9e6 0%, #fff5d9 100%);
  border-radius: 12px;
  border: 1px solid #e6d8b5;
  box-shadow: 0 5px 20px rgba(212, 175, 55, 0.1);
}

.filter-group {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group select,
.filter-group input {
  padding: 0.875rem 1.25rem;
  border: 2px solid #e6d8b5;
  border-radius: 8px;
  font-size: 1rem;
  min-width: 200px;
  background: white;
  color: #8b6914;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.08);
  font-family: inherit;
}

.filter-group select:focus,
.filter-group input:focus {
  outline: none;
  border-color: #d4af37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.2);
  background: #fffdf6;
}

.filter-group select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%23d4af37' viewBox='0 0 16 16'%3E%3Cpath d='M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 16px;
  padding-right: 2.5rem;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;
}

.filter-group select option {
  background: white;
  color: #8b6914;
  padding: 0.5rem;
}

.filter-group select:hover {
  border-color: #d4af37;
}

.filter-group input {
  padding: 0.875rem 1.25rem;
  color: #8b6914;
}

.filter-group input::placeholder {
  color: #a88b3a;
  opacity: 0.7;
}

.reset-btn {
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #d4af37 0%, #c19b2e 100%);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.5px;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.reset-btn:hover {
  background: linear-gradient(135deg, #c19b2e 0%, #b08c25 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(212, 175, 55, 0.4);
}

.reset-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(212, 175, 55, 0.3);
}

/* Стили для заголовка фильтров */
.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #e6d8b5;
}

.filters-header h3 {
  margin: 0;
  color: #8b6914;
  font-size: 1.3rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

/* Стили для чекбоксов/радио кнопок если понадобятся */
.filter-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  color: #8b6914;
  font-weight: 500;
  padding: 0.5rem 0;
}

.filter-checkbox input[type="checkbox"],
.filter-checkbox input[type="radio"] {
  width: 1.2rem;
  height: 1.2rem;
  accent-color: #d4af37;
  cursor: pointer;
}

/* Адаптивность */
@media (max-width: 768px) {
  .gallery-filters {
    padding: 1.25rem;
    margin-bottom: 2rem;
  }
  
  .filter-group {
    gap: 1rem;
  }
  
  .filter-group select,
  .filter-group input {
    min-width: calc(50% - 0.5rem);
    flex: 1 1 calc(50% - 0.5rem);
  }
  
  .reset-btn {
    width: 100%;
    justify-content: center;
    margin-top: 0.5rem;
  }
}

@media (max-width: 480px) {
  .filter-group {
    flex-direction: column;
  }
  
  .filter-group select,
  .filter-group input {
    width: 100%;
    min-width: 100%;
  }
  
  .filters-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .reset-btn {
    align-self: stretch;
  }
}

/* Анимация для появления фильтров */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.gallery-filters {
  animation: fadeIn 0.5s ease-out;
}
</style>