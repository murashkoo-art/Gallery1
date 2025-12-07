<template>
  <div class="filters-container">
    <div class="filters-section">
      <!-- Категория -->
      <div class="filter-group">
        <label for="category-filter">Категория:</label>
        <select 
          id="category-filter" 
          v-model="localFilters.category" 
          class="filter-select"
          @change="emitFilters"
        >
          <option value="">Все категории</option>
          <option 
            v-for="category in categories" 
            :key="category.value" 
            :value="category.value"
          >
            {{ category.label }}
          </option>
        </select>
      </div>
      
      <!-- Дата -->
      <div class="filter-group">
        <label for="date-filter">Дата:</label>
        <select 
          id="date-filter" 
          v-model="localFilters.date" 
          class="filter-select"
          @change="emitFilters"
        >
          <option value="">За все время</option>
          <option 
            v-for="dateOption in dateOptions" 
            :key="dateOption.value" 
            :value="dateOption.value"
          >
            {{ dateOption.label }}
          </option>
        </select>
      </div>
      
      <!-- Сортировка -->
      <div class="filter-group">
        <label for="sort-filter">Сортировка:</label>
        <select 
          id="sort-filter" 
          v-model="localFilters.sort" 
          class="filter-select"
          @change="emitFilters"
        >
          <option 
            v-for="sortOption in sortOptions" 
            :key="sortOption.value" 
            :value="sortOption.value"
          >
            {{ sortOption.label }}
          </option>
        </select>
      </div>
      
      <!-- Кнопка сброса фильтров -->
      <button 
        v-if="hasActiveFilters" 
        @click="resetFilters" 
        class="reset-filters-btn"
        :title="resetTooltip"
      >
        <ResetIcon v-if="showResetIcon" />
        Сбросить фильтры
      </button>
    </div>
  </div>
</template>

<script>
import ResetIcon from '@/icons/ResetIcon.vue';

export default {
  name: 'GalleryFilters',
  components: {
    ResetIcon
  },
  props: {
    // Начальные значения фильтров
    initialFilters: {
      type: Object,
      default: () => ({
        category: '',
        date: '',
        sort: 'newest'
      })
    },
    
    // Кастомные опции для фильтров
    customCategories: {
      type: Array,
      default: () => []
    },
    
    customDateOptions: {
      type: Array,
      default: () => []
    },
    
    customSortOptions: {
      type: Array,
      default: () => []
    },
    
    // Показывать иконку сброса
    showResetIcon: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      localFilters: { ...this.initialFilters }
    };
  },
  computed: {
    // Опции категорий (можно переопределить через пропсы)
    categories() {
      if (this.customCategories.length > 0) {
        return this.customCategories;
      }
      
      return [
        { value: 'nature', label: 'Природа' },
        { value: 'portrait', label: 'Портреты' },
        { value: 'architecture', label: 'Архитектура' },
        { value: 'events', label: 'События' },
        { value: 'art', label: 'Искусство' },
        { value: 'food', label: 'Еда' }
      ];
    },
    
    // Опции дат
    dateOptions() {
      if (this.customDateOptions.length > 0) {
        return this.customDateOptions;
      }
      
      return [
        { value: 'today', label: 'Сегодня' },
        { value: 'week', label: 'За неделю' },
        { value: 'month', label: 'За месяц' },
        { value: 'year', label: 'За год' },
        { value: 'custom', label: 'Выбрать период...' }
      ];
    },
    
    // Опции сортировки
    sortOptions() {
      if (this.customSortOptions.length > 0) {
        return this.customSortOptions;
      }
      
      return [
        { value: 'newest', label: 'Сначала новые' },
        { value: 'oldest', label: 'Сначала старые' },
        { value: 'popular', label: 'По популярности' },
        { value: 'name_asc', label: 'По названию (А-Я)' },
        { value: 'name_desc', label: 'По названию (Я-А)' }
      ];
    },
    
    // Проверка активных фильтров
    hasActiveFilters() {
      return (
        this.localFilters.category || 
        this.localFilters.date || 
        this.localFilters.sort !== 'newest'
      );
    },
    
    // Тултип для кнопки сброса
    resetTooltip() {
      if (this.hasActiveFilters) {
        const activeFilters = [];
        if (this.localFilters.category) {
          const category = this.categories.find(c => c.value === this.localFilters.category);
          if (category) activeFilters.push(`Категория: ${category.label}`);
        }
        if (this.localFilters.date) {
          const date = this.dateOptions.find(d => d.value === this.localFilters.date);
          if (date) activeFilters.push(`Период: ${date.label}`);
        }
        if (this.localFilters.sort !== 'newest') {
          const sort = this.sortOptions.find(s => s.value === this.localFilters.sort);
          if (sort) activeFilters.push(`Сортировка: ${sort.label}`);
        }
        return `Сбросить фильтры: ${activeFilters.join(', ')}`;
      }
      return 'Сбросить фильтры';
    }
  },
  methods: {
    // Эмитим событие с текущими фильтрами
    emitFilters() {
      this.$emit('filters-changed', { ...this.localFilters });
    },
    
    // Сброс всех фильтров
    resetFilters() {
      this.localFilters = {
        category: '',
        date: '',
        sort: 'newest'
      };
      this.emitFilters();
    },
    
    // Метод для внешнего сброса фильтров
    reset() {
      this.resetFilters();
    },
    
    // Метод для обновления фильтров извне
    updateFilters(newFilters) {
      this.localFilters = { ...this.localFilters, ...newFilters };
      this.emitFilters();
    },
    
    // Получение текущих фильтров
    getCurrentFilters() {
      return { ...this.localFilters };
    }
  },
  watch: {
    // Реакция на изменение начальных фильтров
    initialFilters: {
      handler(newVal) {
        this.localFilters = { ...newVal };
      },
      deep: true
    }
  }
};
</script>

<style scoped>
.filters-container {
  flex: 1;
}

.filters-section {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-group label {
  font-size: 14px;
  color: #555;
  white-space: nowrap;
  font-weight: 500;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  min-width: 150px;
  transition: all 0.3s;
}

.filter-select:hover {
  border-color: #007bff;
}

.filter-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
}

.reset-filters-btn {
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #dc3545;
  color: #dc3545;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.reset-filters-btn:hover {
  background: #dc3545;
  color: white;
}

/* Адаптивность */
@media (max-width: 992px) {
  .filters-section {
    gap: 12px;
  }
  
  .filter-select {
    min-width: 130px;
  }
}

@media (max-width: 768px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-group label {
    margin-bottom: 4px;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .reset-filters-btn {
    width: 100%;
    justify-content: center;
    margin-top: 10px;
  }
}

@media (max-width: 480px) {
  .filters-section {
    gap: 10px;
  }
}
</style>