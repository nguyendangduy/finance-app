<template>
  <el-main>
    <div class="mb-5">
      <el-button type="primary" @click="openDialog">
        Thêm thống kê
      </el-button>
    </div>
    <PerDateValue :dateData="byDate" />
    <el-divider content-position="left">Chi tiết thống kê</el-divider>
    <div class="grid gap-4 sm:grid-cols-2 grid-cols-1">
      <el-card v-for="item in statisticalData">
        <div class="flex justify-between">
          <div class="flex items-center">
            <img src="/calendar.png" alt="calendar" width="30" class="mr-2">
            <p class="font-medium">{{ moment(item.date).format("DD/MM/YYYY") }}</p>
            <svg v-if="item.dating" class="heart ml-2" viewBox="0 0 32 29.6">
              <path d="M23.6,0c-3.4,0-6.3,2.7-7.6,5.6C14.7,2.7,11.8,0,8.4,0C3.8,0,0,3.8,0,8.4c0,9.4,9.5,11.9,16,21.2
              c6.1-9.3,16-12.1,16-21.2C32,3.8,28.2,0,23.6,0z"/>
            </svg>
          </div>
          <el-button
            @click="editContent(item)"
            type="primary"
            :icon="Edit"
            circle
          />
        </div>
        <div class="grid gap-2 sm:grid-cols-2 grid-cols-1 mt-4">
          <div class="w-full">
            <p>
              {{ item.content }}
            </p>
          </div>
          <div class="flex items-center text-right font-medium justify-end">
            <el-text type="danger"> 
              - {{ item.money.toLocaleString("it-IT") }} VND
            </el-text>
            <img src="/insert-coin.png" alt="insert coin" width="25">
          </div>
          <div class="grid gap-2 grid-cols-2 mt-2">
            <el-tag :type="'success'">{{
              genType(item.type)
            }}</el-tag>
            <el-tag disable-transitions>{{
              genSpendingType(item.spendingType)
            }}</el-tag>
          </div>
        </div>
      </el-card>
    </div>
    <div class="mt-5">
      <el-pagination
        v-model:current-page="currentPage"
        v-if="statisticalData.length > 0"
        class="justify-center"
        layout="total, prev, pager, next"
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
  id?: number;
  content: string;
  date: string;
  money: number;
  type: string;
  spendingType: string;
  dating: boolean
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
const currentPage = ref(1)

const formInline = reactive<RuleForm>({
  id: 0,
  content: "",
  date: moment().format(),
  money: 0,
  type: "",
  spendingType: "",
  dating: false
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

      if (formData.id !== 0) {
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
      currentPage.value = 1
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
  formInline.dating = data.dating;

  dialogFormVisible.value = true;
};

const closeDialog = (formEl: FormInstance | undefined) => {
  if (!formEl) return;

  dialogFormVisible.value = false;
  formEl.resetFields();

  formInline.id = 0;
  formInline.content = "";
  formInline.date = "";
  formInline.money = 0;
  formInline.type = "";
  formInline.spendingType = "";
  formInline.dating = false
};

const openDialog = () => {
  dialogFormVisible.value = true;
};

const handleCurrentChange = (val: number) => {
  const start = val === 0 ? 0 : (val - 1) * 10;
  const end = start + 10;
  statisticalData.value = fetchData.value.slice(start, end);
};

onMounted(() => {
  getFinanceLog();
});
</script>
