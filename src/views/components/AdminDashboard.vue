<template>
  <v-container fluid>
    <!-- Admin Dashboard Stats Cards -->
    <v-row class="my-5">
      <v-col v-for="(stat, index) in statsCards" :key="index" cols="12" md="4">
        <v-card 
          class="text-center" 
          elevation="2"
          :color="stat.color"
          dark
        >
          <v-card-title class="d-flex align-center justify-center">
            <v-icon size="24" class="mr-2">{{ stat.icon }}</v-icon>
            {{ stat.title }}
          </v-card-title>
          <v-card-subtitle class="text-h4 white--text pb-3">
            {{ stat.value }}
          </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
    
    <!-- Dashboard Overview Section -->
    <DashboardOverview class="mt-6"></DashboardOverview>
  </v-container>
</template>

<script>
import { db } from "@/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default {
  name: 'AdminDashboard',
  
  data() {
    return {
      totalStudents: 0,
      totalPayments: 0,
      totalPass: 0,
      isLoading: true
    };
  },

  computed: {
    statsCards() {
      return [
        {
          title: "Jami O'quvchilar",
          value: `${this.totalStudents} ta`,
          color: "primary",
          icon: "mdi-account-group"
        },
        {
          title: "Jami To'lovlar",
          value: `${this.formatCurrency(this.totalPayments)} so'm`,
          color: "success",
          icon: "mdi-cash"
        },
        {
          title: "Jami O'tganlar",
          value: `${this.totalPass} ta`,
          color: "info",
          icon: "mdi-school"
        }
      ];
    }
  },

  methods: {
    formatCurrency(value) {
      return new Intl.NumberFormat('uz-UZ').format(value);
    },
    
    async fetchData() {
      try {
        this.isLoading = true;
        
        // Fetch students data
        const studentsSnapshot = await getDocs(collection(db, "students"));
        this.totalStudents = studentsSnapshot.size;
        
        // Calculate total payments
        this.totalPayments = studentsSnapshot.docs.reduce((total, doc) => {
          const studentData = doc.data();
          let paymentValue = studentData.payment || 0;
          
          // Convert string payment values to numbers
          if (typeof paymentValue === "string") {
            paymentValue = paymentValue.replace(/[^\d.-]/g, "");
          }
          
          const parsedPayment = parseFloat(paymentValue);
          return !isNaN(parsedPayment) ? total + parsedPayment : total;
        }, 0);
        
        // Fetch teachers data
        const teachersSnapshot = await getDocs(collection(db, "teachers"));
        this.totalPass = teachersSnapshot.size;
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        // You could implement error handling/notification here
      } finally {
        this.isLoading = false;
      }
    }
  },
  
  created() {
    this.fetchData();
  }
};
</script>

<style scoped>
.v-card {
  transition: transform 0.3s;
}

.v-card:hover {
  transform: translateY(-5px);
}

.v-card-subtitle {
  font-weight: bold;
}
</style>