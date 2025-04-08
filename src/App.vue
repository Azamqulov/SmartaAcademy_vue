<template>
  <v-app>
    <!--  -->
    <v-main>
      <!--  -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
      <!--  -->
    </v-main>
    <!--  -->
  </v-app>
</template>

<script setup>
//
</script>
<style>
*{
  font-family: "Fira Code" !important;
    font-weight: 300;
}
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}

.fade-enter-active {
  animation: fadeIn 0.5s;
}
.fade-leave-active {
  animation: fadeOut 0.5s;
}
</style>
