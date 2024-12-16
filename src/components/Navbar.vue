<template>
    <v-app>
      <v-app-bar app class="navbar">
        <v-toolbar-title>
          <div class="d-flex align-center">
            <!-- Profil bosh harfi -->
            <v-avatar size="40">
              <span class="headline">{{ getTeacherInitials }}</span>
            </v-avatar>
            <span class="ml-2">{{ teacherName }}</span>
          </div>
        </v-toolbar-title>
      </v-app-bar>
  
      <v-container>
        <!-- Sayt mazmuni -->
      </v-container>
    </v-app>
  </template>
  <script>
  export default {
    data() {
      return {
        teacherName: "", // Teacher nomi
      };
    },
    computed: {
      // Teacher nomidan bosh harfni olish
      getTeacherInitials() {
        const name = this.teacherName;
        return name ? name.charAt(0).toUpperCase() : ''; // Bosh harfni olish
      },
    },
    created() {
      this.teacherName = localStorage.getItem("teacherName"); // LocalStorage'dan teacherName olish
    },
  };
  </script>
<style scoped>
.navbar {
  background-color: #fff; /* Oq fon */
  color: #000; /* Qora matn */
}

.v-avatar {
  background-color: #000; /* Avatar qora fon */
  color: #fff; /* Bosh harf oq rangda */
}
</style>
  