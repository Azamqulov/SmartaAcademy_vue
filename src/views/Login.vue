<template>
  <div class="login-container">
    <!-- Left side illustration -->
    <div class="illustration-container">
      <div class="illustration-content">
        <img class="main-person" src="../assets/images/biglogo.png  " alt="Person with papers" />
        <div class="circle-background"></div>
        
        <!-- Decorative elements -->
        <div class="dot dot-1"></div>
        <div class="dot dot-2"></div>
        <div class="connector connector-1"></div>
        <div class="connector connector-2"></div>
      </div>
    </div>

    <!-- Right side login form -->
    <div class="login-form-container">
      <div class="login-form">
        <h2 class="welcome-text">Welcome back <span class="wave-emoji">👋</span></h2>
        <p class="login-subtitle">Log in your account</p>
        
        <v-form ref="form" v-model="valid" @submit.prevent="login" lazy-validation class="mt-8">
          <div class="input-group">
            <label class="input-label">
              <v-icon size="small" class="mr-2">mdi-account</v-icon>
              What is your username ?
            </label>
            <v-text-field
              v-model="username"
              placeholder="Enter your email"
              variant="outlined"
              class="login-input"
              hide-details
              required
            ></v-text-field>
          </div>
          
          <div class="input-group mt-4">
            <label class="input-label">
              <v-icon size="small" class="mr-2">mdi-lock</v-icon>
              Enter your password
            </label>
            <v-text-field
              v-model="password"
              type="password"
              placeholder="Enter your password"
              variant="outlined"
              class="login-input"
              hide-details
              required
              @keyup.enter="login"
            ></v-text-field>
          </div>
          
          
          
          <v-btn
            :disabled="!valid"
            color="#6366F1"
            class="mt-6 login-button"
            block
            rounded
            height="48"
            @click="login"
          >
            Continue
          </v-btn>
          
          <v-alert v-if="error" type="error" class="mt-3" dense>
            {{ error }}
          </v-alert>
        </v-form>
      </div>
    </div>
  </div>
</template>

<script>
import { getDoc, doc } from "firebase/firestore";
import { db } from "@/firebaseConfig";

export default {
  data() {
    return {
      username: "",
      password: "",
      rememberMe: false,
      valid: true,
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
          this.error = "Parol noto'g'ri!";
          return;
        }
        
        // Role tekshirish va yo'naltirish
        const role = user.role;
        
        // Foydalanuvchi rolini saqlash
        localStorage.setItem("userRole", role);
        localStorage.setItem("teacherName", user.username);
        
        // Admin roli bo'lsa, admin paneliga yo'naltirish
        if (role === "admin") {
          this.$router.push("/admin/home");
        }
        // O'qituvchi roli bo'lsa, o'qituvchi paneliga yo'naltirish
        else if (role === "teacher") {
          this.$router.push("/home");
        } else {
          this.error = "Foydalanuvchi roli noto'g'ri!";
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
.login-container {
  display: flex;
  height: 100vh;
  width: 100%;
}

.illustration-container {
  flex: 1;
  background-color: #f8fafc;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.illustration-content {
  position: relative;
  width: 100%;
  height: 100%;
  max-width: 480px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.circle-background {
  position: absolute;
  width: 280px;
  height: 280px;
  background-color: #e0e7ff;
  border-radius: 50%;
  z-index: 1;
}

.main-person {
  position: relative;
  z-index: 2;
  height: 350px;
  object-fit: contain;
}

.avatar {
  position: absolute;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 3;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-1 {
  top: 22%;
  left: 25%;
}

.avatar-2 {
  top: 25%;
  right: 30%;
}

.dot {
  position: absolute;
  border-radius: 50%;
  z-index: 1;
}

.dot-1 {
  width: 16px;
  height: 16px;
  background-color: #fb7185;
  top: 30%;
  right: 20%;
}

.dot-2 {
  width: 10px;
  height: 10px;
  background-color: #f59e0b;
  top: 20%;
  left: 30%;
}

.dot-3 {
  width: 14px;
  height: 14px;
  background-color: #6366f1;
  bottom: 35%;
  right: 35%;
}

.chat-bubble {
  position: absolute;
  bottom: 30%;
  left: 20%;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 3;
}

.chat-bubble img {
  width: 60%;
  height: 60%;
}

.connector {
  position: absolute;
  height: 2px;
  background-color: #d1d5db;
  z-index: 1;
}

.connector-1 {
  width: 80px;
  transform: rotate(-45deg);
  top: 35%;
  left: 30%;
}

.connector-2 {
  width: 100px;
  transform: rotate(30deg);
  bottom: 40%;
  right: 30%;
}

.login-form-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}

.login-form {
  width: 100%;
  max-width: 400px;
}

.welcome-text {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1e293b;
}

.wave-emoji {
  font-size: 24px;
}

.login-subtitle {
  color: #64748b;
  font-size: 14px;
}

.input-label {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #64748b;
  margin-bottom: 8px;
}

.login-input {
  border-radius: 8px;
}

.remember-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-password a {
  color: #6366f1;
  text-decoration: none;
  font-size: 14px;
}

.login-button {
  text-transform: none;
  font-weight: 500;
  letter-spacing: 0;
}

.signup-section {
  font-size: 14px;
  color: #64748b;
}

.signup-link {
  color: #6366f1;
  text-decoration: none;
  font-weight: 500;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .illustration-container {
    display: none;
  }
  
  .login-form-container {
    flex: 1;
  }
}
</style>