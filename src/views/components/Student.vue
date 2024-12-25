<template>
  <v-container>
    <!-- *** -->
    <v-row
      class="d-flex justify-space-between justify-between mb-4 mt-8 title-student"
      style=""
    >
      <h1 class="px-3">O'quvchilar ma'lumotlari</h1>
      <!-- Search bar and action buttons -->
      <v-col class="text-end">
        <v-btn color="green" @click="openAddModal" class=""
          >o'quvchi qo'shish</v-btn
        >
        <v-btn color="yellow" class="ml-4 left-btn" @click="exportToExcel">
          Excel yuklash</v-btn
        >
      </v-col>
    </v-row>
    <!-- Title-student end -->
    <v-text-field
      v-model="search"
      label="Search by Name"
      class="mb-4"
      clearable
      outlined
    />
    <!-- Date end -->
    <v-data-table
      :headers="headers"
      :items="filteredStudents"
      :items-per-page="10"
      class="elevation-1 text-capitalize"
    >
      <template v-slot:item.index="{ index }">
        <!-- Display sequence number based on index and pagination -->
        {{ index + 1 }}
      </template>
      <template v-slot:item.teacher="{ item }">
        <!-- Display teacher name -->
        {{ item.teacher.name }}
      </template>
      <template v-slot:item.actions="{ item }">
        <!-- Edit Button -->
        <v-btn class="mr-2" color="blue" @click="editStudent(item)">
          <v-icon>mdi-pencil</v-icon>
        </v-btn>
        <!-- Delete Button -->
        <v-btn color="red" @click="deleteStudent(item)">
          <v-icon>mdi-delete</v-icon>
        </v-btn>
      </template>
    </v-data-table>
    <!-- Edit Student Modal -->
    <v-dialog v-model="editModal" max-width="500px">
      <v-card>
        <v-card-title class="headline">O'quvchini taxrirlash</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field v-model="editedStudent.name" label="Ism" required />
            <v-text-field
              v-model="editedStudent.surname"
              label="Familya"
              required
            />
            <v-text-field
              v-model="editedStudent.phone"
              label="Telefon raqam"
              type="number"
              required
            />
            <v-select
              v-model="editedStudent.subject"
              :items="subjects"
              item-text="name"
              item-value="name"
              label="Fan"
              required
            />
            <v-select
              v-model="editedStudent.teacher"
              :items="teachers"
              item-text="name"
              item-value="id"
              label="O'qtuvchi"
            />
            <v-text-field
              v-model="editedStudent.payment"
              label="To'lov summasi"
              type="number"
              required
            />
            <v-text-field
              v-model="editedStudent.date"
              label="Date"
              type="date"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue" @click="updateStudent">saqlash</v-btn>
          <v-btn color="red" @click="editModal = false">bekor qilish</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- Add Student Modal -->
    <v-dialog v-model="addModal" max-width="500px">
      <v-card>
        <v-card-title class="headline">O'quvchi qo'shish </v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field v-model="newStudent.name" label="Ism" required />
            <v-text-field
              v-model="newStudent.surname"
              label="Familya"
              min-lenth="3"
              required
            />
            <v-text-field
              v-model="newStudent.phone"
              label="Telefon raqam"
              type="number"
              required
              maxlength="10"
            />
            <v-select
              v-model="newStudent.subject"
              :items="subjects"
              item-text="name"
              item-value="name"
              label="Fan"
              required
            />
            <v-select
              v-model="newStudent.teacher"
              :items="teachers"
              item-text="name"
              item-value="name"
              label="O'qtuvchi"
              required
              outlined
            />
            <v-text-field
              v-model="newStudent.payment"
              label="To'lov summasi"
              type="number"
              required
            />
            <v-text-field
              v-model="newStudent.date"
              label="Kelgan sanasi"
              type="date"
              required
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue" @click="addStudent">Qo'shish</v-btn>
          <v-btn color="red" @click="addModal = false">Bekor qilish</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <!-- *** -->
  </v-container>
</template>

<script>
// Import necessary Firebase modules and xlsx for Excel export
import { db } from "@/firebaseConfig"; // assuming firebaseConfig.js is set up properly
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import * as XLSX from "xlsx"; // Importing xlsx library
import Toastify from "toastify-js"; // Import Toastify

export default {
  data() {
    return {
      search: "",
      currentUser: null, // Current logged-in teacher username
      headers: [
        { text: "No", value: "index", sortable: false },
        { text: "Surname", value: "surname", class: "text-uppercase" },
        { text: "Name", value: "name" },
        { text: "Teacher", value: "teacher.name" },
        { text: "Subject", value: "subject" },
        { text: "Date", value: "date" },
        { text: "Phone", value: "phone" },
        { text: "Payment", value: "payment" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      students: [],
      subjects: [], // To hold subjects from Firebase
      teachers: [], // To hold teachers from Firebase
      newStudent: {
        name: "",
        surname: "",
        phone: "",
        subject: "",
        teacher: "",
        payment: "",
        date: "",
      },
      editedStudent: {
        name: "",
        surname: "",
        phone: "",
        subject: "",
        teacher: "",
        payment: "",
        date: "",
      },
      addModal: false,
      editModal: false,
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
              ? student.teacher.name === this.currentUser
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
  async created() {
    // Fetch current teacher's name and students on creation
    this.currentUser = localStorage.getItem("teacherName"); // Teacher name from localStorage
    this.role = localStorage.getItem("userRole"); // Get role (admin or teacher)

    if (this.currentUser) {
      await this.loadStudents();
    } else {
      console.error("No teacher logged in. Please log in to view students.");
    }
  },
  methods: {
    // Fetch students data from Firebase
    async loadStudents() {
      try {
        const querySnapshot = await getDocs(collection(db, "students"));
        this.students = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error loading students:", error);
      }
    },
    // Fetch subjects data from Firebase
    async loadSubjects() {
      try {
        const querySnapshot = await getDocs(collection(db, "subjects"));
        this.subjects = querySnapshot.docs.map((doc) => doc.data().name); // Saqlash faqat `name` stringini
      } catch (error) {
        console.error("Error loading teachers:", error);
      }
    },
    // Fetch teachers data from Firebase
    async loadTeachers() {
      try {
        const querySnapshot = await getDocs(collection(db, "teachers"));
        this.teachers = querySnapshot.docs.map((doc) => doc.data().name); // Saqlash faqat `name` stringini
      } catch (error) {
        console.error("Error loading teachers:", error);
      }
    },
    // Open Add Student Modal
    openAddModal() {
      this.newStudent = {
        name: "",
        surname: "",
        phone: "",
        subject: "",
        teacher: "",
        payment: "",
      }; // Reset the form
      this.addModal = true; // Open the modal
    },
    // Add new student to Firebase
    async addStudent() {
      try {
        // Agar payments maydoni mavjud bo'lmasa, uni yaratish
        const payments = Array(12).fill(false); // 12 ta false qiymatli massiv

        // Yangi o'quvchini Firestore'ga qo'shish
        const docRef = await addDoc(collection(db, "students"), {
          ...this.newStudent,
          subject: this.newStudent.subject,
          teacher: { name: this.newStudent.teacher },
          payments: payments, // payments maydonini qo'shish
        });

        // Yangi o'quvchini ro'yxatga qo'shish
        this.students.push({
          ...this.newStudent,
          id: docRef.id,
          payments: payments, // payments ma'lumotini ham qo'shish
        });

        // Toast notification ko'rsatish
        Toastify({
          text: "O'quvchi qo'shildi",
          backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
          className: "info",
        }).showToast();

        // Modalni yopish
        this.addModal = false; // Close the modal
      } catch (error) {
        console.error("Error adding student:", error);

        // Xato haqida notification ko'rsatish
        Toastify({
          text: "O'quvchi qo'shishda xato bor",
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc3a0)",
          className: "error",
        }).showToast();
      }
    },
    // Delete a student from Firebase
    async deleteStudent(student) {
      try {
        await deleteDoc(doc(db, "students", student.id));

        const index = this.students.indexOf(student);
        if (index > -1) {
          this.students.splice(index, 1);
        }

        Toastify({
          text: "O'quvchi o'chirildi ",
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc3a0)",
          className: "error",
        }).showToast();
      } catch (error) {
        console.error("Error deleting student:", error);
        Toastify({
          text: "Error deleting student",
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc3a0)",
          className: "error",
        }).showToast();
      }
    },
    // Open Edit Student Modal
    editStudent(student) {
      this.editedStudent = { ...student };
      this.editModal = true; // Open the edit modal
    },
    // Update student details in Firebase
    async updateStudent() {
      try {
        const studentRef = doc(db, "students", this.editedStudent.id);
        await updateDoc(studentRef, {
          name: this.editedStudent.name,
          surname: this.editedStudent.surname,
          phone: this.editedStudent.phone,
          subject: this.editedStudent.subject,
          teacher: this.editedStudent.teacher,
          teacher: { name: this.editedStudent.teacher },
          payment: this.editedStudent.payment,
          date: this.editedStudent.date,
        });

        // Update student in the local array
        const index = this.students.findIndex(
          (student) => student.id === this.editedStudent.id
        );
        if (index !== -1) {
          this.students[index] = { ...this.editedStudent };
        }

        Toastify({
          text: "Muvofaqiyatli yangilandi ",
          backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
          className: "info",
        }).showToast();

        this.editModal = false; // Close the modal
      } catch (error) {
        console.error("Error updating student:", error);
        Toastify({
          text: "Error updating student",
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc3a0)",
          className: "error",
        }).showToast();
      }
    },
    // Export student data to Excel
    exportToExcel() {
      const ws = XLSX.utils.json_to_sheet(this.filteredStudents);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Students");
      XLSX.writeFile(wb, "students.xlsx");
    },
  },
  async mounted() {
    await this.loadStudents();
    await this.loadSubjects();
    await this.loadTeachers();
  },
};
</script>
<style>
@media (max-width: 400px) {
  .title-student {
    text-align: center;
  }
  .text-end {
    display: flex;
    flex-direction: column;
    justify-content: center;
    text-align: center;
    margin: 0 auto;
  }
  .left-btn {
    margin: 10px 0 !important;
  }
}
</style>