<template>
  <el-main>
    <div class="container">
      <div class="mb-5 text-right">
        <el-button :color="COLOR_BTN" @click="openDialog">
          Thêm thống kê
        </el-button>
      </div>
      <el-divider content-position="center">Lọc theo tháng</el-divider>
      <el-card class="mt-5 max-w-fit mx-auto">
        <el-date-picker
          v-model="monthSelected"
          type="month"
          placeholder="Chọn tháng"
          @change="handleSelectMonth"
        />
      </el-card>
      <template v-if="Object.values(fetchData).length > 0">
        <el-divider content-position="left">Chi tiết thống kê</el-divider>
        <div class="grid gap-4 sm:grid-cols-2 grid-cols-1">
          <template v-for="item in fetchData">
            <CardItem :item="item" @clicked="editRecord" />
          </template>
        </div>
        <div class="mt-5">
          <el-pagination
            :small="true"
            v-model:current-page="currentPage"
            v-if="totalRecord > 10"
            class="justify-center"
            layout="prev, pager, next"
            :total="totalRecord"
            @current-change="queryData"
          />
        </div>
      </template>
      <template v-else>
        <div v-if="!loading" class="text-xl mt-6 text-center max-w-lg mx-auto">
          <img src="/no-data.svg" alt="no data" />
        </div>
      </template>
    </div>
  </el-main>
  <el-dialog
    v-model="dialogFormVisible"
    @close="closeDialog(ruleFormRef)"
    width="500px"
    class="dialog-custom"
  >
    <el-form
      label-position="top"
      :model="formInline"
      label-width="90px"
      ref="ruleFormRef"
      :rules="rules"
    >
      <el-form-item label="Nội dung" prop="content">
        <el-input
          v-model="formInline.content"
          placeholder="Nội dung"
          clearable
        />
      </el-form-item>
      <el-form-item label="Chọn ngày" prop="date">
        <el-date-picker
          v-model="formInline.date"
          type="date"
          placeholder="Chọn ngày"
          format="DD/MM/YYYY"
          value-format="YYYY-MM-DD"
          clearable
        />
      </el-form-item>
      <el-form-item label="Loại" prop="type">
        <el-select
          v-model="formInline.type"
          filterable
          allow-create
          default-first-option
          :reserve-keyword="false"
          placeholder="Chọn loại"
        >
          <el-option
            v-for="item in options"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Loại chi tiêu" prop="spendingType">
        <el-select
          v-model="formInline.spendingType"
          filterable
          allow-create
          default-first-option
          :reserve-keyword="false"
          placeholder="Chọn loại chi tiêu"
        >
          <el-option
            v-for="item in spendingOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="Số tiền" prop="money" style="width: 100%">
        <el-input-number
          v-model="formInline.money"
          placeholder="Số tiền"
          clearable
        />
      </el-form-item>
      <el-form-item label="Hẹn hò">
        <el-switch v-model="formInline.dating" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Huỷ</el-button>
        <el-button
          type="primary"
          @click="onSubmit(ruleFormRef)"
          :loading="loading"
          :color="COLOR_BTN"
        >
          Xác nhận
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules } from "element-plus";
import { COLOR_BTN } from "~/constants";
import { ElLoading } from "element-plus";

const { $supabase } = useNuxtApp();
const dayjs = useDayjs();
const optionsLoading = {
  customClass: "custom-loading",
};

interface RuleForm {
  id?: number;
  content: string;
  date: string;
  money: number;
  type: string;
  spendingType: string;
  dating: boolean;
}

const options = [
  {
    value: "wallet",
    label: "Ví",
  },
  {
    value: "momo",
    label: "Momo",
  },
  {
    value: "vcb",
    label: "VCB",
  },
];

const spendingOptions = [
  {
    value: "rent",
    label: "Thuê nhà",
  },
  {
    value: "hangout",
    label: "Đi chơi",
  },
  {
    value: "eat",
    label: "Ăn uống",
  },
  {
    value: "personal",
    label: "Cá nhân",
  },
];

const ruleFormRef = ref<FormInstance>();
const dialogFormVisible = ref(false);
const fetchData: any = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const totalRecord: any = ref();
const monthSelected= ref('')
const dateFilter = ref({
  year: 0,
  month: 0,
  endOfDate: 0
})

const formInline = reactive<RuleForm>({
  id: 0,
  content: "",
  date: dayjs().format(),
  money: 0,
  type: "",
  spendingType: "",
  dating: false,
});

const checkMoney = (rule: any, value: any, callback: any) => {
  if (!value) {
    return callback(new Error("Vui lòng nhập số tiền"));
  }
  setTimeout(() => {
    if (!Number.isInteger(value)) {
      callback(new Error("Vui lòng nhập số"));
    } else {
      if (value < 1000) {
        callback(new Error("Số tiền phải lớn hơn 1000đ"));
      } else {
        callback();
      }
    }
  }, 1000);
};

const rules = reactive<FormRules<RuleForm>>({
  content: [
    { required: true, message: "Vui lòng nhập nội dung", trigger: "blur" },
  ],
  money: [{ required: true, validator: checkMoney, trigger: "blur" }],
  type: [
    {
      required: true,
      message: "Vui lòng chọn loại",
      trigger: "change",
    },
  ],
});

const onSubmit = async (formEl: FormInstance | undefined) => {
  loading.value = true;

  if (!formEl) return;
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      const formData = {
        ...formInline,
      };

      if (formData.id !== 0) {
        await $supabase
          .from("finance_log")
          .update(formData)
          .eq("id", formData.id)
          .select();

        ElMessage({
          message: "Đã sửa thành công",
          type: "success",
        });
      } else {
        delete formData.id;

        await $supabase
          .from("finance_log")
          .insert([formData])
          .select();

        ElMessage({
          message: "Đã thêm thành công",
          type: "success",
        });
      }

      formEl.resetFields();
      queryData();

      dialogFormVisible.value = false;
      loading.value = false;
      currentPage.value = 1;
    } else {
      loading.value = false;
      console.log("error submit!", fields);
    }
  });
};

const queryData = async (page: number = 1) => {
  ElLoading.service(optionsLoading);
  loading.value = true;

  const { start, end } = getRangePage(page)
  let query = $supabase
    .from("finance_log")
    .select("*", { count: "exact" })
    .range(start, end)
    .order("date", { ascending: false })

  if(dateFilter.value.year > 0) {
    query = query
    .gte("date", `${dateFilter.value.year}-${dateFilter.value.month}-01`)
    .lte("date", `${dateFilter.value.year}-${dateFilter.value.month}-${dateFilter.value.endOfDate}`)
  }

  const { data, count} = await query;

  totalRecord.value = count;
  fetchData.value = data;
  
  loading.value = false;
  ElLoading.service().close();
}

const getRangePage = (val: number) => {
  const start = val === 0 ? 0 : (val - 1) * 10;
  const end = start + 9;

  return {
    start,
    end
  }
};

const editRecord = (data: RuleForm) => {
  formInline.id = data.id;
  formInline.content = data.content;
  formInline.date = data.date;
  formInline.money = data.money;
  formInline.type = data.type;
  formInline.spendingType = data.spendingType;
  formInline.dating = data.dating;

  dialogFormVisible.value = true;
};

const closeDialog = (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  dialogFormVisible.value = false;
  formEl.resetFields();

  formInline.id = 0;
  formInline.content = "";
  formInline.money = 0;
  formInline.type = "";
  formInline.spendingType = "";
  formInline.dating = false;
};

const openDialog = () => {
  dialogFormVisible.value = true;
};

const handleSelectMonth = (date: any) => {
  const month = dayjs(date).get('month') + 1;
  const year = dayjs(date).get('year');
  const endOfDate = dayjs(date).endOf('month').get('date');

  dateFilter.value.year = year
  dateFilter.value.month = month
  dateFilter.value.endOfDate = endOfDate

  queryData();
}

onMounted(() => {
  queryData();
});
</script>