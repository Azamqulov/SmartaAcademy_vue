<template>
  <v-container>
    <!-- Admin Paneli -->
    <v-row class="my-5">
      <v-col cols="12" md="4">
        <v-card class="text-h5 text-center" outlined>
          <v-card-title>Jami O'quvchilar</v-card-title>
          <v-card-subtitle class="text-h5"
            >{{ totalStudents }} ta</v-card-subtitle
          >
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="text-h5 text-center" outlined>
          <v-card-title>Jami To'lovlar</v-card-title>
          <v-card-subtitle class="text-h5"
            >{{ totalPayments }} so'm</v-card-subtitle
          >
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card class="text-h5 text-center" outlined>
          <v-card-title>Jami O'tganlar</v-card-title>
          <v-card-subtitle class="text-h5">{{ totalPass }} ta </v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
    <!-- ******* -->
    <DashboardOverview class="mt-5"></DashboardOverview>
    <!-- *******  -->
  </v-container>
</template>
  
  <script>
import { db } from "@/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";
export default {
  data() {
    return {
      totalStudents: 0, // Total number of students
      totalPayments: 0, // Total payments
      totalPass: 0, // Total students who passed
    };
  },
  methods: {
    // Fetch the total number of students, total payments, and passed students
    async fetchData() {
      try {
        // Fetch all students
        const studentsCollection = collection(db, "students");
        const studentsSnapshot = await getDocs(studentsCollection);
        const students = studentsSnapshot.docs.map((doc) => doc.data());
        const teacherCollection = collection(db, "teachers");
        const teachersSnapshot = await getDocs(teacherCollection);
        const teacher = teachersSnapshot.docs.map((doc) => doc.data());
        // Calculate total students
        this.totalStudents = students.length;
        this.totalPass = teacher.length;
        // Barcha to'lovlar summasini hisoblash
        let totalPayments = 0;
        studentsSnapshot.forEach((doc) => {
          const studentData = doc.data();
          let paymentValue = studentData.payment || 0;
          // Agar payment qiymati string bo'lsa, uni raqamga aylantirish
          if (typeof paymentValue === "string") {
            paymentValue = paymentValue.replace(/[^\d.-]/g, ""); // Faqat raqamlar va nuqtalarni qoldirib, qolganini olib tashlash
          }
          // Payment qiymatini raqamga aylantirish
          const parsedPayment = parseFloat(paymentValue);
          // Agar raqamga aylantirish muvaffaqiyatli bo'lsa, totalPayments ga qo'shish
          if (!isNaN(parsedPayment)) {
            totalPayments += parsedPayment;
          }
        });
        // To'lovlar summasini saqlash
        this.totalPayments = totalPayments;
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    },
  },
  // Fetch data when the component is created
  created() {
    this.fetchData();
  },
};
</script>
  
  <style scoped>
/* Custom Styles */
</style>
  