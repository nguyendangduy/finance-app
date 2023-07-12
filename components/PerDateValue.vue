<template>
  <el-divider content-position="center">Thống kê ngày</el-divider>
    <div class="max-w-sm m-auto">
      <el-card v-if="Object.values(dateData).length > 0">
        <div
          class="grid gap-2 grid-cols-2"
          :class="{ 'mb-3': index < Object.values(dateData).length - 1 }"
          v-for="(value, key, index) in dateData"
        >
          <NuxtLink class="underline" :to="`date/${key}`" >{{ moment(key).format("DD/MM/YYYY") }}</NuxtLink>
          <el-text type="danger" class="font-medium text-right">
            - {{ onCalculator(value).toLocaleString("it-IT") }} VND
            <el-icon><Money /></el-icon>
          </el-text>
        </div>
      </el-card>
    </div>
</template>

<script lang="ts" setup>
import moment from "moment";
import { Money } from "@element-plus/icons-vue";

const { dateData } = defineProps(['dateData'])

const onCalculator = (item: any) => {
  return item.reduce((prev: any, next: any) => {
    return prev + next.money;
  }, 0);
};
</script>