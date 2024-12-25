<template>
  <v-container>
    <v-card>
      <v-data-table
        :headers="headers"
        :items="filteredStudents"
        item-value="id"
        class="elevation-1 rounded-lg"
        dense
      >
        <template v-slot:top>
          <v-toolbar flat class="title-blog">
            <v-toolbar-title class="">O'quvchilar To'lov Jadvali</v-toolbar-title> 
            <br>
            <v-text-field
              v-model="search"
              label="Qidirish"
              prepend-icon="mdi-magnify"
              class="mt-6 none-title"
            />
          </v-toolbar>
        </template>

        <tbody>
          <tr>
            <td colspan="1"><strong>№</strong></td>
            <td class="text-center">F.I.SH</td>

            <!-- Dynamic month headers -->
            <td
              class="text-center"
              v-for="(month, index) in months"
              :key="index"
            >
              {{ month }}
            </td>
            <td></td>
          </tr>
          <tr v-for="(student, index) in filteredStudents" :key="student.id">
            <td class="px-4">{{ index + 1 }}</td>
            <!-- Corrected name and surname -->
            <td class="px-4">{{ student.surname }} {{ student.name }}</td>
            <td
              v-for="(payment, monthIndex) in student.payments"
              :key="monthIndex"
              class="text-center px-4"
              :class="{
                'text-success': payment,
                'text-danger': !payment,
              }"
            >
              <v-checkbox
                v-model="student.payments[monthIndex]"
                :value="true"
                color="success"
                dense
                @change="updatePayments(student.id, student.payments)"
              ></v-checkbox>
            </td>
          </tr>
        </tbody>

        <tfoot>
          <tr>
            <td colspan="2"><strong>Jami</strong></td>
            <td v-for="monthIndex in 12" :key="monthIndex" class="text-center">
              <strong>{{ calculateMonthlyTotal(monthIndex - 1) }}</strong>
            </td>
            <td></td>
          </tr>
        </tfoot>
      </v-data-table>
    </v-card>
  </v-container>
</template>

<script>
import { db } from "@/firebaseConfig"; // Firebase konfiguratsiyasi
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore"; // Firestore bilan ishlash uchun kerakli metodlar
import Toastify from "toastify-js"; // Import Toastify

export default {
  data() {
    return {
      search: "", // Qidiruv so'rovi
      months: [
        // Oylik nomlar ro'yxati
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
      role: null, // "admin" yoki "teacher"
      students: [], // O'quvchilar ro'yxati
    };
  },
  computed: {
    filteredStudents() {
      if (this.role === "admin") {
        return this.students.filter(
          (student) =>
            student.name.toLowerCase().includes(this.search.toLowerCase()) ||
            student.surname.toLowerCase().includes(this.search.toLowerCase())
        );
      } else {
        return this.students
          .filter((student) =>
            student.teacher && student.teacher.name
              ? student.teacher.name.toLowerCase() ===
                this.currentUser.toLowerCase()
              : false
          )
          .filter(
            (student) =>
              student.name.toLowerCase().includes(this.search.toLowerCase()) ||
              student.surname.toLowerCase().includes(this.search.toLowerCase())
          );
      }
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
          // Agar payments mavjud bo'lmasa, 12 ta false qiymatli massiv qo'shamiz
          if (!studentData.payments) {
            studentData.payments = Array(12).fill(false);
          }
          return {
            ...studentData,
            id: doc.id,
          };
        });
        console.log(this.students); // O'quvchilarni tekshirish
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
      return this.students.reduce(
        (sum, student) => sum + (student.payments[monthIndex] ? 1 : 0),
        0
      );
    },

    async updatePayments(studentId, payments) {
      // Firestore da o'quvchi ma'lumotini yangilash
      const studentDoc = doc(db, "students", studentId);
      try {
        await updateDoc(studentDoc, { payments }); // Payments ma'lumotini yangilash
        Toastify({
          text: "To'lovlar muvaffaqiyatli yangilandi!",
          duration: 3000,
          backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
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
  },
  created() {
    this.currentUser = localStorage.getItem("teacherName"); // Teacher name from localStorage
    this.role = localStorage.getItem("userRole"); // Get role (admin or teacher)

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
.v-avatar {
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
@media (max-width: 390px) {
  .title-blog{
    flex-direction: column !important;

    margin: 50px 0 0 0;
  }
  .none-title{
    display: none;
  }
  
}
</style>
