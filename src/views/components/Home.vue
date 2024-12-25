<template>
  <v-container>
    <h1 class="text-center mb-4 title">O'quvchilar ro'yxati</h1>

    <!-- Search bar -->
    <v-text-field
      v-model="search"
      label="Search by Name"
      class="mb-4"
      clearable
      outlined
    />

    <!-- Summary Information -->
    <v-row class="mb-4 text-center">
      <v-col cols="6" sm="6" md="6">
        <v-card class="elevation-1">
          <v-card-title>
            <span class="title-text">O'quvchilar soni</span>
            <span class="icon"> <i class="fa-solid fa-user"></i></span
          ></v-card-title>
          <v-card-subtitle style="font-size: 20px"
            >{{ totalStudents }} ta</v-card-subtitle
          >
        </v-card>
      </v-col>

      <v-col cols="6" sm="6" md="6">
        <v-card class="elevation-1 text-center">
          <v-card-title
            ><span class="title-text">Jammi to'lovlar </span>
            <span class="icon">
              <i class="fa-solid fa-money-bill-wave"></i></span
          ></v-card-title>
          <v-card-subtitle class="text-4xl" style="font-size: 20px; flex-wrap: wrap;"
            >{{ totalPayments }} so'm</v-card-subtitle
          >
        </v-card>
      </v-col>
    </v-row>

    <!-- Data Table -->
    <v-data-table
      :headers="headers"
      :items="filteredStudents"
      :items-per-page="10"
      class="elevation-1 text-capitalize"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>O'quvchilar</v-toolbar-title>
        </v-toolbar>
      </template>

      <template v-slot:no-data>
        <v-alert type="info" class="mt-4">
          Hozirgi o'qituvchi uchun talaba topilmadi.
        </v-alert>
      </template>
    </v-data-table>
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
  getDoc,
} from "firebase/firestore";

export default {
  data() {
    return {
      search: "",
      currentUser: null, // Store current teacher's name or ID
      role: "", // Store user role (admin or teacher)
      headers: [
        { text: "Surname", value: "surname" },
        { text: "Name", value: "name" },
        { text: "Teacher Name", value: "teacher.name" },
        { text: "Subject", value: "subject" },
        { text: "Phone", value: "phone" },
        { text: "Payment", value: "payment" },
      ],
      students: [], // All students fetched from Firebase
    };
  },
  computed: {
    // Filter students based on search input and role
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

    // Calculate total number of students
    totalStudents() {
      return this.filteredStudents.length;
    },

    // Calculate total payment
    totalPayments() {
      return this.filteredStudents.reduce((total, student) => {
        let paymentValue = student.payment;
        if (typeof paymentValue !== "string") {
          paymentValue = JSON.stringify(paymentValue); // Convert object to string if necessary
        }
        const parsedPayment = parseFloat(paymentValue.replace(/[^\d.-]/g, ""));
        return !isNaN(parsedPayment) ? total + parsedPayment : total;
      }, 0);
    },
  },

  async created() {
    // Fetch current teacher's name and role on creation
    this.currentUser = localStorage.getItem("teacherName"); // Teacher name from localStorage
    this.role = localStorage.getItem("userRole"); // Get role (admin or teacher)

    if (this.role) {
      await this.loadStudents();
    } else {
      console.error("No role found. Please log in to view students.");
    }
  },

  watch: {
    totalStudents() {
      this.updateTeacherSummary();
    },
    totalPayments() {
      this.updateTeacherSummary();
    },
  },

  methods: {
    // Fetch all students for the current teacher or admin
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
        this.students = querySnapshot.docs.map((doc) => doc.data());
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    },

    // Update teacher summary (total students, total payments)
    async updateTeacherSummary() {
      if (!this.currentUser) {
        console.error("Current teacher is not identified.");
        return;
      }

      try {
        const teacherDocRef = doc(db, "users", this.currentUser); // Use currentUser as document ID
        const teacherDoc = await getDoc(teacherDocRef);

        const teacherData = {
          totalStudents: this.totalStudents,
          totalPayments: this.totalPayments,
        };

        if (teacherDoc.exists()) {
          // Merge and update existing document
          await setDoc(teacherDocRef, teacherData, { merge: true });
          console.log("Teacher summary updated successfully.");
        } else {
          // Create new document if it doesn't exist
          await setDoc(teacherDocRef, teacherData);
          console.log("Teacher summary created successfully.");
        }
      } catch (error) {
        console.error("Error updating teacher summary:", error);
      }
    },
  },
};
</script>

<style scoped>
.text-center {
  text-align: center;
}
.icon {
  display: none;
}
@media (max-width: 390px) {
  .title {
    margin: 38px 0 0 0;
  }
  .title-text {
    display: none;
  }
  .icon {
    display: block;
  }
}

/* .title{
  background: #091f1f6f ;
} */
</style>
