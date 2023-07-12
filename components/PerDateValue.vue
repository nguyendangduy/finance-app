<template>
  <el-divider content-position="center">Thống kê ngày</el-divider>
  <div class="max-w-sm m-auto">
    <el-card v-if="Object.values(dateData).length > 0">
      <div
        class="grid gap-2 grid-cols-2"
        :class="{ 'mb-3': index < Object.values(dateData).length - 1 }"
        v-for="(value, key, index) in dateData"
      >
        <DateCard :date="key" />
        <MoneyCard :money="onCalculator(value)" />
      </div>
    </el-card>
  </div>
</template>

<script lang="ts" setup>
const { dateData } = defineProps(["dateData"]);

const onCalculator = (item: any) => {
  return item.reduce((prev: any, next: any) => {
    return prev + next.money;
  }, 0);
};
</script>
