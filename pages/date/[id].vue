<template>
  <el-main>
    <div class="mt-2">
      <NuxtLink to="/" class="flex items-center"> <el-icon class="el-icon--left"><ArrowLeftBold /></el-icon> Trở về</NuxtLink>
    </div>
    <el-divider content-position="center">Thống kê ngày</el-divider>
    <div class="max-w-sm m-auto">
      <el-card v-if="statisticalData.length > 0">
        <div
          class="grid gap-2 grid-cols-2"
          :class="{ 'mb-3': index < Object.values(byDate).length - 1 }"
          v-for="(value, key, index) in byDate"
        >
          <p>{{ moment(key).format("DD/MM/YYYY") }}</p>
          <el-text type="danger" class="font-medium text-right">
            - {{ onCalculator(value).toLocaleString("it-IT") }} VND
            <el-icon><Money /></el-icon>
          </el-text>
        </div>
      </el-card>
    </div>
    <el-divider content-position="left">Chi tiết thống kê</el-divider>
    <div class="grid gap-4 sm:grid-cols-2 grid-cols-1">
      <el-card v-for="item in statisticalData">
        <div class="flex justify-between">
          <div>
            <el-tag :type="'success'" class="mr-2">{{
              genType(item.type)
            }}</el-tag>
            <el-tag disable-transitions>{{
              genSpendingType(item.spendingType)
            }}</el-tag>
          </div>
        </div>
        <div class="mt-4">
          <p>{{ moment(item.date).format("DD/MM/YYYY") }}</p>
        </div>
        <div class="grid gap-2 sm:grid-cols-2 grid-cols-1 mt-2">
          <div class="w-full">
            <p>
              {{ item.content }}
            </p>
          </div>
          <div class="text-right font-medium">
            <el-text type="danger"
              >- {{ item.money.toLocaleString("it-IT") }} VND
              <el-icon><Money /></el-icon
            ></el-text>
          </div>
        </div>
      </el-card>
    </div>
    <div class="mt-5">
      <el-pagination
        v-if="statisticalData.length > 0"
        class="justify-center"
        layout="prev, pager, next"
        :total="fetchData.length"
        @current-change="handleCurrentChange"
      />
    </div>
  </el-main>
</template>

<script lang="ts" setup>
import { createClient } from "@supabase/supabase-js";
import moment from "moment";
import { Money, ArrowLeftBold } from "@element-plus/icons-vue";
import { groupBy } from "lodash";

const route = useRoute()

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

const statisticalData: any = ref([]);
const fetchData: any = ref([]);
const byDate: any = ref([]);
const loading = ref(false);

const runtimeConfig = useRuntimeConfig();
const supabase = createClient(
  `${runtimeConfig.public.supabase.url}`,
  `${runtimeConfig.public.supabase.key}`,
  {
    auth: {
      persistSession: false,
    },
  }
);

async function getFinanceLog() {
  loading.value = true;
  const date = route.params.id

  const { data } = await supabase
    .from("finance_log")
    .select()
    .eq('date', date)
    .order("created_at", { ascending: true });

  fetchData.value = data;
  byDate.value = groupBy(data, "date");

  handleCurrentChange(0);

  loading.value = false;
}

const handleCurrentChange = (val: number) => {
  const start = val === 0 ? 0 : (val - 1) * 10;
  const end = start + 10;
  statisticalData.value = fetchData.value.slice(start, end);
};

const onCalculator = (item: any) => {
  return item.reduce((prev: any, next: any) => {
    return prev + next.money;
  }, 0);
};

onMounted(() => {
  getFinanceLog();
});
</script>
