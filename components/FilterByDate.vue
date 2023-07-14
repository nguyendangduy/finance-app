<template>
  <el-divider content-position="center">Lọc theo ngày</el-divider>
    <el-card class="max-w-fit mx-auto">
      <el-date-picker
        v-model="dateSelected"
        type="date"
        placeholder="Chọn ngày"
        @change="handleSelectDate"
        format="DD/MM/YYYY"
        value-format="YYYY-MM-DD"
      />
    </el-card>
</template>

<script lang="ts" setup>
const dateSelected= ref('')
const { date } = defineProps(['date'])

const handleSelectDate = (date: any) => {
  navigateTo(`/date/${date}`)
}

onMounted(() => {
  dateSelected.value = date
});

</script>