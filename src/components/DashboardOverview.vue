<template>
  <v-card class="pa-5">
    <v-card-title class="text-h5 text-center"
      >O'qituvchilar Statistikasi</v-card-title
    >
    <div class="teacher-list justify-space-around">
      <div
        v-for="teacher in teachers"
        :key="teacher.id"
        class="teacher-item mx-5"
      >
        <h3 class="px-5 py-3">{{ teacher.name }}</h3>
        <v-btn color="info" @click="viewDetails(teacher)"> Batafsil </v-btn>
      </div>
    </div>
  </v-card>
  <!-- modal open -->
  <v-dialog v-model="showDetails" max-width="600px">
    <v-card>
      <v-card-title>O'qituvchi Batafsil</v-card-title>
      <v-card-text>
        <p><strong>Ismi:</strong> {{ selectedTeacher.name }}</p>
        <p>
          <strong>Oylik maosh:</strong> {{ selectedTeacher.totalPayments }} so'm
        </p>
        <p>
          <strong>Talabalar soni:</strong>
          {{ selectedTeacher.totalStudents }} ta
        </p>
        <ul>
          <li v-for="student in selectedTeacher.students" :key="student.id">
            {{ student.name }}
          </li>
        </ul>
      </v-card-text>
      <v-card-actions>
        <v-btn text @click="showDetails = false">Yopish</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- *** -->
</template>

<script>
import { collection, getDocs,  query, where } from "firebase/firestore";
import { db } from "@/firebaseConfig";

export default {
  data() {
    return {
      teachers: [],
      headers: [
        { text: "Ismi", value: "name" },
        { text: "Oylik maosh", value: "totalPayments" },
        { text: "Talabalar soni", value: "totalStudents" },
        { text: "Batafsil", value: "actions", sortable: false },
      ],
      showDetails: false,
      selectedTeacher: {
        name: "",
        totalPayments: "",
        payments: "",
        totalStudents: "",
      },
    };
  },
  methods: {
    async fetchTeachers() {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        this.teachers = await Promise.all(
          querySnapshot.docs.map(async (doc) => {
            const teacherData = doc.data();
            const studentsQuery = query(
              collection(db, "students"),
              where("teacher", "==", doc.id)
            );
            const studentsSnapshot = await getDocs(studentsQuery);

            return {
              id: doc.id,
              ...teacherData,
              students: studentsSnapshot.docs.map((studentDoc) =>
                studentDoc.data()
              ),
            };
          })
        );
      } catch (error) {
        console.error("O'qituvchilarni yuklashda xatolik:", error);
      }
    },
    viewDetails(teacher) {
      this.selectedTeacher = teacher;
      this.showDetails = true;
    },
  },
  mounted() {
    this.fetchTeachers();
  },
};
</script>
<style scoped>
.teacher-list {
  display: flex;
  flex-wrap: wrap !important;
}
</style>