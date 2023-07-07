<template>
  <el-main>
    <el-card class="mb-5">
      <el-button type="primary" @click="dialogFormVisible = true">
        Thêm thống kê
      </el-button>
    </el-card>
    <el-card v-loading="loading">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column fixed prop="date" label="Thời gian" width="130">
          <template #default="scope">
            {{ moment(scope.row.date).format("DD/MM/YYYY") }}
          </template>
        </el-table-column>
        <el-table-column prop="content" label="Nội dung" width="180">
          <template #default="scope">
            <button @click="editContent(scope.row)">
              {{ scope.row.content }}
            </button>
          </template>
        </el-table-column>
        <el-table-column prop="money" label="Số tiền" width="300">
          <template #default="scope">
            {{ scope.row.money.toLocaleString("it-IT") }}
          </template>
        </el-table-column>
        <el-table-column prop="type" label="Loại chi tiêu" width="300">
          <template #default="scope">
            <el-tag :type="'success'" disable-transitions
              >{{ genSpendingType(scope.row.spendingType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="Loại thanh toán">
          <template #default="scope">
            <el-tag :type="'success'" disable-transitions
              >{{ genType(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
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

interface RuleForm {
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
const tableData: any = ref([]);
const loading = ref(false);
const dialogFormVisible = ref(false);

const formInline = reactive<RuleForm>({
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

      const { data, error } = await supabase
        .from("finance_log")
        .insert([formData])
        .select();

      ElMessage({
        message: "Đã thêm thành công",
        type: "success",
      });

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

  const { data } = await supabase.from("finance_log").select();
  tableData.value = data;

  loading.value = false;
}

const editContent = (data: RuleForm) => {
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
