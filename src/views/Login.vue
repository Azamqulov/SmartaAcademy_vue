<template>
  <v-container>
    <v-card class="pa-5 mx-auto" max-width="500">
      <v-img
        class="w-5 h-10"
        height="150px"
        src="../assets/images/biglogo.png"
        alt="bu yerda logo bor "
      ></v-img>
      <v-card-title class="text-h5 text-center"
        >Smart Academy Login</v-card-title
      >
      <v-form
        ref="form"
        v-model="valid"
        @submit.prevent="login"
        lazy-validation
      >
        <v-text-field
          v-model="username"
          label="Username"
          class="w-full"
          required
        ></v-text-field>
        <v-text-field
          v-model="password"
          label="Password"
          type="password"
          required
          @keyup.enter="login"
        ></v-text-field>
        <v-btn
          :disabled="!valid"
          color="primary"
          class="mt-4"
          block
          @click="login"
        >
          Login
        </v-btn>
        <v-alert v-if="error" type="error" class="mt-3">
          {{ error }}
        </v-alert>
      </v-form>
    </v-card>
  </v-container>
</template>

<script>
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

export default {
  data() {
    return {
      username: "",
      password: "",
      valid: false,
      error: null,
    };
  },
  methods: {
    async login() {
      try {
        // Foydalanuvchi ma'lumotlarini Firebase'dan olish
        const userDoc = await getDoc(doc(db, "users", this.username));

        // Foydalanuvchi mavjudligini tekshirish
        if (!userDoc.exists()) {
          this.error = "Foydalanuvchi topilmadi!";
          return;
        }

        const user = userDoc.data();

        // Parolni tekshirish
        if (this.password !== user.password) {
          this.error = "Parol noto‘g‘ri!";
          return;
        }

        // Role tekshirish va yo‘naltirish
        const role = user.role;

        // Foydalanuvchi rolini saqlash
        localStorage.setItem("userRole", role);
        localStorage.setItem("teacherName", user.username);

        // Admin roli bo'lsa, admin paneliga yo'naltirish
        if (role === "admin") {
          this.$router.push("/admin-dashboard/home");
        }
        // O'qituvchi roli bo'lsa, o'qituvchi paneliga yo'naltirish
        else if (role === "teacher") {
          this.$router.push("/main/home");
        } else {
          this.error = "Foydalanuvchi roli noto‘g‘ri!";
        }
      } catch (e) {
        this.error = "Xato yuz berdi! Qayta urinib ko'ring.";
        console.error(e);
      }
    },
  },
};
</script>

<style scoped>
/* Customize the login form styling */
.v-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.v-card {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.526);
  border-radius: 10px;
}

.v-btn {
  background-color: #007bff;
  color: white;
}

.v-alert {
  margin-top: 10px;
}
</style>
