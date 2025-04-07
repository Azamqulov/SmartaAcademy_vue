<template>
  <v-container>
    <div class="page-header mb-6">
      <h1 class="text-center gradient-text">O'quvchilar ro'yxati</h1>
    </div>
    

    <!-- Summary Information - Updated and Styled -->
    <v-row class="mb-6">
      <v-col cols="12" sm="6">
        <v-card class="stats-card student-card" elevation="3">
          <v-card-text>
            <div class="d-flex align-center">
              <div class="stat-icon-container primary">
                <v-icon size="32" color="white">mdi-account-group</v-icon>
              </div>
              <div class="ml-4">
                <div class="stat-label">Jammi O'quvchilar</div>
                <div class="stat-value">{{ totalStudents }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      
      <v-col cols="12" sm="6">
        <v-card class="stats-card payment-card" elevation="3">
          <v-card-text>
            <div class="d-flex align-center">
              <div class="stat-icon-container success">
                <v-icon size="32" color="white">mdi-currency-usd</v-icon>
              </div>
              <div class="ml-4">
                <div class="stat-label">Jammi to'lovlar</div>
                <div class="stat-value">{{ formatCurrency(totalPayments) }}</div>
              </div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
        <!-- Search bar - Redesigned -->
        <v-card class="search-card mb-6" elevation="0" >
      <v-card-text>
        <v-text-field
          v-model="search"
          label="Search by Name"
          clearable
          outlined
          dense
          hide-details
          prepend-inner-icon="mdi-magnify"
          background-color="white"
          class="search-field"
        />
      </v-card-text>
    </v-card>
    
    <!-- Data Table - Completely Redesigned -->
    <v-card class="table-card mb-6" elevation="3">
      <v-card-title class="table-header flex">
      <v-row>
        <v-icon left color="primary" class="mr-2">mdi-format-list-bulleted</v-icon>
        O'quvchilar Ro'yxati
        <v-spacer></v-spacer>
        <v-chip small color="primary" text-color="white" class="ml-2">
          {{ filteredStudents.length }} records
        </v-chip>
      </v-row>
      </v-card-title>
      
      <v-data-table
        :headers="headers"
        :items="filteredStudents"
        :items-per-page="10"
        class="elevation-0"
        :footer-props="{
          'items-per-page-options': [5, 10, 15, 20],
          'items-per-page-text': 'Rows per page:'
        }"
        :loading="loading"
        loading-text="O'quvchilar yuklanyapti..."
      >
        <!-- Fixed: Removed custom header slot that was causing issues -->
        
        <!-- Custom styling for status/subject column -->
        <template v-slot:item.subject="{ item }">
          <v-chip small :color="getSubjectColor(item.subject)" text-color="white">
            {{ item.subject }}
          </v-chip>
        </template>
        
        <!-- Custom styling for payment column -->
        <template v-slot:item.payment="{ item }">
          <div class="font-weight-medium" :class="getPaymentClass(item.payment)">
            {{ formatCurrency(parsePayment(item.payment)) }}
          </div>
        </template>
        
        <!-- Custom styling for teacher column -->
        <template v-slot:item.teacher.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="30" color="grey lighten-3" class="mr-2">
              <span class="white--text">{{ getInitials(item.teacher?.name) }}</span>
            </v-avatar>
            {{ item.teacher?.name }}
          </div>
        </template>
        
        <!-- Custom styling for phone column -->
        <template v-slot:item.phone="{ item }">
          <div class="d-flex align-center">
            <v-icon small color="grey" class="mr-1">mdi-phone</v-icon>
            {{ formatPhone(item.phone) }}
          </div>
        </template>

        <!-- No data template -->
        <template v-slot:no-data>
          <v-card flat class="text-center pa-5 mt-4">
            <v-img
              alt="No data"
              max-height="120"
              contain
              class="mx-auto mb-4"
            ></v-img>
            <h3 class="text-h6 grey--text">Hozirgi o'qituvchi uchun talaba topilmadi</h3>
            <v-btn color="primary" text @click="loadStudents" class="mt-3">
              <v-icon left>mdi-refresh</v-icon>
              Qayta yuklash
            </v-btn>
          </v-card>
        </template>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import { db } from "@/firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  getDoc
} from "firebase/firestore";

export default {
  data() {
    return {
      search: "",
      currentUser: null,
      role: "",
      loading: true,
      headers: [
        { text: "Surname", value: "surname", sortable: true },
        { text: "Name", value: "name", sortable: true },
        { text: "Teacher", value: "teacher.name", sortable: true },
        { text: "Subject", value: "subject", sortable: true },
        { text: "Phone", value: "phone", sortable: false },
        { text: "Payment", value: "payment", sortable: true, align: 'end' }
      ],
      students: [],
      // Subject color mappings
      subjectColors: {
        "Mathematics": "indigo",
        "Physics": "deep-purple",
        "Chemistry": "teal",
        "Biology": "green",
        "History": "brown",
        "Geography": "blue-grey",
        "Literature": "amber darken-2",
        "English": "light-blue darken-1",
        "Computer Science": "deep-orange",
        "Art": "pink",
        "Music": "purple",
        "Physical Education": "red"
      },
      // Default colors for subjects not in the mapping
      defaultSubjectColors: ["blue", "indigo", "teal", "cyan", "green", "orange", "deep-purple", "red"]
    };
  },
  computed: {
    filteredStudents() {
      if (!this.students) return [];
      
      let filtered = this.students;
      
      // Filter by teacher if not admin
      if (this.role !== "admin") {
        filtered = filtered.filter(student => 
          student.teacher && 
          student.teacher.name && 
          this.currentUser && 
          student.teacher.name.toLowerCase() === this.currentUser.toLowerCase()
        );
      }
      
      // Filter by search term
      if (this.search) {
        filtered = filtered.filter(student => 
          (student.name && student.name.toLowerCase().includes(this.search.toLowerCase())) || 
          (student.surname && student.surname.toLowerCase().includes(this.search.toLowerCase()))
        );
      }
      
      return filtered;
    },
    totalStudents() {
      return this.filteredStudents.length;
    },
    totalPayments() {
      return this.filteredStudents.reduce((total, student) => {
        const parsedPayment = this.parsePayment(student.payment);
        return !isNaN(parsedPayment) ? total + parsedPayment : total;
      }, 0);
    },
    uniqueSubjects() {
      const subjects = new Set();
      this.filteredStudents.forEach(student => {
        if (student.subject) {
          subjects.add(student.subject);
        }
      });
      return Array.from(subjects);
    },
    uniqueTeachers() {
      const teachers = new Set();
      this.filteredStudents.forEach(student => {
        if (student.teacher && student.teacher.name) {
          teachers.add(student.teacher.name);
        }
      });
      return Array.from(teachers);
    }
  },
  async created() {
    // Get user info from local storage
    this.currentUser = localStorage.getItem("teacherName");
    this.role = localStorage.getItem("userRole");

    if (this.role) {
      await this.loadStudents();
    } else {
      console.error("No role found. Please log in to view students.");
      // Redirect to login page
      this.$router.push('/login');
    }
  },
  watch: {
    totalStudents() {
      this.updateTeacherSummary();
    },
    totalPayments() {
      this.updateTeacherSummary();
    }
  },
  methods: {
    // Format currency
    formatCurrency(value) {
      if (value === undefined || value === null) return "0 so'm";
      return new Intl.NumberFormat('uz-UZ').format(value) + " so'm";
    },
    
    // Parse payment from different formats
    parsePayment(payment) {
      if (!payment) return 0;
      
      let paymentValue = payment;
      if (typeof paymentValue !== "string") {
        paymentValue = String(paymentValue);
      }
      return parseFloat(paymentValue.replace(/[^\d.-]/g, "")) || 0;
    },
    
    // Get payment class based on amount
    getPaymentClass(payment) {
      const amount = this.parsePayment(payment);
      if (amount > 1000000) return 'success--text';
      if (amount > 500000) return 'primary--text';
      return 'grey--text text--darken-1';
    },
    
    // Format phone number
    formatPhone(phone) {
      if (!phone) return '—';
      
      // Clean the input
      const cleaned = ('' + phone).replace(/\D/g, '');
      
      // Format as +998 XX XXX-XX-XX if it's a valid Uzbek number
      if (cleaned.length === 12 && cleaned.startsWith('998')) {
        return `+${cleaned.substring(0, 3)} ${cleaned.substring(3, 5)} ${cleaned.substring(5, 8)}-${cleaned.substring(8, 10)}-${cleaned.substring(10, 12)}`;
      }
      
      return phone;
    },
    
    // Get teacher initials
    getInitials(name) {
      if (!name) return '?';
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    },
    
    // Get subject color
    getSubjectColor(subject) {
      if (!subject) return this.defaultSubjectColors[0];
      
      // If the subject has a specific defined color, use it
      if (this.subjectColors[subject]) {
        return this.subjectColors[subject];
      }
      
      // Otherwise, assign a color based on the first character of the subject
      const charCode = subject.charCodeAt(0);
      const index = charCode % this.defaultSubjectColors.length;
      return this.defaultSubjectColors[index];
    },
    
    // Fetch students data
    async loadStudents() {
      this.loading = true;
      try {
        let studentQuery;
        if (this.role === "admin") {
          studentQuery = collection(db, "students");
        } else if (this.currentUser) {
          studentQuery = query(
            collection(db, "students"),
            where("teacher.name", "==", this.currentUser)
          );
        } else {
          throw new Error("No current user found");
        }

        const querySnapshot = await getDocs(studentQuery);
        this.students = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }));
      } catch (error) {
        console.error("Error fetching students:", error);
        this.students = [];
      } finally {
        this.loading = false;
      }
    },

    // Update teacher summary
    async updateTeacherSummary() {
      if (!this.currentUser || this.role === "admin") {
        return;
      }

      try {
        const teacherDocRef = doc(db, "users", this.currentUser);
        
        const teacherData = {
          name: this.currentUser,
          totalStudents: this.totalStudents,
          totalPayments: this.totalPayments,
          lastUpdated: new Date()
        };

        await setDoc(teacherDocRef, teacherData, { merge: true });
        console.log("Teacher summary updated successfully.");
      } catch (error) {
        console.error("Error updating teacher summary:", error);
      }
    }
  }
};
</script>

<style scoped>
/* Gradient text for title */
.gradient-text {
  background: linear-gradient(45deg, #1976d2, #2196f3, #42a5f5);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 700;
  font-size: 2.5rem;
  margin-bottom: 1rem;
  letter-spacing: 1px;
}

/* Stats cards styling */
.stats-card {
  border-radius: 5px;
  transition: transform 0.3s, box-shadow 0.3s;
  overflow: hidden;
  position: relative;
}

.stats-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.stats-card:before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
}

.student-card:before {
  background: linear-gradient(90deg, #1976d2, #42a5f5);
}

.payment-card:before {
  background: linear-gradient(90deg, #4caf50, #8bc34a);
}

.stat-icon-container {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.primary {
  background: linear-gradient(135deg, #1976d2, #42a5f5);
}

.success {
  background: linear-gradient(135deg, #4caf50, #8bc34a);
}

.stat-label {
  color: #78909c;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #37474f;
}

/* Table styling */
.table-card {
  border-radius: 5px;
  overflow: hidden;
}

.table-header {
  background: linear-gradient(to right, #f5f7fa, #eceff1);
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
}

/* Custom header - removed custom header CSS causing issues */

/* Search box styling */
.search-card {
  border-radius: 5px;
}

.search-field {
  border-radius: 5px;
}

/* Responsive styles */
@media (max-width: 960px) {
  .gradient-text {
    font-size: 1.8rem;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .stat-icon-container {
    width: 56px;
    height: 56px;
  }
}

@media (max-width: 600px) {
  .gradient-text {
    font-size: 1.5rem;
    margin-top: 1rem;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
  
  .stat-icon-container {
    width: 48px;
    height: 48px;
  }
  
  .v-card-text {
    padding: 12px !important;
  }
}
</style>