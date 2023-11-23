<template>
  <h1>{{ name }}</h1>
  <p>12323<span>666</span></p>
  <hello-world></hello-world>
  <div class="test"></div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import HelloWorld from './HelloWorld.vue'
const name = ref('wjw')
</script>

<style lang="scss" scoped>
p {
  font-size: 20px;
  span {
    font-size: 10px;
  }
}
</style>
