import { createRouter, createWebHistory } from "vue-router";

// Views
import Home from "@/views/components/Home.vue";
import Teacher from "@/views/components/Teacher.vue";
import Student from "@/views/components/StudentDashboard.vue";
import Payment from "@/views/components/Payment.vue";
import Dashboard from "@/views/components/Dashboard.vue";
import AdDashboard from "@/views/components/AdminDashboard.vue";
import Login from "@/views/Login.vue";
import page404 from "@/views/404.vue";

// Layouts
import MainLayout from "@/layouts/MainLayout.vue";
import AdminDashboardLayout from "@/layouts/AdminDashboard.vue";

const routes = [
  {
    path: "/",
    component: Login, // Login sahifasi
  },
  {
    path: "/",
    component: MainLayout,
    children: [
      { path: "home", component: Home },
      { path: "teacher", component: Teacher },
      { path: "payment", component: Payment },
      { path: "student", component: Student },
      { path: "dashboard", component: Dashboard },
    ],
  },
  {
    path: "/admin",
    component: AdminDashboardLayout,
    children: [
      { path: "home", component: Home },
      { path: "teacher", component: Teacher },
      { path: "payment", component: Payment },
      { path: "student", component: Student },
      { path: "dashboard", component: Dashboard },
      { path: "admin", component: AdDashboard },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "404",
    component: page404,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Auth guard
router.beforeEach((to, from, next) => {
  const teacherName = localStorage.getItem("teacherName");

  // `/` bu login sahifasi — har doim ruxsat
  if (to.path === "/Login") {
    next();
  }
  // Agar teacherName yo‘q va kirish protected route’ga bo‘lsa
  else if (!teacherName && (to.path.startsWith("/Login") || to.path.startsWith("/admin"))) {
    next("/Login"); // login sahifasiga qaytar
  }
  // Boshqa hollarda ruxsat beramiz
  else {
    next();
  }
});

export default router;
