<template>
  <v-container fluid class="student-dashboard pa-0">
    <!-- Dashboard Header with Enhanced Gradient Background -->
    <v-sheet
      class="header-banner mb-6 pa-6 d-flex flex-column justify-center"
      elevation="3"
      height="180"
    >
      <div class="header-pattern"></div>
      <div class="d-flex flex-column flex-md-row justify-space-between align-center">
        <div class="header-content">
          <h1 class="text-h4 font-weight-bold mb-2">
            <v-icon large color="blue" class="mr-2">mdi-school</v-icon>
            O'quvchilar ma'lumotlari
          </h1>
          <p class="text-subtitle-1 white--text">
            <v-icon small color="blue" class="mr-1 ml-2">mdi-information-outline</v-icon>
            Ta'lim markazidagi o'quvchilar ro'yxati
            <v-chip x-small outlined color="white" class="ml-2 white--text"
              >{{ filteredStudents.length }} ta o'quvchi</v-chip
            >
          </p>
        </div>
        <div class="d-flex flex-column flex-md-row mt-4 mt-md-0">
          <v-btn
            color="white"
            elevation="2"
            class="px-4 primary--text action-btn"
            @click="openAddModal"
            rounded
          >
            <v-icon left>mdi-account-plus</v-icon>
            O'quvchi qo'shish
          </v-btn>
          <br />
          <v-btn
            color="blue accent-4"
            elevation="2"
            class="mt-3 mt-md-0 ml-md-4 px-4 white--text action-btn"
            @click="exportToExcel"
            rounded
          >
            <v-icon left>mdi-file-excel</v-icon>
            Excel yuklash
          </v-btn>
        </div>
      </div>
    </v-sheet>

    <!-- Search and Filter Panel with Animation -->
    <v-card class="mb-6 search-card" elevation="2">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" :md="isAdmin ? 6 : 12">
            <v-text-field
              v-model="search"
              label="Ism yoki familiya bo'yicha qidirish"
              prepend-inner-icon="mdi-magnify"
              clearable
              filled
              dense
              color="blue"
              hide-details
              class="search-field"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6" v-if="isAdmin">
            <v-select
              v-model="selectedSubject"
              :items="subjects"
              label="Fan bo'yicha filterlash"
              prepend-inner-icon="mdi-book-open-variant"
              filled
              dense
              rounded
              hide-details
              clearable
              color="blue"
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Students Data Table with Enhanced UI -->
    <v-card class="rounded-lg table-card" elevation="3">
      <div class="data-header pa-4">
        <div class="d-flex align-center">
          <v-icon size="28" color="blue" class="mr-2">mdi-account-group</v-icon>
          <h2 class="text-h6 font-weight-bold mb-0">O'quvchilar ro'yxati</h2>
          <v-chip class="ml-2" color="blue" small
            >{{ filteredStudents.length }} ta</v-chip
          >
        </div>

        <div class="table-actions">
          <v-btn
            small
            icon
            color="blue"
            @click="loadStudents"
            class="mr-2"
            title="Yangilash"
          >
            <v-icon>mdi-refresh</v-icon>
          </v-btn>
        </div>
      </div>

      <v-data-table
        :headers="headers"
        :items="filteredStudents"
        :items-per-page="10"
        :dense="denseTable === 1"
        :loading="loading"
        class="elevation-0"
        :footer-props="{
          'items-per-page-options': [5, 10, 15, 20],
          'items-per-page-text': 'Sahifada:',
        }"
        :sort-by="['surname']"
        :sort-desc="[false]"
        multi-sort
      >
        <!-- Custom loading -->
        <template v-slot:loading>
          <div class="d-flex justify-center align-center pa-4">
            <v-progress-circular
              indeterminate
              color="blue"
              size="64"
            ></v-progress-circular>
          </div>
        </template>

        <!-- Index column -->
        <template v-slot:item.index="{ index }">
          <v-chip x-small color="blue" text-color="white" class="font-weight-bold">
            {{ index + 1 }}
          </v-chip>
        </template>

        <!-- Name column -->
        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" color="blue lighten-4" class="mr-2">
              <span class="blue--text font-weight-bold">{{
                getInitials(item.name)
              }}</span>
            </v-avatar>
            <span class="font-weight-medium">{{ item.name }}</span>
          </div>
        </template>

        <!-- Teacher column -->
        <template v-slot:item.teacher="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="28" color="indigo lighten-1" class="mr-2">
              <span class="white--text">{{ getInitials(item.teacher.name) }}</span>
            </v-avatar>
            <span>{{ item.teacher.name }}</span>
          </div>
        </template>

        <!-- Subject column -->
        <template v-slot:item.subject="{ item }">
          <v-chip
            small
            :color="getSubjectColor(item.subject)"
            text-color="white"
            class="font-weight-medium"
          >
            {{ item.subject }}
          </v-chip>
        </template>

        <!-- Phone column -->
        <template v-slot:item.phone="{ item }">
          <div class="d-flex align-center">
            <v-icon small color="grey" class="mr-1">mdi-phone</v-icon>
            {{ formatPhone(item.phone) }}
          </div>
        </template>

        <!-- Date column -->
        <template v-slot:item.date="{ item }">
          <div class="d-flex align-center">
            <v-icon small color="grey" class="mr-1">mdi-calendar</v-icon>
            {{ formatDate(item.date) }}
          </div>
        </template>

        <!-- Payment column -->
        <template v-slot:item.payment="{ item }">
          <span class="font-weight-bold" :class="getPaymentColor(item.payment)">
            {{ formatCurrency(item.payment) }}
          </span>
        </template>

        <!-- Actions column -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  fab
                  x-small
                  color="blue"
                  class="mr-2 elevation-2"
                  v-bind="attrs"
                  v-on="on"
                  @click="editStudent(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Tahrirlash</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  fab
                  x-small
                  color="error"
                  class="elevation-2"
                  v-bind="attrs"
                  v-on="on"
                  @click="confirmDelete(item)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </template>
              <span>O'chirish</span>
            </v-tooltip>
          </div>
        </template>

        <!-- Empty state -->
        <template v-slot:no-data>
          <div class="pa-6 text-center empty-state">
            <v-icon size="64" color="grey lighten-1">mdi-account-search</v-icon>
            <h3 class="text-subtitle-1 font-weight-medium grey--text mt-3">
              O'quvchilar topilmadi
            </h3>
            <v-btn color="blue" class="mt-3" rounded @click="openAddModal">
              <v-icon left>mdi-account-plus</v-icon>
              O'quvchi qo'shish
            </v-btn>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <!-- Student Modal Component -->
    <student-modal
      :add-modal="addModal"
      :edit-modal="editModal"
      :delete-dialog="deleteDialog"
      :new-student="newStudent"
      :edited-student="editedStudent"
      :student-to-delete="studentToDelete"
      :subjects="subjects"
      :teachers="teachers"
      @close-add-modal="addModal = false"
      @close-edit-modal="editModal = false"
      @close-delete-modal="deleteDialog = false"
      @add-student="addStudent"
      @update-student="updateStudent"
      @confirm-delete="confirmDeleteStudent"
    />
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
import StudentModal from "./StudentModal.vue";

export default {
  components: {
    StudentModal,
  },
  data() {
    return {
      search: "",
      selectedSubject: null,
      currentUser: null,
      role: "teacher",
      loading: true,
      denseTable: 0,
      headers: [
        { text: "№", value: "index", sortable: false, width: "60px" },
        { text: "Familya", value: "surname", class: "text-uppercase" },
        { text: "Ism", value: "name" },
        { text: "O'qituvchi", value: "teacher.name" },
        { text: "Fan", value: "subject" },
        { text: "Sana", value: "date" },
        { text: "Telefon", value: "phone" },
        { text: "To'lov", value: "payment" },
        {
          text: "Amallar",
          value: "actions",
          sortable: false,
          align: "center",
          width: "120px",
        },
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
      // Subject colors for chips
      subjectColors: {
        Matematika: "blue",
        Fizika: "indigo",
        Kimyo: "deep-purple",
        Biologiya: "green",
        "Ingliz tili": "cyan darken-1",
        "Rus tili": "red lighten-1",
        Informatika: "teal",
      },
      lastSubject: "", // For random subject color
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
            student.name?.toLowerCase().includes(searchLower) ||
            student.surname?.toLowerCase().includes(searchLower)
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
      this.loading = true;
      await this.loadStudents();
      await this.loadSubjects();
      await this.loadTeachers();
      this.loading = false;
    } else {
      console.error("No teacher logged in. Please log in to view students.");
      this.showNotification("Tizimga kirilmagan. Iltimos qayta kiring!", "error");
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

    // Format phone number for better readability
    formatPhone(phone) {
      if (!phone) return "";
      const numbers = phone.toString().replace(/\D/g, "");
      if (numbers.length < 9) return phone;

      // Format as +998 XX XXX-XX-XX
      if (numbers.length === 9) {
        return numbers.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, "($1) $2-$3-$4");
      }
      return numbers.replace(/(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, "+$1 ($2) $3-$4-$5");
    },

    // Format date for better display
    formatDate(dateString) {
      if (!dateString) return "";
      const options = { year: "numeric", month: "2-digit", day: "2-digit" };
      return new Date(dateString).toLocaleDateString("uz-UZ", options);
    },

    // Format currency with thousand separators
    formatCurrency(value) {
      if (!value) return "0 so'm";
      return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
    },

    // Get color class based on payment amount
    getPaymentColor(payment) {
      const amount = parseInt(payment) || 0;
      if (amount > 500000) return "green--text";
      if (amount > 300000) return "blue--text";
      if (amount > 0) return "orange--text";
      return "grey--text";
    },

    // Get color for subject chip
    getSubjectColor(subject) {
      if (this.subjectColors[subject]) {
        return this.subjectColors[subject];
      }

      // Generate a consistent color for subjects not in the list
      if (subject !== this.lastSubject) {
        const colors = [
          "blue",
          "indigo",
          "deep-purple",
          "teal",
          "green",
          "orange",
          "red",
        ];
        const hash = subject.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        this.lastSubject = subject;
        return colors[hash % colors.length];
      }

      return "blue";
    },

    // Fetch students data from Firebase
    async loadStudents() {
      this.loading = true;
      try {
        const querySnapshot = await getDocs(collection(db, "students"));
        this.students = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Add animation delay for UI feedback
        setTimeout(() => {
          this.loading = false;
        }, 500);
      } catch (error) {
        console.error("Error loading students:", error);
        this.showNotification("O'quvchilar ma'lumotlarini yuklashda xatolik", "error");
        this.loading = false;
      }
    },

    // Fetch subjects data from Firebase
    async loadSubjects() {
      try {
        const querySnapshot = await getDocs(collection(db, "subjects"));
        this.subjects = querySnapshot.docs.map((doc) => doc.data().name);
      } catch (error) {
        console.error("Error loading subjects:", error);
        this.showNotification("Fanlarni yuklashda xatolik", "error");
      }
    },

    // Fetch teachers data from Firebase
    async loadTeachers() {
      try {
        const querySnapshot = await getDocs(collection(db, "teachers"));
        this.teachers = querySnapshot.docs.map((doc) => doc.data().name);
      } catch (error) {
        console.error("Error loading teachers:", error);
        this.showNotification("O'qituvchilarni yuklashda xatolik", "error");
      }
    },

    // Open Add Student Modal
    openAddModal() {
      this.newStudent = {
        name: "",
        surname: "",
        phone: "",
        subject: "",
        teacher: this.isAdmin ? "" : this.currentUser,
        payment: "",
        date: new Date().toISOString().substr(0, 10),
      };
      this.addModal = true;
    },

    // Add new student to Firebase
    async addStudent(student) {
      try {
        this.loading = true;
        // Create payments array with 12 false values
        const payments = Array(12).fill(false);

        // Add new student to Firestore
        const docRef = await addDoc(collection(db, "students"), {
          ...student,
          subject: student.subject,
          teacher: { name: student.teacher },
          payments: payments,
        });

        // Add new student to local array with animation effect
        this.students = [
          ...this.students,
          {
            ...student,
            id: docRef.id,
            teacher: { name: student.teacher },
            payments: payments,
          },
        ];

        // Show success notification
        this.showNotification("O'quvchi muvaffaqiyatli qo'shildi", "success");

        // Close the modal
        this.addModal = false;
        this.loading = false;
      } catch (error) {
        console.error("Error adding student:", error);
        this.showNotification("O'quvchi qo'shishda xatolik yuz berdi", "error");
        this.loading = false;
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
        this.loading = true;
        await deleteDoc(doc(db, "students", this.studentToDelete.id));

        // Remove student from local array with animation effect
        const index = this.students.findIndex((s) => s.id === this.studentToDelete.id);
        if (index > -1) {
          this.students.splice(index, 1);
        }

        // Show success notification
        this.showNotification("O'quvchi muvaffaqiyatli o'chirildi", "info");

        // Close dialog
        this.deleteDialog = false;
        this.studentToDelete = null;
        this.loading = false;
      } catch (error) {
        console.error("Error deleting student:", error);
        this.showNotification("O'quvchi o'chirishda xatolik yuz berdi", "error");
        this.loading = false;
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
    async updateStudent(student) {
      try {
        this.loading = true;
        const studentRef = doc(db, "students", student.id);

        // Prepare update object
        const updateData = {
          name: student.name,
          surname: student.surname,
          phone: student.phone,
          subject: student.subject,
          teacher: { name: student.teacher },
          payment: student.payment,
          date: student.date,
        };

        // Update in Firebase
        await updateDoc(studentRef, updateData);

        // Update student in local array
        const index = this.students.findIndex((s) => s.id === student.id);
        if (index !== -1) {
          this.students[index] = {
            ...student,
            teacher: { name: student.teacher },
          };
        }

        // Show success notification
        this.showNotification(
          "O'quvchi ma'lumotlari muvaffaqiyatli yangilandi",
          "success"
        );

        // Close modal
        this.editModal = false;
        this.loading = false;
      } catch (error) {
        console.error("Error updating student:", error);
        this.showNotification("O'quvchi ma'lumotlarini yangilashda xatolik", "error");
        this.loading = false;
      }
    },

    // Export student data to Excel
    exportToExcel() {
      try {
        // Show loading indicator
        this.loading = true;

        // Prepare data for export - remove complex objects and ID
        const exportData = this.filteredStudents.map((student, index) => ({
          "№": index + 1,
          Ism: student.name,
          Familya: student.surname,
          Fan: student.subject,
          "O'qituvchi": student.teacher ? student.teacher.name : "",
          Sana: this.formatDate(student.date),
          Telefon: this.formatPhone(student.phone),
          "To'lov": this.formatCurrency(student.payment),
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "O'quvchilar");

        // Set column widths
        const wscols = [
          { wch: 5 }, // №
          { wch: 15 }, // Ism
          { wch: 15 }, // Familya
          { wch: 15 }, // Fan
          { wch: 15 }, // O'qituvchi
          { wch: 12 }, // Sana
          { wch: 15 }, // Telefon
          { wch: 15 }, // To'lov
        ];
        ws["!cols"] = wscols;

        // Add title and export date
        XLSX.utils.sheet_add_aoa(
          ws,
          [
            ["O'QUVCHILAR RO'YXATI"],
            [`Sana: ${new Date().toLocaleDateString("uz-UZ")}`],
            [""],
          ],
          { origin: "A1" }
        );

        // Write file and download
        XLSX.writeFile(wb, "o'quvchilar_ro'yxati.xlsx");

        this.showNotification("Excel fayli muvaffaqiyatli yuklandi", "success");
        this.loading = false;
      } catch (error) {
        console.error("Error exporting to Excel:", error);
        this.showNotification("Excel faylini yuklashda xatolik", "error");
        this.loading = false;
      }
    },

    // Notification using Toastify or fallback
    showNotification(message, type = "success") {
      if (typeof Toastify === "function") {
        const bgColors = {
          success: "linear-gradient(to right, #4CAF50, #2196F3)",
          error: "linear-gradient(to right, #f44336, #e91e63)",
          info: "linear-gradient(to right, #2196F3, #03A9F4)",
        };

        Toastify({
          text: message,
          duration: 3000,
          backgroundColor: bgColors[type],
          className: type,
          position: "right",
          gravity: "top",
          close: true,
        }).showToast();
      } else {
        // Fallback to console if Toastify is not available
        alert(`${message}`);
        console.log(`${type.toUpperCase()}: ${message}`);
      }
    },
  },
};
</script>

<style>
.header-banner {
  /* <!-- background: linear-gradient(135deg, #1976d2 0%, #0d47a1 100%); --> */

  background: linear-gradient(135deg, #e3f2fd, #ffffff);
  position: relative;
  overflow: hidden;
  border-radius: 0 0 16px 16px !important;
}
.dark-mode .header-banner {
  background: linear-gradient(135deg, #1e1e2f, #121212) !important;
}
.header-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0);
  background-size: 24px 24px;
}

.student-dashboard .v-data-table th {
  font-weight: bold !important;
  text-transform: uppercase;
  font-size: 0.8rem;
  color: #1976d2;
  letter-spacing: 0.5px;
}

.student-dashboard .v-data-table tbody tr {
  transition: all 0.3s ease;
}

.student-dashboard .v-data-table tbody tr:hover {
  background-color: #f0f7ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}
.dark-mode .student-dashboard .v-data-table tbody tr:hover {
  background-color: #12121241;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
}

.search-card {
  position: relative;
  z-index: 2;
  margin-top: -30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1) !important;
}

.table-card {
  border-radius: 12px !important;
  overflow: hidden;
}

.data-header {
  /* background-color: #f5f7fa; */
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-actions {
  display: flex;
  align-items: center;
}

.action-btn {
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
}

.empty-state {
  padding: 40px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Animation for new/updated items */
.v-data-table__wrapper tbody tr {
  transition: background-color 0.5s;
}

@keyframes highlight {
  0% {
    background-color: #e3f2fd;
  }
  100% {
    background-color: transparent;
  }
}

.highlight-row {
  animation: highlight 2s ease;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .header-banner {
    height: auto !important;
    padding: 1.5rem !important;
  }

  .text-h3 {
    font-size: 1.5rem !important;
  }

  .search-card {
    margin-top: -15px;
  }

  .data-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .table-actions {
    margin-top: 12px;
    align-self: flex-end;
  }
}
</style>
