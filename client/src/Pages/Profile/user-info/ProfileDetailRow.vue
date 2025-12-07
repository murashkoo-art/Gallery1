<template>
  <div class="detail-row">
    <span class="detail-label">{{ label }}</span>
    <span class="detail-value" :class="{ 'empty-field': !value }">
      {{ value || 'Не указан' }}
    </span>
  </div>
</template>

<script>
export default {
  name: 'ProfileDetailRow',
  props: {
    label: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      default: ''
    }
  }
}
</script>

<style scoped>
.detail-row {
  display: flex;
  margin-bottom: 0.6rem;
  padding-bottom: 0.6rem;
  border-bottom: 1px solid #f1e8d0;
  font-size: 0.85rem;
}

.detail-label {
  flex: 0 0 120px;
  font-weight: 500;
  color: #b8860b;
}

.detail-value {
  flex: 1;
  color: #5d4c1d;
}

.empty-field {
  color: #cdb87d;
  font-style: italic;
}
</style>