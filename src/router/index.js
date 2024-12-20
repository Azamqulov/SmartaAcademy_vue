import { createRouter, createWebHistory } from "vue-router";
import Home from "@/views/components/Home.vue";
import Teacher from "@/views/components/Teacher.vue";
import Student from "@/views/components/Student.vue";
import Payment from "@/views/components/Payment.vue";
import Dashboard from "@/views/components/Dashboard.vue";
import AdDashboard from "@/views/components/AdminDashboard.vue";

import Login from "@/views/Login.vue";
import MainLayout from "../layouts/MainLayout.vue";
import AdminDashboard from "@/layouts/AdminDashboard.vue";

// const routes = [
//   { path: '/home', component: Home },
//   { path: '/teacher', component: Teacher },
//   { path: '/student', component: Student },
//   { path: '/', component: Login },
//   { path: '/admin-dashboard', component: AdminDashboard },
//   { path: '/teacher-dashboard', component: TeacherDashboard },
// ];
import page404 from "@/views/404.vue"
const routes = [
  {
    path: "/",
    component: Login, // Login sahifasi
  },
  {
    path: "/admin-dashboard",
    component: AdminDashboard, // Asosiy layout

    children: [
      { path: "home", component: Home }, // /main/home
      { path: "teacher", component: Teacher }, // /main/teacher
      { path: "payment", component: Payment }, // /main/home
      { path: "student", component: Student }, // /main/teacher
      { path: "dashboard", component: Dashboard }, // /main/teacher
      { path: "admin", component: AdDashboard },
      {
        path: "/:pathMatch(.*)*",
        name: "404",
        component: page404,
      }, // /main/teacher
    ],
  },
  {
    path: "/main",
    component: MainLayout, // Asosiy layout

    children: [
      { path: "home", component: Home }, // /main/home
      { path: "teacher", component: Teacher }, // /main/teacher
      { path: "payment", component: Payment }, // /main/home
      { path: "student", component: Student }, // /main/teacher
      { path: "dashboard", component: Dashboard }, // /main/teacher
      {
        path: "/:pathMatch(.*)*",
        name: "404",
        component: page404,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
