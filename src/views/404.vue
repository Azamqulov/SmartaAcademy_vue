<template>
  <!-- **** -->
  <div class="page-404 h-full">
    <v-btn class="mt-16 ml-10 bg-black" @click="$router.back()">
      <v-icon start icon="mdi-arrow-left"></v-icon>
      Orqaga qaytish
    </v-btn>
  </div>
  <!-- **** -->
</template>
<script>
export default {};
</script>
<style lang="scss">
.page-404 {
  height: 90vh;
  background-image: url("https://support.heberjahiz.com/hc/article_attachments/21013076295570");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}
</style>