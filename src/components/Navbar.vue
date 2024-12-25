<template>
  <!-- *** -->
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
    <!-- --- -->
    <v-container>
      <!-- Sayt mazmuni -->
    </v-container>
  </v-app>
  <!-- *** -->
</template>
<script>
export default {
  data() {
    return {
      teacherName: "", // Teacher nomi
    };
  },
  computed: {
    getTeacherInitials() {
      const name = this.teacherName;
      return name ? name.charAt(0).toUpperCase() : "";
    },
  },
  created() {
    this.teacherName = localStorage.getItem("teacherName");
  },
};
</script>
<style scoped>
.navbar {
  background-color: #fff;
  color: #000;
}
.v-avatar {
  background-color: #000;
  color: #fff;
}
</style>
  