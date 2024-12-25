<template>
  <!--  -->
  <v-app>
    <!-- *** -->
    <v-container>
      <h1 class="text-center mb-4">Student Data Table</h1>
      <!-- Search bar -->
      <v-text-field
        v-model="search"
        label="Search by Name"
        class="mb-4"
        clearable
        outlined
      />
      <!-- Data Table -->
      <v-data-table
        :headers="headers"
        :items="filteredStudents"
        :items-per-page="10"
        class="elevation-1 uppercase"
      >
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Students</v-toolbar-title>
          </v-toolbar>
        </template>

        <template v-slot:no-data>
          <v-alert type="info" class="mt-4">
            No students found for the current teacher.
          </v-alert>
        </template>
      </v-data-table>
    </v-container>
    <!-- *** -->
  </v-app>
  <!--  -->
</template>

<script>
// Import Firebase modules
import { db } from "@/firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default {
  data() {
    return {
      search: "", // Search bar input value
      currentUser: null, // Current logged-in teacher username
      headers: [
        { text: "Surname", value: "surname" },
        { text: "Name", value: "name" },
        { text: "Teacher Name", value: "teacher.name" },
        { text: "Subject", value: "subject" },
        { text: "Phone", value: "phone" },
      ],
      students: [], // All students fetched from Firebase
    };
  },
  computed: {
    // Filter students based on current teacher and search query
    filteredStudents() {
      return this.students
        .filter((student) =>
          student.teacher && student.teacher.name
            ? student.teacher.name.toLowerCase() === this.currentUser.toLowerCase()
            : false
        )
        .filter((student) =>
          student.name.toLowerCase().includes(this.search.toLowerCase()) ||
          student.surname.toLowerCase().includes(this.search.toLowerCase())
        );
    },
  },
  async created() {
    // Fetch current teacher's name and students on creation
    this.currentUser = localStorage.getItem("teacherName"); // Teacher name from localStorage
    if (this.currentUser) {
      await this.loadStudents();
    } else {
      console.error("No teacher logged in. Please log in to view students.");
    }
  },
  methods: {
    // Load students from Firebase
    async loadStudents() {
      try {
        const querySnapshot = await getDocs(collection(db, "students"));
        this.students = querySnapshot.docs.map((doc) => doc.data());
      } catch (error) {
        console.error("Error fetching students from Firebase:", error);
      }
    },
  },
};
</script>

<style scoped>
.text-center {
  text-align: center;
}
</style>
