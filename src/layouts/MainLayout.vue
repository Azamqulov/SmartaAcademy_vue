<template>
  <v-app :class="themeClass" style="height: 100vh">
    <!-- Sidebar -->
    <v-navigation-drawer app v-model="sidebarVisible" class="sidebar-drawer">
      <v-list>
        <v-list-item>
          <v-list-item-content class="rounded m-auto text-center">
            <router-link to="/">
              <v-img
                src="../assets/images/biglogo.png"
                alt="Smart Academy Logo"
                max-width="150"
                class="mx-auto"
                transition="scale-transition"
              ></v-img>
            </router-link>
            <v-list-item-title class="text-h5 pb-3 mt-4 font-weight-bold app-title">
              Smart Academy
            </v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider class="mt-4"></v-divider>
        <v-list-item
          class="mt-3 mx-3 menu-item"
          v-for="item in menuItems"
          :key="item.title"
          :to="item.link"
          link
          :class="{ 'active-item': isActive(item.link) }"
        >
          <v-list-item-icon class="d-flex align-center">
            <v-icon class="mr-2">{{ item.icon }}</v-icon>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-icon>
        </v-list-item>
      </v-list>
      <v-btn
        @click="showLogoutConfirm"
        class="logout-btn"
        color="red-accent-4"
        style="position: absolute; bottom: 16px; width: calc(100% - 24px); margin: 0 12px"
        elevation="2"
      >
        <v-icon left>mdi-logout</v-icon>
        Logout
      </v-btn>
      <v-btn
        icon
        @click="toggleSidebar"
        class="sidebar-toggle"
        :class="{ 'rotate-icon': !sidebarVisible }"
        elevation="2"
      >
        <v-icon>{{ sidebarVisible ? "mdi-chevron-left" : "mdi-chevron-right" }}</v-icon>
      </v-btn>
    </v-navigation-drawer>

    <!-- Navbar -->
    <v-app-bar
      app
      elevation="1"
      :class="currentTheme === 'dark' ? 'dark-navbar' : 'light-navbar'"
    >
      <v-app-bar-nav-icon @click="toggleSidebar" class="d-md-none"></v-app-bar-nav-icon>

      <v-btn icon @click="toggleTheme" class="theme-toggle-btn ml-2">
        <v-icon :color="currentTheme === 'dark' ? 'amber' : 'blue'">{{
          currentTheme === "dark" ? "mdi-white-balance-sunny" : "mdi-moon-waning-crescent"
        }}</v-icon>
      </v-btn>

      <!-- Profile Section -->
      <v-spacer></v-spacer>

      <v-menu offset-y transition="slide-y-transition">
        <template v-slot:activator="{ on, attrs }">
          <v-avatar
            color="blue"
            class="profile-avatar mr-4 cursor-pointer"
            v-bind="attrs"
            v-on="on"
          >
            <span class="white--text">{{ profileInitial }}</span>
          </v-avatar>
        </template>
        <v-list>
          <v-list-item to="/profile">
            <v-list-item-icon><v-icon>mdi-account</v-icon></v-list-item-icon>
            <v-list-item-title>Profile</v-list-item-title>
          </v-list-item>
          <v-list-item to="/settings">
            <v-list-item-icon><v-icon>mdi-cog</v-icon></v-list-item-icon>
            <v-list-item-title>Settings</v-list-item-title>
          </v-list-item>
          <v-divider></v-divider>
          <v-list-item @click="showLogoutConfirm">
            <v-list-item-icon><v-icon color="error">mdi-logout</v-icon></v-list-item-icon>
            <v-list-item-title class="error--text">Logout</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </v-app-bar>

    <!-- Main Content -->
    <v-main
      class="content-area"
      :class="currentTheme === 'dark' ? 'dark-content' : 'light-content'"
    >
      <router-view v-slot="{ Component }">
        <transition name="page-transition" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-main>

    <!-- Logout confirmation dialog -->
    <v-dialog v-model="logoutDialog" max-width="300" persistent>
      <v-card>
        <v-card-title>Logout</v-card-title>
        <v-card-text>Are you sure you want to logout?</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="logoutDialog = false">Cancel</v-btn>
          <v-btn color="error" text @click="logout">Logout</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      sidebarVisible: true, // Sidebar initial state
      logoutDialog: false, // Logout confirmation dialog
      menuItems: [
        { title: "Home", icon: "mdi-home", link: "/home" },
        { title: "Student", icon: "mdi-account-circle", link: "/student" },
        { title: "Payment", icon: "mdi-credit-card", link: "/payment" },
        {
          title: "Dashboard",
          icon: "mdi-view-dashboard",
          link: "/dashboard",
        },
      ],
      currentUser: localStorage.getItem("teacherName") || "User", // Add fallback if teacherName is null
      profileImage: "../assets/images/profile-placeholder.jpg", // Profile image path
      currentTheme: localStorage.getItem("theme") || "light", // Default theme if not in localStorage
    };
  },
  computed: {
    // First letter of the user's name
    profileInitial() {
      return this.currentUser ? this.currentUser.charAt(0).toUpperCase() : "U";
    },
    themeClass() {
      return this.currentTheme === "dark" ? "dark-mode" : "light-mode"; // Dynamic theme class
    },
  },
  methods: {
    toggleTheme() {
      const newTheme = this.currentTheme === "dark" ? "light" : "dark"; // Toggle theme
      this.currentTheme = newTheme; // Update theme state
      localStorage.setItem("theme", newTheme); // Save new theme state to localStorage

      // Update Vuetify theme
      if (this.$vuetify.theme.global) {
        this.$vuetify.theme.global.name = newTheme;
      } else {
        this.$vuetify.theme.dark = newTheme === "dark";
      }
    },
    showLogoutConfirm() {
      this.logoutDialog = true;
    },
    logout() {
      localStorage.removeItem("userRole");
      this.logoutDialog = false;
      this.$router.push("/"); // Navigate to login page on logout
    },
    toggleSidebar() {
      this.sidebarVisible = !this.sidebarVisible; // Toggle sidebar visibility
    },
    isActive(link) {
      return this.$route.path === link || this.$route.path.startsWith(link + "/");
    },
    handleResize() {
      if (window.innerWidth < 960 && this.sidebarVisible) {
        this.sidebarVisible = false;
      }
    },
  },
  mounted() {
    // Get saved theme state
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      this.currentTheme = savedTheme;

      // Handle different Vuetify versions
      if (this.$vuetify.theme.global) {
        this.$vuetify.theme.global.name = savedTheme;
      } else {
        this.$vuetify.theme.dark = savedTheme === "dark";
      }
    }

    // Detect small screens and auto-hide sidebar
    if (window.innerWidth < 960) {
      this.sidebarVisible = false;
    }

    // Listen for window resize events
    window.addEventListener("resize", this.handleResize);
  },
  beforeDestroy() {
    // Remove event listener when component is destroyed
    window.removeEventListener("resize", this.handleResize);
  },
};
</script>

<style scoped>
.dark-mode {
  background-color: #0d111785; /* Dark background */
  color: #ffffff; /* Light text color */
}

.light-mode {
  background-color: #ffffff; /* Light background */
  color: #000000; /* Dark text color */
}

/* Navbar styles */
.dark-navbar {
  background-color: #0d1117c0  !important;
  border-bottom: 1px solid #2a4a46;
}

.light-navbar {
  background-color: #ffffff !important;
  border-bottom: 1px solid #e2e8f0;
}

/* Content area styles */
.dark-content {
  background-color: #202124;
  color: #e2e8f0;
}

.light-content {
  background-color: #f8fafc;
  color: #2d3748;
}

/* Sidebar styles */
.sidebar-drawer {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dark-mode .sidebar-drawer {
  background-color: #0d111785 !important;
  border-right: 1px solid #2a4a46;
}

.menu-item {
  border-radius: 8px !important;
  transition: all 0.3s ease;
  margin: 4px 8px !important;
}

.menu-item:hover {
  background-color: rgba(66, 153, 225, 0.1) !important;
  transform: translateX(3px);
}

.active-item {
  background-color: rgba(66, 153, 225, 0.15) !important;
  font-weight: 600;
}

.sidebar-toggle {
  position: absolute;
  top: 70px;
  right: -16px;
  z-index: 10;
  height: 32px;
  width: 32px;
  border-radius: 50% !important;
  background-color: white !important;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2) !important;
  transition: transform 0.3s ease;
}

.dark-mode .sidebar-toggle {
  background-color: #2d3748 !important;
}

.rotate-icon {
  transform: rotate(180deg);
}

.app-title {
  animation: fadeIn 1s ease;
}

.content-area {
  overflow-y: auto;
  height: calc(100vh - 64px); /* Subtract app bar height */
  scrollbar-width: thin;
}

.logout-btn {
  transition: all 0.3s ease;
}

.logout-btn:hover {
  transform: translateY(-2px);
}

.theme-toggle-btn {
  transition: transform 0.3s ease;
}

.theme-toggle-btn:hover {
  transform: rotate(30deg);
}

.profile-avatar {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.profile-avatar:hover {
  transform: scale(1.1);
}

/* Transitions for page changes */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.page-transition-enter,
.page-transition-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Custom scrollbar styling */
::-webkit-scrollbar {
  width: 5px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #718096;
  border-radius: 4px;
}

.dark-mode ::-webkit-scrollbar-thumb {
  background: #4a5568;
}

/* Animation keyframes */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Fix for Vuetify button focus outlines */
.v-btn:focus {
  outline: none;
}

/* Mobile responsiveness */
@media (max-width: 600px) {
  .v-list-item-title {
    font-size: 14px;
  }
}
</style>
