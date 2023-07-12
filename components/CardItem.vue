<template>
  <el-card>
    <div class="flex justify-between">
      <DateCard :date="item.date" :dating="item.dating" />
      <el-button v-if="!isDateDetail" @click="editRecord(item)" type="primary" :icon="Edit" circle />
    </div>
    <div class="grid gap-2 sm:grid-cols-2 grid-cols-1 mt-4">
      <div class="w-full">
        <p>
          {{ item.content }}
        </p>
      </div>
      <MoneyCard :money="item.money" />
      <div class="grid gap-2 grid-cols-2 mt-2">
        <el-tag :type="'success'">{{ genType(item.type) }}</el-tag>
        <el-tag disable-transitions>{{
          genSpendingType(item.spendingType)
        }}</el-tag>
      </div>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { Edit } from "@element-plus/icons-vue";
import DateCard from "./DateCard.vue";

const emit = defineEmits(["clicked"]);
const { item, isDateDetail } = defineProps(["item", "isDateDetail"]);

const genType = ($value: string) => {
  switch ($value) {
    case "wallet":
      return "Ví";
    case "momo":
      return "Momo";
    case "vcb":
      return "VCB";
  }
};

const genSpendingType = ($value: string) => {
  switch ($value) {
    case "eat":
      return "Ăn uống";
    case "hangout":
      return "Đi chơi";
    case "rent":
      return "Thuê nhà";
    case "personal":
      return "Cá nhân";
    default:
      return "Linh tinh";
  }
};

const editRecord = (item: any) => {
  emit("clicked", item);
};
</script>
