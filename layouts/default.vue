<template>
  <template v-if="confirm === '26112609'">
    <TheHeader />
    <slot />
  </template>
</template>

<script lang="ts" setup>
const confirm: any = ref([]);

onMounted(() => {
  let password = prompt("Nhập mật khẩu");
  confirm.value = password;

  if (confirm.value !== "26112609") {
    location.reload();
  }
});
</script>
