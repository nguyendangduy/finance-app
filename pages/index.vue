<template>
  {{ finance_log }}
  <el-main>
    <el-card class="mb-5">
      <el-form
        :inline="true"
        :model="formInline"
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
            value-format="DD/MM/YYYY"
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
        <el-form-item label="Số tiền" prop="money" style="width: 100%">
          <el-input-number
            v-model="formInline.money"
            placeholder="Số tiền"
            clearable
          />
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="onSubmit(ruleFormRef)"
            :loading="loading"
          >
            Xác nhận
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card v-loading="loading">
      <el-table :data="tableData" style="width: 100%">
        <el-table-column fixed prop="date" label="Thời gian" width="200" />
        <el-table-column prop="content" label="Nội dung" />
        <el-table-column prop="money" label="Số tiền">
          <template #default="scope">
            {{ scope.row.money.toLocaleString("it-IT") }}
          </template>
        </el-table-column>
        <el-table-column
          prop="type"
          label="Loại"
          width="100"
          :filters="[
            { text: 'Ví', value: 'wallet' },
            { text: 'Momo', value: 'momo' },
            { text: 'VCB', value: 'vcb' },
          ]"
          :filter-method="filterType"
          filter-placement="bottom-end"
        >
          <template #default="scope">
            <el-tag
              :type="scope.row.type === 'Ví' ? '' : 'success'"
              disable-transitions
              >{{ genType(scope.row.type) }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </el-main>
</template>

<script lang="ts" setup>
import type { FormInstance, FormRules } from "element-plus";
import { createClient } from '@supabase/supabase-js';

const runtimeConfig = useRuntimeConfig()
const supabase = createClient(`${runtimeConfig.public.supabaseUrl}`, `${runtimeConfig.public.supabaseKey}`,{
  auth: {
    persistSession: false
  }
});

interface RuleForm {
  content: string;
  date: string;
  money: number;
  type: string;
}

const formInline = reactive<RuleForm>({
  content: "",
  date: "",
  money: 0,
  type: "",
});

const loading = ref(false);

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

const ruleFormRef = ref<FormInstance>();

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
  money: [{ validator: checkMoney, trigger: "blur" }],
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
  await formEl.validate((valid, fields) => {
    if (valid) {
      const data = {
        ...formInline,
      };

      tableData.push(data);

      ElMessage({
        message: "Đã thêm thành công",
        type: "success",
      });

      formEl.resetFields();
      loading.value = false;
    } else {
      loading.value = false;
      console.log("error submit!", fields);
    }
  });
};

const tableData: any = ref([]);

const filterType = (value: string, row: any) => {
  return row.type === value;
};

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

async function getFinanceLog() {
  loading.value = true;
  
  const { data } = await supabase.from('finance_log').select()
  tableData.value = data

  loading.value = false;
}

onMounted(() => {
  getFinanceLog()
})

</script>

<style scoped></style>
