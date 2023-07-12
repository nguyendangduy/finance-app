<template>
  <div class="flex items-center text-right font-medium justify-end">
    <el-text type="danger">
      - {{ money.toLocaleString("it-IT") }}
    </el-text>
    <img src="/insert-coin.png" alt="insert coin" width="25" />
  </div>
</template>

<script lang="ts" setup>

  const { money } = defineProps(['money'])

</script>