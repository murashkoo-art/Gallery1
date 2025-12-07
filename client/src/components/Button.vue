<template>
  <button 
    :type="type"
    :class="['golden-button', variant, { loading, disabled }]" 
    :disabled="disabled || loading"
    :aria-label="text"
    :aria-disabled="disabled || loading"
    @click="handleClick"
    v-bind="$attrs"
  >
    <slot></slot>
    <span v-if="loading" class="loader"></span>
    {{ loading ? loadingText : text }}
  </button>
</template>

<script>
export default {
  name: 'GoldenButton',
  inheritAttrs: false,
  props: {
    text: {
      type: String,
      required: true
    },
    variant: {
      type: String,
      default: 'primary',
      validator: (value) => ['primary', 'secondary', 'outline'].includes(value)
    },
    type: { 
      type: String,
      default: 'button',
      validator: (value) => ['button', 'submit', 'reset'].includes(value)
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    loadingText: {
      type: String,
      default: 'Загрузка...'
    }
  },
  emits: ['click'],
  methods: {
    handleClick(event) {
      if (!this.disabled && !this.loading) {
        this.$emit('click', event)
      }
    }
  }
}
</script>

<style scoped>
.golden-button {
  padding: 12px 32px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: inherit;
}

.primary {
  background: linear-gradient(135deg, #d4af37, #b8941f);
  color: white;
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}

.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(10px);
}

.secondary:hover {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.5);
}

.outline {
  background: transparent;
  color: #d4af37;
  border: 2px solid #d4af37;
}

.outline:hover {
  background: #d4af37;
  color: white;
}
</style>