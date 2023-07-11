<template>
  <el-main>
    <div class="mb-5">
      <el-button type="primary" @click="openDialog">
        Thêm thống kê
      </el-button>
    </div>
    <el-divider content-position="center">Thống kê ngày</el-divider>
    <div class="max-w-sm m-auto">
      <el-card v-if="statisticalData.length > 0">
        <div
          class="grid gap-2 grid-cols-2"
          :class="{ 'mb-3': index < Object.values(byDate).length - 1 }"
          v-for="(value, key, index) in byDate"
        >
          <NuxtLink class="underline" :to="{ path: `date/${key}`}" >{{ moment(key).format("DD/MM/YYYY") }}</NuxtLink>
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
          <el-button
            @click="editContent(item)"
            type="primary"
            :icon="Edit"
            circle
          />
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
          value-format="YYYY/MM/DD"
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
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogFormVisible = false">Huỷ</el-button>
        <el-button
          type="primary"
          @click="onSubmit(ruleFormRef)"
          :loading="loading"
        >
          Xác nhận
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules } from "element-plus";
import { createClient } from "@supabase/supabase-js";
import moment from "moment";
import { Edit, Money } from "@element-plus/icons-vue";
import { groupBy } from "lodash";

interface RuleForm {
  id?: any;
  content: string;
  date: string;
  money: number;
  type: string;
  spendingType: string;
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

const ruleFormRef = ref<FormInstance>();
const statisticalData: any = ref([]);
const fetchData: any = ref([]);
const byDate: any = ref([]);
const loading = ref(false);
const dialogFormVisible = ref(false);

const formInline = reactive<RuleForm>({
  id: null,
  content: "",
  date: moment().format(),
  money: 0,
  type: "",
  spendingType: "",
});

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

      if (formData.id) {
        const { data, error } = await supabase
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

        const { data, error } = await supabase
          .from("finance_log")
          .insert([formData])
          .select();

        ElMessage({
          message: "Đã thêm thành công",
          type: "success",
        });
      }

      formEl.resetFields();
      getFinanceLog();

      dialogFormVisible.value = false;
      loading.value = false;
    } else {
      loading.value = false;
      console.log("error submit!", fields);
    }
  });
};

async function getFinanceLog() {
  loading.value = true;

  const { data } = await supabase
    .from("finance_log")
    .select()
    .order("created_at", { ascending: true });

  fetchData.value = data;
  byDate.value = groupBy(data, "date");

  handleCurrentChange(0);

  loading.value = false;
}

const editContent = (data: RuleForm) => {
  formInline.id = data.id;
  formInline.content = data.content;
  formInline.date = data.date;
  formInline.money = data.money;
  formInline.type = data.type;
  formInline.spendingType = data.spendingType;

  dialogFormVisible.value = true;
};

const closeDialog = (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  dialogFormVisible.value = false;
  formEl.resetFields();

  formInline.id = null;
  formInline.content = "";
  formInline.date = "";
  formInline.money = 0;
  formInline.type = "";
  formInline.spendingType = "";
};

const openDialog = () => {
  dialogFormVisible.value = true;
};

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

<style>
.el-overlay-dialog {
  padding: 0 15px;
}

.dialog-custom {
  max-width: 100%;
}
</style>
