<template>
  <v-container fluid>
    <!-- Dashboard Header -->
    <v-row class="mt-6">
      <v-col cols="12">
        <div class="dashboard-header">
          <h2 class="dashboard-title">Dashboard</h2>
          <p class="dashboard-subtitle">Optimize Revenue and Keep Track of the number of students.</p>
        </div>
      </v-col>
    </v-row>
    
    <v-row>
      <!-- Profile Card -->
      <v-col cols="12" md="6" lg="6">
        <v-card class="profile-card pa-4" outlined elevation="2">
          <v-card-title class="profile-header">
            <v-avatar size="100" class="avatar-main mb-3">
              <template v-if="teacher.photoURL">
                <img
                  class="profile-image"
                  :src="teacher.photoURL"
                  alt="Profil rasmi"
                />
              </template>
              <template v-else>
                <v-avatar 
                  color="blue"
                  class="white--text profile-initial"
                >
                  {{ profileInitial }}
                </v-avatar>
              </template>
            </v-avatar>
            <div class="profile-info">
              <h3 class="profile-name">Ism: {{ teacher.name }}</h3>
              <p class="profile-username"><strong>Username:</strong> {{ teacher.username }}</p>
              <h4 class="profile-subject grey--text">Fan: {{ teacher.subject }}</h4>
            </div>
          </v-card-title>
          <v-card-actions class="action-buttons">
            <v-btn color="blue" @click="openEditModal" class="action-button">
              <v-icon left>mdi-pencil</v-icon> Tahrirlash
            </v-btn>
            <v-btn color="red" @click="openLoginEditModal" class="action-button">
              <v-icon left>mdi-lock</v-icon> Parolni Tahrirlash
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
  
      <!-- Revenue Statistics Card -->
      <v-col cols="12" md="3" sm="6">
        <v-card 
          class="stats-card revenue-card" 
          elevation="2" 
          @mouseover="animateCard('revenue')" 
          @mouseleave="resetAnimation('revenue')"
        >
          <div class="stats-icon-container blue lighten-4">
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

      <!-- Clients Statistics Card -->
      <v-col cols="12" md="3" sm="6">
        <v-card 
          class="stats-card clients-card" 
          elevation="2" 
          @mouseover="animateCard('clients')" 
          @mouseleave="resetAnimation('clients')"
        >
          <div class="stats-icon-container indigo lighten-4">
            <v-icon color="indigo" size="24">mdi-account-group-outline</v-icon>
          </div>
          <div class="stats-content">
            <div class="stats-title">Total Clients</div>
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

    <!-- Admin Panel Cards -->
    <v-row v-if="isAdmin" class="mt-5">
      <v-col cols="12" md="4">
        <v-card outlined elevation="2" class="admin-stats-card">
          <v-card-title>
            <v-icon left color="primary">mdi-account-multiple</v-icon>
            Jami O'quvchilar
          </v-card-title>
          <v-card-subtitle class="admin-stat-value">{{ formatNumber(totalStudents) }}</v-card-subtitle>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card outlined elevation="2" class="admin-stats-card">
          <v-card-title>
            <v-icon left color="success">mdi-cash-multiple</v-icon>
            Jami To'lovlar
          </v-card-title>
          <v-card-subtitle class="admin-stat-value">{{ formatNumber(totalPayments) }} so'm</v-card-subtitle>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card outlined elevation="2" class="admin-stats-card">
          <v-card-title>
            <v-icon left color="info">mdi-check-circle</v-icon>
            Jami O'tganlar
          </v-card-title>
          <v-card-subtitle class="admin-stat-value">{{ formatNumber(totalPass) }}</v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit Profile Modal -->
    <v-dialog v-model="editModal" max-width="500">
      <v-card>
        <v-card-title class="headline">
          <v-icon left color="blue">mdi-account-edit</v-icon>
          Tahrirlash
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editForm.name"
            label="Ismi"
            prepend-icon="mdi-account"
            outlined
          ></v-text-field>

          <v-autocomplete
            v-model="editForm.subject"
            :items="subjects"
            label="Fan"
            prepend-icon="mdi-book-open-variant"
            item-text="name"
            item-value="name"
            return-object
            outlined
          ></v-autocomplete>
        </v-card-text>
        <v-card-actions class="modal-actions">
          <v-spacer></v-spacer>
          <v-btn text @click="closeEditModal">
            <v-icon left>mdi-close</v-icon>
            Bekor qilish
          </v-btn>
          <v-btn color="primary" @click="saveTeacher">
            <v-icon left>mdi-content-save</v-icon>
            Saqlash
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    
    <!-- Password Edit Modal -->
    <v-dialog v-model="loginEditModal" max-width="500">
      <v-card>
        <v-card-title class="headline">
          <v-icon left color="red">mdi-lock-reset</v-icon>
          Login va Parolni Tahrirlash
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editForm.username"
            label="Login"
            prepend-icon="mdi-account"
            outlined
            disabled
          ></v-text-field>

          <v-text-field
            v-model="editForm.password"
            label="Parol"
            prepend-icon="mdi-lock"
            :type="passwordVisible ? 'text' : 'password'"
            outlined
            :append-icon="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append="togglePasswordVisibility"
          ></v-text-field>
        </v-card-text>
        <v-card-actions class="modal-actions">
          <v-spacer></v-spacer>
          <v-btn text @click="closeLoginEditModal">
            <v-icon left>mdi-close</v-icon>
            Bekor qilish
          </v-btn>
          <v-btn color="primary" @click="saveLoginDetails">
            <v-icon left>mdi-content-save</v-icon>
            Saqlash
          </v-btn>
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
import Toastify from "toastify-js";

export default {
  name: "TeacherDashboard",
  
  data() {
    return {
      teacher: {},
      isAdmin: false,
      editModal: false,
      loginEditModal: false,
      passwordVisible: false,
      editForm: {
        name: "",
        subject: "",
        username: "",
        password: "",
      },
      subjects: [],
      totalStudents: 0,
      totalPayments: 0,
      totalPass: 0,
      currentUser: localStorage.getItem("teacherName"),
      // Dashboard statistics data
      statsTotals: {
        revenue: 29960,
        clients: 102
      },
      // Chart paths
      revenuePath: "M0,25 L10,20 L20,28 L30,15 L40,20 L50,10 L60,18 L70,5 L80,15 L90,8 L100,15",
      clientsPath: "M0,15 L10,5 L20,15 L30,10 L40,20 L50,15 L60,25 L70,15 L80,5 L90,15 L100,20",
      // Animation timeouts
      animationTimeouts: {}
    };
  },
  
  computed: {
    profileInitial() {
      return this.teacher.name ? this.teacher.name.charAt(0).toUpperCase() : '';
    },
  },
  
  methods: {
    // Fetch teacher data
    async fetchTeacher() {
      try {
        const teacherName = localStorage.getItem("teacherName");
        if (!teacherName) return;
        
        this.editForm.name = teacherName;
        const teacherRef = doc(db, "users", teacherName);
        const docSnap = await getDoc(teacherRef);
        
        if (docSnap.exists()) {
          this.teacher = docSnap.data();
          this.editForm.subject = this.teacher.subject;
          this.editForm.username = this.teacher.username;
          this.editForm.password = this.teacher.password;
        }
        
        // Fetch subjects
        await this.fetchSubjects();
      } catch (error) {
        this.showToast("Ma'lumotlarni yuklashda xatolik yuz berdi", "error");
        console.error("Error fetching teacher data:", error);
      }
    },
    
    // Fetch subjects
    async fetchSubjects() {
      try {
        const querySnapshot = await getDocs(collection(db, "subjects"));
        this.subjects = querySnapshot.docs.map(doc => doc.data().name);
      } catch (error) {
        console.error("Error loading subjects:", error);
      }
    },

    // Modal methods
    openEditModal() {
      this.editModal = true;
    },
    
    closeEditModal() {
      this.editModal = false;
    },
    
    async saveTeacher() {
      try {
        const teacherRef = doc(db, "users", this.editForm.name);
        await updateDoc(teacherRef, {
          name: this.editForm.name,
          subject: this.editForm.subject,
        });
        
        this.teacher.name = this.editForm.name;
        this.teacher.subject = this.editForm.subject;
        this.closeEditModal();
        
        this.showToast("Ma'lumotlar muvaffaqiyatli saqlandi", "success");
      } catch (error) {
        this.showToast("Ma'lumotlarni saqlashda xatolik yuz berdi", "error");
        console.error("Error saving teacher data:", error);
      }
    },
    
    openLoginEditModal() {
      this.loginEditModal = true;
    },
    
    closeLoginEditModal() {
      this.loginEditModal = false;
    },
    
    async saveLoginDetails() {
      try {
        const teacherRef = doc(db, "users", this.editForm.name);
        await updateDoc(teacherRef, {
          username: this.editForm.username,
          password: this.editForm.password,
        });
        
        this.teacher.username = this.editForm.username;
        this.teacher.password = this.editForm.password;
        this.closeLoginEditModal();
        
        this.showToast("Login va parol muvaffaqiyatli saqlandi", "success");
      } catch (error) {
        this.showToast("Login va parolni saqlashda xatolik yuz berdi", "error");
        console.error("Error saving login details:", error);
      }
    },
    
    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
    },
    
    // Animation methods
    animateCard(type) {
      const element = this.$refs[`${type}Value`];
      if (!element) return;
      
      element.classList.add('pulse-animation');
      
      const path = document.querySelector(`.${type}-path`);
      if (path) {
        path.classList.add('path-animation');
      }
      
      this.animationTimeouts[type] = setTimeout(() => {
        element.classList.remove('pulse-animation');
        if (path) {
          path.classList.remove('path-animation');
        }
      }, 1000);
    },
    
    resetAnimation(type) {
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
    
    // Format numbers with commas
    formatNumber(number) {
      return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    
    // Toast notification
    showToast(message, type = "success") {
      Toastify({
        text: message,
        backgroundColor: type === "success" ? "green" : "red",
        duration: 3000,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
      }).showToast();
    }
  },
  
  async created() {
    await this.fetchTeacher();
  },
};
</script>

<style scoped>
* {
  font-family: "Fira Code", monospace !important;
  font-weight: 400;
}

/* Dashboard Header */
.dashboard-header {
  padding: 0 12px;
  margin-bottom: 24px;
}

.dashboard-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.dashboard-subtitle {
  color: #6c757d;
  font-size: 16px;
}

/* Profile Card */
.profile-card {
  border-radius: 12px;
  transition: all 0.3s ease;
}

.profile-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.avatar-main {
  margin: 0 auto;
  display: flex;
}

.profile-image {
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 50%;
}

.profile-initial {
  height: 150px;
  width: 150px;
  font-size: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.profile-info {
  width: 100%;
  margin-top: 16px;
}

.profile-name {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 8px;
}

.profile-username {
  font-size: 16px;
  margin-bottom: 8px;
}

.profile-subject {
  font-size: 18px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 16px;
}

/* Stats Cards */
.stats-card {
  display: flex;
  padding: 20px;
  border-radius: 16px;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
  height: 100%;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.stats-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  margin-right: 16px;
}

.stats-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.stats-title {
  font-size: 16px;
  color: #6c757d;
  margin-bottom: 8px;
}

.stats-value {
  font-size: 26px;
  font-weight: 600;
  margin-bottom: 8px;
}

.currency {
  font-size: 20px;
  font-weight: normal;
}

.stats-chart {
  position: relative;
  height: 30px;
  margin-top: auto;
}

.chart {
  width: 100%;
  height: 100%;
}

.chart-path {
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.revenue-path {
  stroke: #2196f3;
}

.clients-path {
  stroke: #3f51b5;
}

/* Admin Cards */
.admin-stats-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  padding: 8px;
}

.admin-stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
}

.admin-stats-card .v-card__title {
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.admin-stat-value {
  font-size: 28px !important;
  font-weight: 700;
  color: #333;
  padding-top: 8px;
}

/* Action Buttons */
.action-button {
  padding: 8px 16px;
  transition: all 0.3s ease;
  border-radius: 8px;
  font-weight: 500;
}

.action-button:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Modal Styles */
.modal-actions {
  padding: 16px;
}

/* Animations */
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
  animation: dashoffset 1.2s ease-in-out;
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
}

@keyframes dashoffset {
  to {
    stroke-dashoffset: 0;
  }
}

/* Responsive Styles */
@media (max-width: 600px) {
  .action-buttons {
    flex-direction: column;
  }
  
  .action-button {
    width: 100%;
    margin-bottom: 8px;
  }
  
  .stats-card {
    margin-bottom: 16px;
  }
  
  .stats-value {
    font-size: 20px;
  }
  
  .profile-header {
    flex-direction: column;
  }
}
</style>