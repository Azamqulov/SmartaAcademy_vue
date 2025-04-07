<template>
  <v-app-bar-title class="text-h6 font-weight-bold">O'quvchilar To'lov Jadvali</v-app-bar-title>
  <v-container>
  <div class="container">
  </div>
  
  <v-card class="table-card rounded-lg overflow-hidden">
      <v-app-bar  class=" search-bar h-full">
        <v-spacer></v-spacer>
        <v-text-field
        v-model="search"
        label="Qidirish"
        color="white"
        ></v-text-field>
      </v-app-bar>
      <!-- Jadval sarlavhasi va qidiruv maydoni -->

      <!-- Jadval asosiy qismi -->
      <v-data-table
        :headers="headers"
        :items="filteredStudents"
        :items-per-page="10"
        :footer-props="{
          'items-per-page-options': [5, 10, 15, 20, -1],
          'items-per-page-text': 'Bir sahifada:',
        }"
        item-value="id"
        class="elevation-0"
        dense
      >
        <!-- Oylar header -->
        <template v-slot:header.payments="{ header }">
          <div class="month-header">{{ header.text }}</div>
        </template>

        <!-- O'quvchilar qatori -->
        <template v-slot:item="{ item, index }">
          <tr :class="{'payment-row': true, 'even-row': index % 2 === 0}">
            <td class="text-center font-weight-medium">{{ index + 1 }}</td>
            <td>
              <div class="d-flex align-center">
                <v-avatar :color="getRandomColor(item.id)" size="32" class="mr-2">
                  <span class="white--text">{{ getInitials(item) }}</span>
                </v-avatar>
                <div>
                  <div class="font-weight-medium">{{ item.surname }} {{ item.name }}</div>
                  <div class="text-caption" v-if="item.teacher && item.teacher.name">
                    <v-icon small class="mr-1">mdi-account-tie</v-icon>
                    {{ item.teacher.name }}
                  </div>
                </div>
              </div>
            </td>
            
            <!-- To'lov checkboxlar -->
            <td v-for="(monthIndex) in 12" :key="monthIndex" class="text-center">
              <v-btn
                icon
                small
                @click="togglePayment(item.id, monthIndex-1)"
                :class="{
                  'payment-icon-btn': true,
                  'paid': item.payments[monthIndex-1],
                  'unpaid': !item.payments[monthIndex-1]
                }"
              >
                <v-icon small>
                  {{ item.payments[monthIndex-1] ? 'mdi-check-circle' : 'mdi-close-circle-outline' }}
                </v-icon>
              </v-btn>
              <div class="month-label">{{ getMonthShort(monthIndex-1) }}</div>
            </td>
            
            <!-- Status uchun qo'shimcha ustun -->
            <td class="text-center">
              <v-chip
                x-small
                :color="getStatusColor(item.payments)"
                text-color="white"
                label
              >
                {{ getPaymentStatus(item.payments) }}
              </v-chip>
            </td>
          </tr>
        </template>

        <!-- Jami to'lovlar -->
        <template v-slot:footer>
          <tr class="total-row">
            <td colspan="2" class="text-subtitle-1 font-weight-bold">Jami</td>
            <td v-for="monthIndex in 12" :key="monthIndex" class="text-center">
              <v-chip
                x-small
                :color="getTotalColor(calculateMonthlyTotal(monthIndex-1), filteredStudents.length)"
                text-color="white"
              >
                {{ calculateMonthlyTotal(monthIndex-1) }}
              </v-chip>
            </td>
            <td class="text-center">
              <v-chip
                x-small
                :color="getTotalColor(calculateTotalPaid(), filteredStudents.length * 12)"
                text-color="white"
              >
                {{ calculateTotalPercentage() }}%
              </v-chip>
            </td>
          </tr>
        </template>
      </v-data-table>

      <!-- Statistika qismi -->
      <v-divider></v-divider>
      <v-card-actions class="pa-4 stats-panel">
        <v-row>
          <v-col cols="12" sm="4">
            <v-card outlined class="stat-card">
              <v-card-text class="text-center">
                <div class="text-overline">O'quvchilar</div>
                <div class="text-h5 font-weight-bold primary--text">{{ filteredStudents.length }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <v-card outlined class="stat-card">
              <v-card-text class="text-center">
                <div class="text-overline">To'langan</div>
                <div class="text-h5 font-weight-bold success--text">{{ calculateTotalPaid() }}</div>
              </v-card-text>
            </v-card>
          </v-col>
          <v-col cols="12" sm="4">
            <v-card outlined class="stat-card">
              <v-card-text class="text-center">
                <div class="text-overline">To'lanmagan</div>
                <div class="text-h5 font-weight-bold error--text">
                  {{ filteredStudents.length * 12 - calculateTotalPaid() }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script>
import { db } from "@/firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import Toastify from "toastify-js";

export default {
  data() {
    return {
      search: "",
      months: [
        "Yanvar",
        "Fevral",
        "Mart",
        "Aprel",
        "May",
        "Iyun",
        "Iyul",
        "Avgust",
        "Sentabr",
        "Oktabr",
        "Noyabr",
        "Dekabr",
      ],
      currentUser: null,
      role: null,
      students: [],
      headers: [
        { text: "№", align: "center", sortable: false, width: "50px" },
        { text: "F.I.SH", align: "start", sortable: true, value: "fullName" },
        { text: "Yanvar", align: "center", sortable: false, value: "payments[0]" },
        { text: "Fevral", align: "center", sortable: false, value: "payments[1]" },
        { text: "Mart", align: "center", sortable: false, value: "payments[2]" },
        { text: "Aprel", align: "center", sortable: false, value: "payments[3]" },
        { text: "May", align: "center", sortable: false, value: "payments[4]" },
        { text: "Iyun", align: "center", sortable: false, value: "payments[5]" },
        { text: "Iyul", align: "center", sortable: false, value: "payments[6]" },
        { text: "Avgust", align: "center", sortable: false, value: "payments[7]" },
        { text: "Sentabr", align: "center", sortable: false, value: "payments[8]" },
        { text: "Oktabr", align: "center", sortable: false, value: "payments[9]" },
        { text: "Noyabr", align: "center", sortable: false, value: "payments[10]" },
        { text: "Dekabr", align: "center", sortable: false, value: "payments[11]" },
        { text: "Status", align: "center", sortable: true, value: "status" },
      ],
      colors: ["#1976D2", "#9C27B0", "#E91E63", "#F44336", "#4CAF50", "#FF9800", "#795548", "#607D8B"],
    };
  },
  computed: {
    filteredStudents() {
      if (!this.students.length) return [];
      
      let filtered = [...this.students];
      
      // Foydalanuvchi roli bo'yicha filtrlash
      if (this.role !== "admin") {
        filtered = filtered.filter((student) =>
          student.teacher && student.teacher.name
            ? student.teacher.name.toLowerCase() === this.currentUser.toLowerCase()
            : false
        );
      }
      
      // Qidiruv so'rovi bo'yicha filtrlash
      if (this.search) {
        const searchLower = this.search.toLowerCase();
        filtered = filtered.filter(
          (student) =>
            student.name.toLowerCase().includes(searchLower) ||
            student.surname.toLowerCase().includes(searchLower)
        );
      }
      
      return filtered;
    },
  },
  methods: {
    async loadStudents() {
      try {
        let studentQuery;
        if (this.role === "admin") {
          studentQuery = collection(db, "students");
        } else {
          studentQuery = query(
            collection(db, "students"),
            where("teacher.name", "==", this.currentUser)
          );
        }

        const querySnapshot = await getDocs(studentQuery);
        this.students = querySnapshot.docs.map((doc) => {
          const studentData = doc.data();
          if (!studentData.payments) {
            studentData.payments = Array(12).fill(false);
          }
          
          return {
            ...studentData,
            id: doc.id,
            fullName: `${studentData.surname} ${studentData.name}`,
          };
        });
      } catch (error) {
        console.error("Error fetching students:", error);
        Toastify({
          text: "O'quvchilarni olishda xatolik yuz berdi.",
          duration: 3000,
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc3a0)",
        }).showToast();
      }
    },

    calculateMonthlyTotal(monthIndex) {
      return this.filteredStudents.reduce(
        (sum, student) => sum + (student.payments[monthIndex] ? 1 : 0),
        0
      );
    },
    
    calculateTotalPaid() {
      return this.filteredStudents.reduce((total, student) => {
        return total + student.payments.filter(p => p).length;
      }, 0);
    },
    
    calculateTotalPercentage() {
      const total = this.filteredStudents.length * 12;
      if (total === 0) return 0;
      return Math.round((this.calculateTotalPaid() / total) * 100);
    },

    async togglePayment(studentId, monthIndex) {
      const studentIndex = this.students.findIndex(s => s.id === studentId);
      if (studentIndex === -1) return;
      
      const student = this.students[studentIndex];
      const updatedPayments = [...student.payments];
      updatedPayments[monthIndex] = !updatedPayments[monthIndex];
      
      const studentDoc = doc(db, "students", studentId);
      try {
        await updateDoc(studentDoc, { payments: updatedPayments });
        
        // Update local array
        this.students[studentIndex].payments = updatedPayments;
        
        Toastify({
          text: updatedPayments[monthIndex]
            ? `${this.months[monthIndex]} to'lovi tasdiqlandi!`
            : `${this.months[monthIndex]} to'lovi bekor qilindi!`,
          duration: 2000,
          backgroundColor: updatedPayments[monthIndex]
            ? "linear-gradient(to right, #00b09b, #96c93d)"
            : "linear-gradient(to right, #ff5f6d, #ffc3a0)",
        }).showToast();
      } catch (error) {
        console.error("Error updating payments:", error);
        Toastify({
          text: "To'lovlarni yangilashda xatolik yuz berdi.",
          duration: 3000,
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc3a0)",
        }).showToast();
      }
    },
    
    getMonthShort(index) {
      return this.months[index].substring(0, 3);
    },
    
    getInitials(student) {
      return (student.name.charAt(0) + student.surname.charAt(0)).toUpperCase();
    },
    
    getRandomColor(id) {
      // ID asosida doimiy rang qaytarish
      const colorIndex = id.charCodeAt(0) % this.colors.length;
      return this.colors[colorIndex];
    },
    
    getPaymentStatus(payments) {
      if (!payments) return "Ma'lumot yo'q";
      
      const paidCount = payments.filter(p => p).length;
      const percentage = (paidCount / payments.length) * 100;
      
      if (percentage === 100) return "To'liq";
      if (percentage >= 75) return "Yaxshi";
      if (percentage >= 50) return "O'rta";
      if (percentage > 0) return "Past";
      return "To'lanmagan";
    },
    
    getStatusColor(payments) {
      if (!payments) return "grey";
      
      const paidCount = payments.filter(p => p).length;
      const percentage = (paidCount / payments.length) * 100;
      
      if (percentage === 100) return "success";
      if (percentage >= 75) return "light-green darken-1";
      if (percentage >= 50) return "amber darken-2";
      if (percentage > 0) return "deep-orange";
      return "error";
    },
    
    getTotalColor(paid, total) {
      if (total === 0) return "grey";
      
      const percentage = (paid / total) * 100;
      
      if (percentage >= 90) return "success";
      if (percentage >= 70) return "light-green darken-1";
      if (percentage >= 50) return "amber darken-2";
      if (percentage > 30) return "deep-orange";
      return "error";
    }
  },
  created() {
    this.currentUser = localStorage.getItem("teacherName");
    this.role = localStorage.getItem("userRole");

    if (this.currentUser) {
      this.loadStudents();
    } else {
      console.error("No teacher logged in. Please log in to view students.");
      Toastify({
        text: "Iltimos, tizimga kirgan o'qituvchi nomini tekshiring.",
        duration: 3000,
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc3a0)",
      }).showToast();
    }
  },
};
</script>

<style scoped>
.table-card {
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.search-field ::v-deep .v-input__slot {
  border-radius: 5px !important;
}

.payment-row:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.even-row {
  background-color: rgba(0, 0, 0, 0.01);
}

.payment-icon-btn {
  width: 28px !important;
  height: 28px !important;
  margin: 0 auto;
}

.paid {
  color: #4CAF50 !important;
}

.unpaid {
  color: #bdbdbd !important;
}

.month-label {
  font-size: 10px;
  margin-top: 2px;
  color: #757575;
}

.total-row {
  background-color: #f5f5f5;
}

.stat-card {
  transition: transform 0.2s;
  border-radius: 8px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}
.search-bar{
  position: absolute;
  top:0 !important;
  height:55px;
  width: 80%;
  box-shadow: none !important;
}
/* Responsive dizayn */
@media (max-width: 960px) {
  .search-field {
    max-width: 200px;
  }
}

@media (max-width: 600px) {
  .search-field {
    display: none;
  }
  
  .v-data-table ::v-deep .v-data-table__wrapper {
    overflow-x: auto;
  }
  
  .stats-panel {
    padding: 8px !important;
  }
}
</style>