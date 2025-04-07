<template>
  <v-container>
      <!-- Dashboard Statistika Kartlari -->
      <v-row class="mt-6">
      <v-col cols="12">
        <div class="dashboard-header">
          <h2 class="dashboard-title">Dashboard</h2>
          <p class="dashboard-subtitle">Optimize Revenue and Keep Track of the number of students.</p>
        </div>
      </v-col>
    </v-row>
    <v-row >
      <!-- Profil Kartasi -->
      <v-col cols="12" md="6" lg="6">
        <v-card class="pa-4 m-auto main-blog" outlined>
          <v-card-title>
            <v-avatar size="100" class="avatar-main">
              <template v-if="teacher.photoURL">
                <img
                  width="100% "
                  style="height: 150px; margin: 0 auto"
                  class="text-center m-auto"
                  :src="teacher.photoURL"
                  alt="Profil rasmi"
                />
              </template>
              <template v-else>
                <v-avatar 
                  style="
                    height: 150px;
                    width: 150px;
                    font-size: 28px;
                    text-align: center;
                  "
                  color="blue"
                  class="white--text text--center m--auto text-3xl"
                >
                  {{ profileInitial }}
                </v-avatar>
              </template>
            </v-avatar>
            <div>
              <h3 class="">Ism: {{ teacher.name }}</h3>
              <p><strong>Username:</strong> {{ teacher.username }}</p>
              <h4 class="grey--text">Fan: {{ teacher.subject }}</h4>
            </div>
          </v-card-title>
          <v-card-actions class="all-btn">
            <v-btn color="blue" @click="openEditModal" class="action-button"> Tahrirlash</v-btn>
            <v-btn color="red" @click="openLoginEditModal" class="action-button"
              >Parolni Tahrirlash</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-col>
  
      <!-- Daromad Statistikasi -->
      <v-col cols="12" md="3" sm="6">
        <v-card class="stats-card revenue-card" elevation="1" @mouseover="animateCard('revenue')" @mouseleave="resetAnimation('revenue')">
          <div class="stats-icon-container ">
            <v-icon color="blue" size="24">mdi-currency-usd</v-icon>
          </div>
          <div class="stats-content">
            <div class="stats-title">Total Revenue</div>
            <div class="stats-value" ref="revenueValue">
              <span class="currency">$</span> {{ formatNumber(statsTotals.revenue) }}
            </div>
            <div class="stats-chart">
              <svg class="chart" viewBox="0 0 100 30">
                <path :d="revenuePath" class="chart-path revenue-path"></path>
              </svg>
            </div>
          </div>
        </v-card>
      </v-col>

       <!-- Mijozlar Statistikasi -->
       <v-col cols="12" md="3" sm="6">
        <v-card class="stats-card clients-card" elevation="1" @mouseover="animateCard('clients')" @mouseleave="resetAnimation('clients')">
          <div class="stats-icon-container bg-light-indigo">
            <v-icon color="blue" size="24">mdi-account-group-outline</v-icon>
          </div>
          <div class="stats-content">
            <div class="stats-title">Total Client</div>
            <div class="stats-value" ref="clientsValue">{{ formatNumber(statsTotals.clients) }}</div>
            <div class="stats-chart">
              <svg class="chart" viewBox="0 0 100 30">
                <path :d="clientsPath" class="chart-path clients-path"></path>
              </svg>
            </div>
          </div>
        </v-card>
      </v-col>
   

     
    </v-row>

    <!-- Admin Paneli bilan birga -->
    <v-row v-if="isAdmin" class="mt-5">
      <v-col cols="12" md="4">
        <v-card outlined class="admin-stats-card">
          <v-card-title>Jami O'quvchilar</v-card-title>
          <v-card-subtitle>{{ totalStudents }}</v-card-subtitle>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card outlined class="admin-stats-card">
          <v-card-title>Jami To'lovlar</v-card-title>
          <v-card-subtitle>{{ totalPayments }} so'm</v-card-subtitle>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card outlined class="admin-stats-card">
          <v-card-title>Jami O'tganlar</v-card-title>
          <v-card-subtitle>{{ totalPass }}</v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tahrirlash Modal -->
    <v-dialog v-model="editModal" max-width="500">
      <v-card>
        <v-card-title>Tahrirlash</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editForm.name"
            label="Ismi"
            outlined
          ></v-text-field>

          <!-- Fan Tanlash -->
          <v-autocomplete
            v-model="editForm.subject"
            :items="subjects"
            label="Fan"
            item-text="name"
            item-value="name"
            return-object
            outlined
          ></v-autocomplete>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-card class="btn">
            <v-btn text @click="closeEditModal">Bekor qilish</v-btn>
            <v-btn color="primary" @click="saveTeacher">Saqlash</v-btn>
          </v-card>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Login va Parol Tahrirlash Modal -->
    <v-dialog v-model="loginEditModal" max-width="500">
      <v-card>
        <v-card-title>Login va Parolni Tahrirlash</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editForm.username"
            label="Login"
            outlined
            disabled
          ></v-text-field>

          <!-- Parolni ko'rish va yashirish -->
          <v-text-field
            v-model="editForm.password"
            label="Parol"
            :type="passwordVisible ? 'text' : 'password'"
            outlined
            append-icon="mdi-eye"
            @click:append="togglePasswordVisibility"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="btn-action">
          <v-spacer></v-spacer>
          <v-btn text @click="closeLoginEditModal">Bekor qilish</v-btn>
          <v-btn color="primary" @click="saveLoginDetails">Saqlash</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { db } from "@/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import Toastify from "toastify-js"; // Import Toastify

export default {
  data() {
    return {
      teacher: {},
      isAdmin: false, // Admin bo'lishini aniqlash
      editModal: false,
      loginEditModal: false,
      passwordVisible: false,
      editForm: {
        name: "",
        subject: "",
        username: "",
        password: "",
      },
      subjects: [], // Array to hold subjects
      totalStudents: 0, // Barcha o'quvchilar soni
      totalPayments: 0, // Barcha to'lovlar summasi
      totalPass: 0,
      currentUser: localStorage.getItem("teacherName"), // Get Teacher Name from localStorage
      // Dashboard statistikasi uchun ma'lumotlar
      statsTotals: {
        revenue: 29960,
        orders: 125,
        clients: 102,
        menus: 60
      },
      // Grafik yo'llari
      revenuePath: "M0,25 L10,20 L20,28 L30,15 L40,20 L50,10 L60,18 L70,5 L80,15 L90,8 L100,15",
      ordersPath: "M0,15 L10,10 L20,5 L30,15 L40,10 L50,20 L60,15 L70,25 L80,15 L90,5 L100,15",
      clientsPath: "M0,15 L10,5 L20,15 L30,10 L40,20 L50,15 L60,25 L70,15 L80,5 L90,15 L100,20",
      menusPath: "M0,20 L10,15 L20,10 L30,15 L40,5 L50,15 L60,10 L70,15 L80,25 L90,15 L100,10",
      // Animatsiya uchun
      animationTimeouts: {}
    };
  },
  computed: {
    profileInitial() {
      return this.currentUser.charAt(0).toUpperCase();
    },
  },
  methods: {
    async fetchTeacher() {
      const teacherName = localStorage.getItem("teacherName");
      if (teacherName) {
        this.editForm.name = teacherName;
      }
      const teacherRef = doc(db, "users", teacherName);
      const docSnap = await getDoc(teacherRef);
      if (docSnap.exists()) {
        this.teacher = docSnap.data();
        this.editForm.subject = this.teacher.subject;
        this.editForm.username = this.teacher.username;
        this.editForm.password = this.teacher.password;
      }
      // Fetch subjects from Firestore
      await this.fetchSubjects();
    },
    async fetchSubjects() {
      try {
        const querySnapshot = await getDocs(collection(db, "subjects"));
        this.subjects = querySnapshot.docs.map((doc) => doc.data().name); // Saqlash faqat `name` stringini
        console.log("Teachers loaded:", this.subjects);
      } catch (error) {
        console.error("Error loading teachers:", error);
      }
    },

    openEditModal() {
      this.editModal = true;
    },
    closeEditModal() {
      this.editModal = false;
    },
    async saveTeacher() {
      const teacherRef = doc(db, "users", this.editForm.name);
      try {
        await updateDoc(teacherRef, {
          name: this.editForm.name,
          subject: this.editForm.subject,
        });
        this.teacher.name = this.editForm.name;
        this.teacher.subject = this.editForm.subject;
        this.closeEditModal();
        // Success notification
        Toastify({
          text: "Ma'lumotlar muvaffaqiyatli saqlandi",
          backgroundColor: "green",
          duration: 3000,
          top: 300,
        }).showToast();
      } catch (error) {
        // Error notification
        Toastify({
          text: "Ma'lumotlarni saqlashda xatolik yuz berdi",
          backgroundColor: "red",
          duration: 3000,
        }).showToast();
      }
    },
    openLoginEditModal() {
      this.loginEditModal = true;
    },
    closeLoginEditModal() {
      this.loginEditModal = false;
    },
    async saveLoginDetails() {
      const teacherRef = doc(db, "users", this.editForm.name);
      try {
        await updateDoc(teacherRef, {
          username: this.editForm.username,
          password: this.editForm.password,
        });
        this.teacher.username = this.editForm.username;
        this.teacher.password = this.editForm.password;
        this.closeLoginEditModal();
        // Success notification
        Toastify({
          text: "Login va parol muvaffaqiyatli saqlandi",
          backgroundColor: "green",
          duration: 3000,
          top: 300,
        }).showToast();
      } catch (error) {
        // Error notification
        Toastify({
          text: "Login va parolni saqlashda xatolik yuz berdi",
          backgroundColor: "red",
          duration: 3000,
        }).showToast();
      }
    },
    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
    },
    
    // Animatsiya uchun metodlar
    animateCard(type) {
      const element = this.$refs[`${type}Value`];
      if (element) {
        // Animatsiya klassi qo'shish
        element.classList.add('pulse-animation');
        
        // SVG path animatsiyasi
        const path = document.querySelector(`.${type}-path`);
        if (path) {
          path.classList.add('path-animation');
        }
        
        // Animatsiya vaqti tugagandan so'ng klasni olib tashlash
        this.animationTimeouts[type] = setTimeout(() => {
          element.classList.remove('pulse-animation');
          if (path) {
            path.classList.remove('path-animation');
          }
        }, 1000);
      }
    },
    
    resetAnimation(type) {
      // Animatsiyani to'xtatish
      if (this.animationTimeouts[type]) {
        clearTimeout(this.animationTimeouts[type]);
      }
      
      const element = this.$refs[`${type}Value`];
      if (element) {
        element.classList.remove('pulse-animation');
      }
      
      const path = document.querySelector(`.${type}-path`);
      if (path) {
        path.classList.remove('path-animation');
      }
    },
    
    // Raqamlarni formatlash
    formatNumber(number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
  },
  async created() {
    await this.fetchTeacher();
  },
};
</script>

<style scoped>
/* Custom Styles */
.avatar-main {
  margin: 0 auto;
  display: flex;
}

/* Dashboard Styles */
.dashboard-header {
  padding: 0 12px;
  margin-bottom: 16px;
}

.dashboard-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 4px;
}

.dashboard-subtitle {
  color: #6c757d;
  font-size: 14px;
}

/* Stats Cards */
.stats-card {
  display: flex;
  padding: 16px;
  border-radius: 12px;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.stats-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  margin-right: 16px;
}



.stats-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.stats-title {
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 4px;
}

.stats-value {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
}

.currency {
  font-size: 18px;
  font-weight: normal;
}

.stats-chart {
  position: relative;
  height: 30px;
}

.chart {
  width: 100%;
  height: 100%;
}

.chart-path {
  fill: none;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.revenue-path {
  stroke: #2196f3;
}
  .clients-path {
    stroke: #2196f3;

  }

/* Animatsiyalar */
.pulse-animation {
  animation: pulse 1s;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.path-animation {
  animation: dashoffset 1s ease-in-out;
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
}

@keyframes dashoffset {
  to {
    stroke-dashoffset: 0;
  }
}

/* Admin Stats Kartlari */
.admin-stats-card {
  transition: all 0.3s ease;
  border-radius: 12px;
}

.admin-stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.admin-stats-card .v-card__title {
  font-size: 18px;
  font-weight: 600;
}

.admin-stats-card .v-card__subtitle {
  font-size: 24px;
  font-weight: 700;
}

/* Tahrirlash tugmalari */
.action-button {
  transition: all 0.3s ease;
  transform-origin: center;
}

.action-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Responsive Styles */
@media (max-width: 390px) {
  .btn {
    flex-direction: column;
    margin-top: 50px !important;
    flex-wrap: wrap !important;
  }
  .main-blog {
    flex-direction: column;
    margin: 0 auto;
    text-align: center;
  }
  .all-btn {
    flex-direction: column;
  }
  .stats-card {
    margin-bottom: 16px;
  }
  .stats-value {
    font-size: 20px;
  }
}
</style>