<template>
  <el-main>
    <div class="container">
      <div class="mt-2">
        <NuxtLink to="/" class="flex items-center">
          <el-icon class="el-icon--left"><ArrowLeftBold /></el-icon>
          Trở về
        </NuxtLink>
      </div>
      <FilterByDate :date="$route.params.id" />
      <template v-if="Object.values(byDate).length > 0">
        <PerDateValue :dateData="byDate" />
        <el-divider content-position="left">Chi tiết thống kê</el-divider>
        <div class="grid gap-4 sm:grid-cols-2 grid-cols-1">
          <template v-for="item in statisticalData">
            <CardItem :item="item" :isDateDetail="true" />
          </template>
        </div>
        <div class="mt-5">
          <el-pagination
            v-if="fetchData.length > 10"
            class="justify-center"
            layout="prev, pager, next"
            :total="fetchData.length"
            @current-change="handleCurrentChange"
          />
        </div>
      </template>
      <template v-else>
        <div v-if="!loading" class="text-center max-w-lg mx-auto">
          <img src="/no-data.svg" alt="no data" />
        </div>
      </template>
    </div>
  </el-main>
</template>

<script lang="ts" setup>
import { ArrowLeftBold } from "@element-plus/icons-vue";
import { groupBy } from "lodash";
import { ElLoading } from "element-plus";

const route = useRoute();
const { $supabase } = useNuxtApp();

const statisticalData: any = ref([]);
const fetchData: any = ref([]);
const byDate: any = ref([]);
const loading = ref(false);
const options = {
  customClass: "custom-loading",
};

async function getFinanceLog() {
  ElLoading.service(options);
  loading.value = true;
  const date = route.params.id;

  if (date !== 'null') {
    const { data } = await $supabase
      .from("finance_log")
      .select()
      .eq("date", date)
      .order("created_at", { ascending: true });

    fetchData.value = data;
    byDate.value = groupBy(data, "date");

    handleCurrentChange(0);
  }

  loading.value = false;
  ElLoading.service().close();
}

const handleCurrentChange = (val: number) => {
  const start = val === 0 ? 0 : (val - 1) * 10;
  const end = start + 10;
  statisticalData.value = fetchData.value.slice(start, end);
};

onMounted(() => {
  getFinanceLog();
});
</script>
