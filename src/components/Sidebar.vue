<template>
  <!-- *** -->
  <v-navigation-drawer
    app
    color="grey lighten-4"
    v-model="sidebarVisible"
    permanent
  >
    <!--  -->
    <v-list>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6">Smart Academy</v-list-item-title>
        </v-list-item-content>
      </v-list-item>
      <v-divider></v-divider>
      <v-list-item v-for="item in menuItems" :key="item.title" link>
        <v-list-item-icon>
          <v-icon>{{ item.icon }}</v-icon>
        </v-list-item-icon>
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
    <!-- Sidebarni boshqarish uchun yon tugma -->
  </v-navigation-drawer>
  <!-- *** -->
</template>

<script>
export default {
  data() {
    return {
      sidebarVisible: true, // Sidebar boshlang‘ich holati
      menuItems: [
        { title: "Home", icon: "mdi-home" },
        { title: "Teacher", icon: "mdi-account-tie" },
        { title: "Student", icon: "mdi-account-group" },
        { title: "Payments", icon: "mdi-cash" },
        { title: "Dashboard", icon: "mdi-view-dashboard" },
      ],
    };
  },
  methods: {
    toggleSidebar() {
      this.sidebarVisible = !this.sidebarVisible; // Sidebarni holatini almashtirish
    },
  },
};
</script>

<style>
/* Yon tugma uchun CSS */
.v-btn {
  background: white;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
}
</style>
