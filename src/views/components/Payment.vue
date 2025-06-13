<template>
  <v-container >
    <v-row>
      <v-col cols="12">
        <v-card class="table-card rounded-lg overflow-hidden elevation-3 mt-10">
          <v-card-title class="primary white--text py-3">
            <v-icon large color="blue" class="mr-2">mdi-cash-register</v-icon>
            <span class="text-h5 font-weight-bold">O'quvchilar To'lov Jadvali</span>
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Qidirish"
              single-line
              hide-details
              dense
              filled
              dark
              class="search-field mt-1"
            ></v-text-field>
          </v-card-title>

          <!-- Real-time statistika -->
          <v-card-subtitle class="pa-0">
            <v-row class="ma-0 stat-summary py-2 px-3">
              <v-col cols="12" md="3" sm="6" class="py-1">
                <v-chip color="primary" outlined label class="px-2 stat-chip">
                  <v-icon left small>mdi-account-group</v-icon>
                  <span>Jami o'quvchilar: <b>{{ filteredStudents.length }}</b></span>
                </v-chip>
              </v-col>
              <v-col cols="12" md="3" sm="6" class="py-1">
                <v-chip color="success" outlined label class="px-2 stat-chip">
                  <v-icon left small>mdi-check-circle</v-icon>
                  <span>To'langan: <b>{{ calculateTotalPaid() }}</b></span>
                </v-chip>
              </v-col>
              <v-col cols="12" md="3" sm="6" class="py-1">
                <v-chip color="error" outlined label class="px-2 stat-chip">
                  <v-icon left small>mdi-close-circle</v-icon>
                  <span>To'lanmagan: <b>{{ filteredStudents.length * 12 - calculateTotalPaid() }}</b></span>
                </v-chip>
              </v-col>
              <v-col cols="12" md="3" sm="6" class="py-1">
                <v-chip :color="getTotalColor(calculateTotalPaid(), filteredStudents.length * 12)" outlined label class="px-2 stat-chip">
                  <v-icon left small>mdi-percent</v-icon>
                  <span>Umumiy: <b>{{ calculateTotalPercentage() }}%</b></span>
                </v-chip>
              </v-col>            
            </v-row>
          </v-card-subtitle>

          <!-- Jadval asosiy qismi -->
          <v-data-table
            :headers="headers"
            :items="filteredStudents"
            :items-per-page="10"
            :search="search"
            :footer-props="{
              'items-per-page-options': [5, 10, 15, 20, -1],
              'items-per-page-text': 'Bir sahifada:',
              'show-first-last-page': true
            }"
            item-key="id"
            class="elevation-0"
            dense
            :loading="loading"
            loading-text="Ma'lumotlar yuklanmoqda..."
            no-data-text="Ma'lumotlar topilmadi"
          >
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
                <td v-for="(monthIndex) in 12" :key="monthIndex" class="text-center payment-cell px-0">
                  <v-tooltip bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                        icon
                        small
                        @click="togglePayment(item.id, monthIndex-1)"
                        :class="{
                          'payment-icon-btn': true,
                          'paid': item.payments && item.payments[monthIndex-1],
                          'unpaid': !item.payments || !item.payments[monthIndex-1]
                        }"
                        :disabled="loading"
                        v-bind="attrs"
                        v-on="on"
                      >
                        <v-icon small>
                          {{ item.payments && item.payments[monthIndex-1] ? 'mdi-check-circle' : 'mdi-close-circle-outline' }}
                        </v-icon>
                      </v-btn>
                    </template>
                    <span>{{ months[monthIndex-1] }}</span>
                  </v-tooltip>
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

            <!-- Oylik statistika -->
            <template v-slot:body.append>
              <tr class="total-row font-weight-bold">
                <td colspan="2" class="text-subtitle-1 py-2">
                  <v-icon small class="mr-2">mdi-chart-bar</v-icon>
                  Oylik Statistika
                </td>
                <td v-for="monthIndex in 12" :key="monthIndex" class="text-center">
                  <v-badge 
                    :content="calculateMonthlyTotal(monthIndex-1)" 
                    :color="getTotalColor(calculateMonthlyTotal(monthIndex-1), filteredStudents.length)"
                    inline 
                    class="monthly-badge"
                  ></v-badge>
                  <div class="percentage-text">
                    {{ calculateMonthlyPercentage(monthIndex-1) }}%
                  </div>
                </td>
                <td class="text-center">
                  <v-chip
                    small
                    :color="getTotalColor(calculateTotalPaid(), filteredStudents.length * 12)"
                    text-color="white"
                  >
                    {{ calculateTotalPercentage() }}%
                  </v-chip>
                </td>
              </tr>
            </template>
          </v-data-table>

          <!-- Statistika grafigi -->
          <v-divider></v-divider>
          <v-card-actions class="pa-4 stats-panel">
            <v-row>
              <v-col cols="12" md="4">
                <v-card outlined hover class="stat-card">
                  <v-card-title class="py-2 primary lighten-4">
                    <v-icon left>mdi-chart-timeline-variant</v-icon>
                    <span class="subtitle-1">Oylik To'lovlar</span>
                  </v-card-title>
                  <v-card-text class="pt-2 px-0">
                    <v-sparkline
                      :value="monthlyStats"
                      :gradient="['#1976D2', '#2196F3', '#64B5F6']"
                      line-width="2"
                      padding="16"
                      auto-draw
                      smooth
                      show-labels
                      :label-size="4"
                    ></v-sparkline>
                  </v-card-text>
                </v-card>
              </v-col>
              <v-col cols="12" md="8">
                <v-row>
                  <v-col cols="12" sm="4">
                    <v-card outlined class="stat-card">
                      <div class="stat-divider primary"></div>
                      <v-card-text class="text-center">
                        <div class="text-overline">O'quvchilar</div>
                        <div class="text-h4 font-weight-bold primary--text">{{ filteredStudents.length }}</div>
                        <div class="text-caption mt-1">Jami o'quvchilar soni</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-card outlined class="stat-card">
                      <div class="stat-divider success"></div>
                      <v-card-text class="text-center">
                        <div class="text-overline">To'langan</div>
                        <div class="text-h4 font-weight-bold success--text">{{ calculateTotalPaid() }}</div>
                        <div class="text-caption mt-1">Jami to'langan oylar</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                  <v-col cols="12" sm="4">
                    <v-card outlined class="stat-card">
                      <div class="stat-divider error"></div>
                      <v-card-text class="text-center">
                        <div class="text-overline">To'lanmagan</div>
                        <div class="text-h4 font-weight-bold error--text">
                          {{ filteredStudents.length * 12 - calculateTotalPaid() }}
                        </div>
                        <div class="text-caption mt-1">To'lanishi kerak bo'lgan</div>
                      </v-card-text>
                    </v-card>
                  </v-col>
                </v-row>
                <v-row class="mt-2">
                  <v-col cols="12">
                    <v-alert
                      dense
                      text
                      color="info"
                      border="left"
                      class="mb-0"
                    >
                      <div class="d-flex align-center">
                        <v-icon color="info" class="mr-2">mdi-information</v-icon>
                        <span>
                          Eng yuqori to'lov oyida: <strong>{{ getBestMonth() }}</strong> - 
                          <strong>{{ calculateMonthlyPercentage(months.indexOf(getBestMonth())) }}%</strong> to'langan.
                        </span>
                      </div>
                    </v-alert>
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
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
  onSnapshot
} from "firebase/firestore";
import Toastify from "toastify-js";

export default {
  name: "StudentPaymentsTable",
  data() {
    return {
      search: "",
      loading: true,
      unsubscribe: null,
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
        { text: "F.I.SH", align: "start", sortable: true, value: "fullName", width: "220px" },
        { text: "Yan", align: "center", sortable: false, value: "payments[0]", width: "60px" },
        { text: "Fev", align: "center", sortable: false, value: "payments[1]", width: "60px" },
        { text: "Mar", align: "center", sortable: false, value: "payments[2]", width: "60px" },
        { text: "Apr", align: "center", sortable: false, value: "payments[3]", width: "60px" },
        { text: "May", align: "center", sortable: false, value: "payments[4]", width: "60px" },
        { text: "Iyn", align: "center", sortable: false, value: "payments[5]", width: "60px" },
        { text: "Iyl", align: "center", sortable: false, value: "payments[6]", width: "60px" },
        { text: "Avg", align: "center", sortable: false, value: "payments[7]", width: "60px" },
        { text: "Sen", align: "center", sortable: false, value: "payments[8]", width: "60px" },
        { text: "Okt", align: "center", sortable: false, value: "payments[9]", width: "60px" },
        { text: "Noy", align: "center", sortable: false, value: "payments[10]", width: "60px" },
        { text: "Dek", align: "center", sortable: false, value: "payments[11]", width: "60px" },
        { text: "Status", align: "center", sortable: true, value: "status", width: "90px" },
      ],
      colors: ["#1976D2", "#9C27B0", "#E91E63", "#F44336", "#4CAF50", "#FF9800", "#795548", "#607D8B"],
    };
  },
  computed: {
    filteredStudents() {
      if (!this.students.length) return [];
      
      let filtered = [...this.students];
      
      // Foydalanuvchi roli bo'yicha filtrlash
      if (this.role && this.role !== "admin") {
        filtered = filtered.filter((student) =>
          student.teacher && student.teacher.name
            ? student.teacher.name.toLowerCase() === this.currentUser.toLowerCase()
            : false
        );
      }
      
      return filtered;
    },
    
    // Oylik statistika uchun ma'lumotlar
    monthlyStats() {
      return this.months.map((_, index) => this.calculateMonthlyTotal(index));
    }
  },
  methods: {
    // Ma'lumotlarni real-time olish
    setupRealtimeListener() {
      this.loading = true;
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

        this.unsubscribe = onSnapshot(studentQuery, (snapshot) => {
          this.students = snapshot.docs.map((doc) => {
            const studentData = doc.data();
            // Payments ni bo'sh bo'lgan holda tekshirish
            const payments = Array.isArray(studentData.payments) ? 
              studentData.payments : Array(12).fill(false);
            
            return {
              ...studentData,
              id: doc.id,
              fullName: `${studentData.surname || ''} ${studentData.name || ''}`.trim(),
              payments: payments.length === 12 ? payments : [...payments, ...Array(12 - payments.length).fill(false)]
            };
          });
          this.loading = false;
        }, (error) => {
          console.error("Error in real-time listener:", error);
          this.showNotification("Real-time ma'lumotlarni olishda xatolik yuz berdi.", "error");
          this.loading = false;
        });
      } catch (error) {
        console.error("Error setting up listener:", error);
        this.showNotification("Ma'lumotlarni olishda xatolik yuz berdi.", "error");
        this.loading = false;
      }
    },

    calculateMonthlyTotal(monthIndex) {
      return this.filteredStudents.reduce(
        (sum, student) => {
          if (!student.payments) return sum;
          return sum + (student.payments[monthIndex] ? 1 : 0);
        },
        0
      );
    },
    
    calculateMonthlyPercentage(monthIndex) {
      const total = this.filteredStudents.length;
      if (total === 0) return 0;
      return Math.round((this.calculateMonthlyTotal(monthIndex) / total) * 100);
    },
    
    calculateTotalPaid() {
      return this.filteredStudents.reduce((total, student) => {
        if (!student.payments) return total;
        return total + student.payments.filter(p => p).length;
      }, 0);
    },
    
    calculateTotalPercentage() {
      const total = this.filteredStudents.length * 12;
      if (total === 0) return 0;
      return Math.round((this.calculateTotalPaid() / total) * 100);
    },
    
    getBestMonth() {
      if (!this.filteredStudents.length) return this.months[0];
      
      let maxPaid = -1;
      let bestMonthIndex = 0;
      
      this.months.forEach((_, index) => {
        const paid = this.calculateMonthlyTotal(index);
        if (paid > maxPaid) {
          maxPaid = paid;
          bestMonthIndex = index;
        }
      });
      
      return this.months[bestMonthIndex];
    },

    async togglePayment(studentId, monthIndex) {
      if (this.loading) return;
      
      this.loading = true;
      const studentIndex = this.students.findIndex(s => s.id === studentId);
      if (studentIndex === -1) {
        this.loading = false;
        return;
      }
      
      const student = this.students[studentIndex];
      if (!Array.isArray(student.payments)) {
        student.payments = Array(12).fill(false);
      }
      
      const updatedPayments = [...student.payments];
      updatedPayments[monthIndex] = !updatedPayments[monthIndex];
      
      const studentDoc = doc(db, "students", studentId);
      try {
        await updateDoc(studentDoc, { payments: updatedPayments });
        
        // Notification ko'rsatish
        this.showNotification(
          updatedPayments[monthIndex]
            ? `${this.months[monthIndex]} to'lovi tasdiqlandi!`
            : `${this.months[monthIndex]} to'lovi bekor qilindi!`,
          updatedPayments[monthIndex] ? "success" : "warning"
        );
      } catch (error) {
        console.error("Error updating payments:", error);
        this.showNotification("To'lovlarni yangilashda xatolik yuz berdi.", "error");
        this.loading = false;
      }
    },
    
    showNotification(message, type = "info") {
      const bgColors = {
        success: "linear-gradient(to right, #00b09b, #96c93d)",
        error: "linear-gradient(to right, #ff5f6d, #ffc3a0)",
        warning: "linear-gradient(to right, #f9d423, #ff4e50)",
        info: "linear-gradient(to right, #2193b0, #6dd5ed)"
      };
      
      Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: bgColors[type] || bgColors.info,
      }).showToast();
    },
    
    getMonthShort(index) {
      if (!this.months[index]) return "";
      return this.months[index].substring(0, 3);
    },
    
    getInitials(student) {
      const nameInitial = student.name ? student.name.charAt(0) : '';
      const surnameInitial = student.surname ? student.surname.charAt(0) : '';
      return (nameInitial + surnameInitial).toUpperCase();
    },
    
    getRandomColor(id) {
      if (!id) return this.colors[0];
      // ID asosida doimiy rang qaytarish
      const colorIndex = id.charAt(0).charCodeAt(0) % this.colors.length;
      return this.colors[colorIndex];
    },
    
    getPaymentStatus(payments) {
      if (!payments || !Array.isArray(payments)) return "Ma'lumot yo'q";
      
      const paidCount = payments.filter(p => p).length;
      const percentage = (paidCount / payments.length) * 100;
      
      if (percentage === 100) return "To'liq";
      if (percentage >= 75) return "Yaxshi";
      if (percentage >= 50) return "O'rta";
      if (percentage > 0) return "Past";
      return "To'lanmagan";
    },
    
    getStatusColor(payments) {
      if (!payments || !Array.isArray(payments)) return "grey";
      
      const paidCount = payments.filter(p => p).length;
      const percentage = (paidCount / payments.length) * 100;
      
      if (percentage === 100) return "success";
      if (percentage >= 75) return "light-green darken-1";
      if (percentage >= 50) return "amber darken-2";
      if (percentage > 0) return "deep-orange";
      return "error";
    },
    
    getTotalColor(paid, total) {
      if (!total || total === 0) return "grey";
      
      const percentage = (paid / total) * 100;
      
      if (percentage >= 90) return "success";
      if (percentage >= 70) return "light-green darken-1";
      if (percentage >= 50) return "amber darken-2";
      if (percentage > 30) return "deep-orange";
      return "error";
    }
  },
  created() {
    // Omborlashtirilgan ma'lumotlarni olish
    this.currentUser = localStorage.getItem("teacherName") || "";
    this.role = localStorage.getItem("userRole") || "";

    if (this.currentUser || this.role === "admin") {
      this.setupRealtimeListener();
    } else {
      console.error("No teacher logged in. Please log in to view students.");
      this.showNotification("Iltimos, tizimga kirgan o'qituvchi nomini tekshiring.", "error");
      this.loading = false;
    }
  },
  beforeDestroy() {
    // Real-time listener ni to'xtatish
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
};
</script>

<style>
.table-card {
  border-radius: 12px !important;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.search-field {
  max-width: 100%;
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


.stat-card {
  transition: transform 0.2s;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

.payment-cell {
  padding: 0 2px !important;
}

.stat-chip {
  font-size: 12px;
  height: 28px;
  width: 100%;
  justify-content: flex-start;
}

.monthly-badge {
  font-weight: bold;
}

.percentage-text {
  font-size: 10px;
  color: #757575;
  margin-top: 2px;
}

.stat-divider {
  height: 4px;
  width: 100%;
}

/* Responsive dizayn */
@media (max-width: 960px) {
  .search-field {
    max-width: 100%;
  }
}

@media (max-width: 600px) {
  .v-data-table {
    overflow-x: auto;
  }
  
  .stats-panel {
    padding: 8px !important;
  }
  
  .payment-cell {
    min-width: 50px;
  }
  
  .stat-chip {
    font-size: 10px;
  }
}
</style>