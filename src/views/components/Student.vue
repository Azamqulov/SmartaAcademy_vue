<template>
  <v-container fluid>
    <!-- Dashboard Header with Blue Background -->
    <v-sheet class="header-banner mb-6 pa-6 d-flex flex-column justify-center " color="blue" elevation="2" height="160">
      <div class="d-flex flex-column flex-md-row justify-space-between align-center">
        <div class="header-content">
          <h1 class="text-h3 font-weight-bold white--text mb-2">
            O'quvchilar ma'lumotlari
          </h1>O'quvchini
          <p class="text-subtitle-1 white--text">
            Ta'lim markazidagi o'quvchilar ro'yxati
          </p>
        </div>
        <div class="d-flex flex-column flex-md-row mt-4 mt-md-0">
          <v-btn color="white" elevation="1" class="px-4 primary--text" prepend-icon="mdi-account-plus"
            @click="openAddModal">
            O'quvchi qo'shish
          </v-btn>
          <v-btn color="blue-lighten-1" elevation="1" class="mt-3 mt-md-0 ml-md-4 px-4 white--text"
            prepend-icon="mdi-file-excel" @click="exportToExcel">
            Excel yuklash
          </v-btn>
        </div>
      </div>
    </v-sheet>

    <!-- Search and Filter Panel -->
    <v-card class="mb-6 rounded-lg" elevation="1">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-text-field v-model="search" label="Ism yoki familiya bo'yicha qidirish" prepend-inner-icon="mdi-magnify"
              clearable filled dense hide-details color="primary"></v-text-field>
          </v-col>
          <v-col cols="12" md="6" v-if="!isAdmin">
            <v-select v-model="selectedSubject" :items="subjects" label="Fan bo'yicha filterlash"
              prepend-inner-icon="mdi-book-open-variant" filled dense hide-details clearable color="primary"></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Students Data Table -->
    <v-card class="rounded-xl" elevation="2">
      <v-card-title class="subtitle-1 font-weight-bold">
        <v-icon left color="blue">mdi-account-group</v-icon>
        O'quvchilar ro'yxati
        <v-chip class="ml-2" color="blue" small outlined>{{ filteredStudents.length }} ta</v-chip>
      </v-card-title>

      <v-data-table :headers="headers" :items="filteredStudents" :items-per-page="10" class="elevation-0" :footer-props="{
        'items-per-page-options': [5, 10, 15, 20],
        'items-per-page-text': 'Sahifada:',
      }">
        <!-- Index column -->
        <template v-slot:item.index="{ index }">
          <v-chip small color="primary" text-color="white" class="font-weight-medium">
            {{ index + 1 }}
          </v-chip>
        </template>

        <!-- Name column with first letter capitalized -->
        <template v-slot:item.name="{ item }">
          <span class="font-weight-medium">{{ item.name }}</span>
        </template>

        <!-- Teacher column -->
        <template v-slot:item.teacher="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="30" color="primary" class="mr-2">
              <span class="white--text">{{ getInitials(item.teacher.name) }}</span>
            </v-avatar>
            {{ item.teacher.name }}
          </div>
        </template>

        <!-- Subject column -->
        <template v-slot:item.subject="{ item }">
          <v-chip small color="blue" text-color="white">
            {{ item.subject }}
          </v-chip>
        </template>

        <!-- Payment column -->
        <template v-slot:item.payment="{ item }">
          <span class="font-weight-bold">{{ formatCurrency(item.payment) }}</span>
        </template>

        <!-- Actions column -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn fab x-small color="primary" class="mr-2" v-bind="attrs" v-on="on" @click="editStudent(item)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Tahrirlash</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn fab x-small color="blue-lighten-1" v-bind="attrs" v-on="on" @click="confirmDelete(item)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>O'chirish</span>
            </v-tooltip>
          </div>
        </template>

        <!-- Empty state -->
        <template v-slot:no-data>
          <div class="pa-6 text-center">
            <h3 class="text-subtitle-1 font-weight-medium grey--text">
              O'quvchilar topilmadi
            </h3>
            <v-btn color="primary" class="mt-3" @click="openAddModal">
              O'quvchi qo'shish
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Add Student Modal with improved UI -->
    <v-dialog v-model="addModal" max-width="600px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="primary white--text">
          <v-icon left color="white">mdi-account-plus</v-icon>
          Yangi o'quvchi qo'shish
        </v-card-title>

        <v-card-text class="pt-6">
          <v-form ref="addForm">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field v-model="newStudent.name" label="Ism" prepend-icon="mdi-account" outlined color="primary"
                  :rules="[(v) => v?.length >= 3 || 'Kamida 3 ta belgi bo\'lishi kerak']"></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field v-model="newStudent.surname" label="Familya" prepend-icon="mdi-account-details" outlined
                  color="primary"
                  :rules="[(v) => v?.length >= 3 || 'Kamida 3 ta belgi bo\'lishi kerak']"></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field v-model="newStudent.phone" label="Telefon raqam" prepend-icon="mdi-phone" outlined
                  type="number" color="primary"
                  :rules="[(v) => v?.length >= 9 || 'To\'g\'ri kiriting telefon raqamni']"></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field v-model="newStudent.payment" label="To'lov summasi" prepend-icon="mdi-cash" outlined
                  type="number" suffix="so'm" color="primary"></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-select v-model="newStudent.subject" :items="subjects" label="Fan" prepend-icon="mdi-book" outlined
                  color="primary" :rules="[(v) => !!v || 'Fan tanlanmadi']"></v-select>
              </v-col>

              <v-col cols="12" sm="6">
                <v-select v-model="newStudent.teacher" :items="teachers" label="O'qtuvchi"
                  prepend-icon="mdi-account-tie" outlined color="primary"
                  :rules="[(v) => !!v || 'O\'qtuvchi tanlanmadi']"></v-select>
              </v-col>

              <v-col cols="12">
                <v-menu ref="dateMenu" v-model="dateMenu" :close-on-content-click="false" transition="scale-transition"
                  min-width="auto">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field v-model="newStudent.date" label="Kelgan sanasi" prepend-icon="mdi-calendar" readonly
                      outlined color="primary" v-bind="attrs" v-on="on"
                      :rules="[(v) => !!v || 'Sana kiritilmadi']"></v-text-field>
                  </template>
                  <v-date-picker v-model="newStudent.date" color="primary" @input="dateMenu = false"></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn text color="grey darken-1" @click="addModal = false">
            Bekor qilish
          </v-btn>
          <v-btn color="primary" :disabled="!newStudent.name || newStudent.name.length < 3" @click="addStudent">
            <v-icon left>mdi-content-save</v-icon>
            Qo'shish
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Edit Student Modal -->
    <v-dialog v-model="editModal" max-width="600px" persistent>
      <v-card class="rounded-lg">
        <v-card-title class="primary white--text">
          <v-icon left color="white">mdi-account-edit</v-icon>
          O'quvchi ma'lumotlarini tahrirlash
        </v-card-title>

        <v-card-text class="pt-6">
          <v-form ref="editForm">
            <v-row>
              <v-col cols="12" sm="6">
                <v-text-field v-model="editedStudent.name" label="Ism" prepend-icon="mdi-account" outlined
                  color="primary"
                  :rules="[(v) => v?.length >= 3 || 'Kamida 3 ta belgi bo\'lishi kerak']"></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field v-model="editedStudent.surname" label="Familya" prepend-icon="mdi-account-details"
                  outlined color="primary"
                  :rules="[(v) => v?.length >= 3 || 'Kamida 3 ta belgi bo\'lishi kerak']"></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field v-model="editedStudent.phone" label="Telefon raqam" prepend-icon="mdi-phone" outlined
                  type="number" color="primary"
                  :rules="[(v) => v?.length >= 9 || 'To\'g\'ri kiriting telefon raqamni']"></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-text-field v-model="editedStudent.payment" label="To'lov summasi" prepend-icon="mdi-cash" outlined
                  type="number" suffix="so'm" color="primary"></v-text-field>
              </v-col>

              <v-col cols="12" sm="6">
                <v-select v-model="editedStudent.subject" :items="subjects" label="Fan" prepend-icon="mdi-book" outlined
                  color="primary"></v-select>
              </v-col>

              <v-col cols="12" sm="6">
                <v-select v-model="editedStudent.teacher" :items="teachers" label="O'qtuvchi"
                  prepend-icon="mdi-account-tie" outlined color="primary"></v-select>
              </v-col>

              <v-col cols="12">
                <v-menu ref="editDateMenu" v-model="editDateMenu" :close-on-content-click="false"
                  transition="scale-transition" min-width="auto">
                  <template v-slot:activator="{ on, attrs }">
                    <v-text-field v-model="editedStudent.date" label="Kelgan sanasi" prepend-icon="mdi-calendar"
                      readonly outlined color="primary" v-bind="attrs" v-on="on"></v-text-field>
                  </template>
                  <v-date-picker v-model="editedStudent.date" color="primary"
                    @input="editDateMenu = false"></v-date-picker>
                </v-menu>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn text color="grey darken-1" @click="editModal = false">
            Bekor qilish
          </v-btn>
          <v-btn color="primary" @click="updateStudent">
            <v-icon left>mdi-content-save</v-icon>
            Saqlash
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="420px">
      <v-card class="rounded-lg">
        <v-card-title class="primary white--text">
          <v-icon left color="red">mdi-alert</v-icon>
          O'quvchini o'chirish
        </v-card-title>

        <v-card-text class="pt-4 text-center">
          <v-icon color="blue" size="64" class="mb-4">mdi-delete-forever</v-icon>
          <h3 class="text-h6 mb-2">
            {{
              studentToDelete ? studentToDelete.name + " " + studentToDelete.surname : ""
            }}
          </h3>
          <p class="text-body-1">Bu o'quvchi ma'lumotlarini o'chirishni istaysizmi?</p>
          <p class="text-caption primary--text mt-2">Bu amalni qaytarib bo'lmaydi!</p>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn text color="grey darken-1" @click="deleteDialog = false">
            Bekor qilish
          </v-btn>
          <v-btn color="primary" @click="confirmDeleteStudent">
            <v-icon left>mdi-delete</v-icon>
            O'chirish
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
// Import necessary Firebase modules and xlsx for Excel export
import { db } from "@/firebaseConfig";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import * as XLSX from "xlsx";
// Import Toastify
import Toastify from 'toastify-js';
import 'toastify-js/src/toastify.css';

export default {
  data() {
    return {
      search: "",
      selectedSubject: null,
      currentUser: null,
      role: "teacher",
      headers: [
        { text: "№", value: "index", sortable: false, width: "70px" },
        { text: "Familya", value: "surname", class: "text-uppercase" },
        { text: "Ism", value: "name" },
        { text: "O'qituvchi", value: "teacher.name" },
        { text: "Fan", value: "subject" },
        { text: "Sana", value: "date" },
        { text: "Telefon", value: "phone" },
        { text: "To'lov", value: "payment" },
        { text: "Amallar", value: "actions", sortable: false, width: "120px" },
      ],
      students: [],
      subjects: [],
      teachers: [],
      newStudent: {
        name: "",
        surname: "",
        phone: "",
        subject: "",
        teacher: "",
        payment: "",
        date: new Date().toISOString().substr(0, 10),
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
      studentToDelete: null,
      addModal: false,
      editModal: false,
      deleteDialog: false,
      dateMenu: false,
      editDateMenu: false,
    };
  },
  computed: {
    isAdmin() {
      return this.role === "admin";
    },
    filteredStudents() {
      let filtered = this.students;

      // Filter by search term
      if (this.search) {
        const searchLower = this.search.toLowerCase();
        filtered = filtered.filter(
          (student) =>
            student.name.toLowerCase().includes(searchLower) ||
            student.surname.toLowerCase().includes(searchLower)
        );
      }

      // Filter by subject
      if (this.selectedSubject) {
        filtered = filtered.filter((student) => student.subject === this.selectedSubject);
      }

      // Filter by teacher if not admin
      if (!this.isAdmin) {
        filtered = filtered.filter(
          (student) => student.teacher && student.teacher.name === this.currentUser
        );
      }

      return filtered;
    },
  },
  async created() {
    // Fetch current teacher's name and students on creation
    this.currentUser = localStorage.getItem("teacherName");
    this.role = localStorage.getItem("userRole") || "teacher";

    if (this.currentUser) {
      await this.loadStudents();
    } else {
      console.error("No teacher logged in. Please log in to view students.");
      this.showNotification("O'qituvchi tizimga kirmagan. Iltimos, tizimga kiring.", "error");
    }
  },
  methods: {
    // Get initials from name
    getInitials(name) {
      return name
        ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
        : "?";
    },

    // Format currency with thousand separators
    formatCurrency(value) {
      if (!value) return "0";
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
    },

    // Fetch students data from Firebase
    async loadStudents() {
      try {
        const querySnapshot = await getDocs(collection(db, "students"));
        this.students = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        this.showNotification("O'quvchilar ma'lumotlari muvaffaqiyatli yuklandi", "success");
      } catch (error) {
        console.error("Error loading students:", error);
        this.showNotification("O'quvchilar ma'lumotlarini yuklashda xatolik", "error");
      }
    },

    // Fetch subjects data from Firebase
    async loadSubjects() {
      try {
        const querySnapshot = await getDocs(collection(db, "subjects"));
        this.subjects = querySnapshot.docs.map((doc) => doc.data().name);
      } catch (error) {
        console.error("Error loading subjects:", error);
        this.showNotification("Fanlar ma'lumotlarini yuklashda xatolik", "error");
      }
    },

    // Fetch teachers data from Firebase
    async loadTeachers() {
      try {
        const querySnapshot = await getDocs(collection(db, "teachers"));
        this.teachers = querySnapshot.docs.map((doc) => doc.data().name);
      } catch (error) {
        console.error("Error loading teachers:", error);
        this.showNotification("O'qituvchilar ma'lumotlarini yuklashda xatolik", "error");
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
        date: new Date().toISOString().substr(0, 10),
      };
      this.addModal = true;
    },

    // Add new student to Firebase
    async addStudent() {
      try {
        // Input validation
        if (!this.newStudent.name.trim()) {
          this.showNotification("O'quvchi ismi kiritilmagan", "error");
          return;
        }
        if (!this.newStudent.surname.trim()) {
          this.showNotification("O'quvchi familyasi kiritilmagan", "error");
          return;
        }
        if (!this.newStudent.subject) {
          this.showNotification("Fan tanlanmagan", "error");
          return;
        }
        if (!this.newStudent.teacher) {
          this.showNotification("O'qituvchi tanlanmagan", "error");
          return;
        }

        // Create payments array with 12 false values
        const payments = Array(12).fill(false);

        // Add new student to Firestore
        const docRef = await addDoc(collection(db, "students"), {
          ...this.newStudent,
          subject: this.newStudent.subject,
          teacher: { name: this.newStudent.teacher },
          payments: payments,
        });

        // Add new student to local array
        this.students.push({
          ...this.newStudent,
          id: docRef.id,
          teacher: { name: this.newStudent.teacher },
          payments: payments,
        });

        // Show success notification
        this.showNotification("O'quvchi muvaffaqiyatli qo'shildi", "success");

        // Close the modal
        this.addModal = false;
      } catch (error) {
        console.error("Error adding student:", error);
        this.showNotification("O'quvchi qo'shishda xatolik yuz berdi", "error");
      }
    },

    // Confirm delete student
    confirmDelete(student) {
      this.studentToDelete = student;
      this.deleteDialog = true;
    },

    // Delete confirmed student
    async confirmDeleteStudent() {
      if (!this.studentToDelete) return;

      try {
        await deleteDoc(doc(db, "students", this.studentToDelete.id));

        // Remove student from local array
        const index = this.students.findIndex((s) => s.id === this.studentToDelete.id);
        if (index > -1) {
          this.students.splice(index, 1);
        }

        // Show success notification
        this.showNotification("O'quvchi muvaffaqiyatli o'chirildi", "info");

        // Close dialog
        this.deleteDialog = false;
        this.studentToDelete = null;
      } catch (error) {
        console.error("Error deleting student:", error);
        this.showNotification("O'quvchi o'chirishda xatolik yuz berdi", "error");
      }
    },

    // Open Edit Student Modal
    editStudent(student) {
      this.editedStudent = {
        ...student,
        teacher: student.teacher ? student.teacher.name : "",
      };
      this.editModal = true;
    },

    // Update student details in Firebase
    async updateStudent() {
      try {
        // Input validation
        if (!this.editedStudent.name.trim()) {
          this.showNotification("O'quvchi ismi kiritilmagan", "error");
          return;
        }
        if (!this.editedStudent.surname.trim()) {
          this.showNotification("O'quvchi familyasi kiritilmagan", "error");
          return;
        }

        const studentRef = doc(db, "students", this.editedStudent.id);

        // Prepare update object
        const updateData = {
          name: this.editedStudent.name,
          surname: this.editedStudent.surname,
          phone: this.editedStudent.phone,
          subject: this.editedStudent.subject,
          teacher: { name: this.editedStudent.teacher },
          payment: this.editedStudent.payment,
          date: this.editedStudent.date,
        };

        // Update in Firebase
        await updateDoc(studentRef, updateData);

        // Update student in local array
        const index = this.students.findIndex((s) => s.id === this.editedStudent.id);
        if (index !== -1) {
          this.students[index] = {
            ...this.editedStudent,
            teacher: { name: this.editedStudent.teacher },
          };
        }

        // Show success notification
        this.showNotification(
          "O'quvchi ma'lumotlari muvaffaqiyatli yangilandi",
          "success"
        );

        // Close modal
        this.editModal = false;
      } catch (error) {
        console.error("Error updating student:", error);
        this.showNotification("O'quvchi ma'lumotlarini yangilashda xatolik", "error");
      }
    },

    // Export student data to Excel
    exportToExcel() {
      try {
        if (this.filteredStudents.length === 0) {
          this.showNotification("Export qilish uchun ma'lumot topilmadi", "error");
          return;
        }

        // Prepare data for export - remove complex objects and ID
        const exportData = this.filteredStudents.map((student, index) => ({
          "№": index + 1,
          Ism: student.name,
          Familya: student.surname,
          Fan: student.subject,
          "O'qituvchi": student.teacher ? student.teacher.name : "",
          Sana: student.date,
          Telefon: student.phone,
          "To'lov": student.payment,
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "O'quvchilar");
        XLSX.writeFile(wb, "o'quvchilar_ro'yxati.xlsx");

        this.showNotification("Excel fayli muvaffaqiyatli yuklandi", "success");
      } catch (error) {
        console.error("Error exporting to Excel:", error);
        this.showNotification("Excel faylini yuklashda xatolik", "error");
      }
    },

    // Enhanced notification method using Toastify
    showNotification(message, type = "success") {
      const config = {
        text: message,
        duration: 4000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {},
        onClick: function(){} // Callback after click
      };

      // Set colors and icons based on type
      switch (type) {
        case "success":
          config.style = {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)"
          };
          config.text = "✅ " + message;
          break;
        case "error":
          config.style = {
            background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(245, 87, 108, 0.4)"
          };
          config.text = "❌ " + message;
          break;
        case "info":
          config.style = {
            background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            color: "#fff",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(79, 172, 254, 0.4)"
          };
          config.text = "ℹ️ " + message;
          break;
        case "warning":
          config.style = {
            background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
            color: "#333",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(250, 112, 154, 0.4)"
          };
          config.text = "⚠️ " + message;
          break;
        default:
          config.style = {
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "#fff",
            borderRadius: "8px"
          };
      }

      // Show the toast notification
      Toastify(config).showToast();
    },

    // Additional method for custom notifications
    showCustomNotification(message, options = {}) {
      const defaultOptions = {
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "#fff",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
        }
      };

      const config = { ...defaultOptions, ...options };
      Toastify(config).showToast();
    }
  },
  async mounted() {
    try {
      await Promise.all([
        this.loadStudents(),
        this.loadSubjects(),
        this.loadTeachers()
      ]);
    } catch (error) {
      console.error("Error loading initial data:", error);
      this.showNotification("Ma'lumotlarni yuklashda xatolik yuz berdi", "error");
    }
  },
};
</script>

<style scoped>
.v-container.fluid {
  max-width: 95% !important;
}

.student-dashboard {
  margin: 20px;
  padding: 2rem !important;
}

.header-banner {
  background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%);
  position: relative;
  overflow: hidden;
}

.student-dashboard .v-data-table th {
  font-weight: bold !important;
  text-transform: uppercase;
  font-size: 0.8rem;
  color: #1976d2;
}

.student-dashboard .v-data-table tbody tr:hover {
  background-color: #f0f7ff;
}

@media (max-width: 600px) {
  .header-banner {
    height: auto !important;
    padding: 1.5rem !important;
  }

  .text-h3 {
    font-size: 1.5rem !important;
  }
}
</style>
