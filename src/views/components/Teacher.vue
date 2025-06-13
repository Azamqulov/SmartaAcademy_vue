<template>
  <v-container>
    <v-card class="teacher-management-card" elevation="3">
      <!-- Header Section -->
      <v-card-title class="header-section px-4 py-3">
        <div class="d-flex flex-wrap justify-space-between align-center w-100">
          <div class="header-title">
            <v-icon color="primary" class="mr-2">mdi-account-group</v-icon>
            <span class="text-h5">O'qituvchilar Boshqaruvi</span>
          </div>
          <v-btn
            color="success"
            class="add-teacher-btn"
            elevation="2"
            @click="openAddTeacherModal"
          >
            <v-icon left>mdi-account-plus</v-icon>
            O'qituvchi Qo'shish
          </v-btn>
        </div>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Search & Filter Section -->
      <v-card-text class="filter-section pa-4">
        <v-row>
          <v-col cols="12" sm="6" md="4">
            <v-text-field
              v-model="searchQuery"
              label="Qidirish"
              prepend-inner-icon="mdi-magnify"
              outlined
              dense
              hide-details
              clearable
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="6" md="4">
            <v-select
              v-model="subjectFilter"
              :items="['Barchasi', ...subjects]"
              label="Fan bo'yicha filter"
              outlined
              dense
              hide-details
              clearable
            ></v-select>
          </v-col>
        </v-row>
      </v-card-text>

      <!-- Teachers Data Table -->
      <v-data-table
        :headers="headers"
        :items="filteredTeachers"
        :search="searchQuery"
        :loading="loading"
        item-value="id"
        class="elevation-1"
        :footer-props="{
          'items-per-page-options': [5, 10, 15],
          'items-per-page-text': 'Sahifada:',
        }"
      >
        <template v-slot:item.index="{ index }">
          <div class="font-weight-medium">{{ index + 1 }}</div>
        </template>

        <template v-slot:item.name="{ item }">
          <div class="d-flex align-center">
            <v-avatar size="32" color="primary" class="mr-2">
              <span class="white--text">{{ getInitials(item.name) }}</span>
            </v-avatar>
            <span class="font-weight-medium">{{ item.name }}</span>
          </div>
        </template>

        <template v-slot:item.subject="{ item }">
          <v-chip small color="primary" text-color="white">
            {{ item.subject }}
          </v-chip>
        </template>

        <template v-slot:item.role="{ item }">
          <v-chip small color="secondary" text-color="white">
            {{ item.role }}
          </v-chip>
        </template>

        <template v-slot:item.actions="{ item }">
          <div class="actions-cell">
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  small
                  icon
                  color="info"
                  class="mr-1"
                  v-bind="attrs"
                  v-on="on"
                  @click="editTeacher(item)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </template>
              <span>Tahrirlash</span>
            </v-tooltip>

            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  small
                  icon
                  color="error"
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

        <template v-slot:no-data>
          <v-alert
            type="info"
            class="ma-4"
            outlined
          >
            Hozircha o'qituvchilar mavjud emas.
          </v-alert>
        </template>
      </v-data-table>
    </v-card>

    <!-- Teacher Add/Edit Modal -->
    <v-dialog v-model="showModal" max-width="600" persistent>
      <v-card>
        <v-card-title class="modal-header primary white--text">
          <v-icon left color="white">{{ isEdit ? 'mdi-account-edit' : 'mdi-account-plus' }}</v-icon>
          {{ isEdit ? "O'qituvchini tahrirlash" : "Yangi o'qituvchi qo'shish" }}
        </v-card-title>

        <v-card-text class="pt-4">
          <v-form ref="form" v-model="formValid" lazy-validation>
            <v-container>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="form.name"
                    label="O'qituvchi ismi"
                    prepend-icon="mdi-account"
                    :rules="nameRules"
                    required
                    outlined
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.username"
                    label="Foydalanuvchi nomi"
                    prepend-icon="mdi-account-key"
                    :rules="usernameRules"
                    :disabled="isEdit"
                    required
                    outlined
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.password"
                    label="Parol"
                    prepend-icon="mdi-lock"
                    :append-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    :type="showPassword ? 'text' : 'password'"
                    @click:append="showPassword = !showPassword"
                    :rules="passwordRules"
                    required
                    outlined
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12">
                  <v-autocomplete
                    v-model="form.subject"
                    :items="subjects"
                    label="Fan"
                    prepend-icon="mdi-book-open-variant"
                    :rules="subjectRules"
                    required
                    outlined
                    clearable
                  ></v-autocomplete>
                </v-col>
              </v-row>
            </v-container>
          </v-form>
        </v-card-text>

        <v-divider></v-divider>

        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn 
            text 
            color="grey darken-1" 
            @click="closeModal" 
            :disabled="saving"
          >
            <v-icon left>mdi-close</v-icon>
            Bekor qilish
          </v-btn>
          <v-btn 
            color="primary" 
            @click="saveTeacher" 
            :loading="saving" 
            :disabled="!formValid"
          >
            <v-icon left>mdi-content-save</v-icon>
            {{ isEdit ? "Yangilash" : "Saqlash" }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="error white--text">
          <v-icon left color="white">mdi-alert</v-icon>
          O'chirish tasdiqlash
        </v-card-title>
        
        <v-card-text class="pa-4 mt-3">
          <p class="text-body-1">
            Siz rostdan ham <strong>{{ teacherToDelete?.name }}</strong> o'qituvchisini o'chirmoqchimisiz?
          </p>
          <p class="text-caption mt-2">
            Bu amal qaytarilmas!
          </p>
        </v-card-text>
        
        <v-card-actions class="pa-4">
          <v-spacer></v-spacer>
          <v-btn text color="grey darken-1" @click="deleteDialog = false">
            <v-icon left>mdi-close</v-icon>
            Bekor qilish
          </v-btn>
          <v-btn 
            color="error" 
            @click="deleteTeacher(teacherToDelete?.id)" 
            :loading="deleting"
          >
            <v-icon left>mdi-delete</v-icon>
            O'chirish
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "@/firebaseConfig";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

export default {
  name: "TeacherManagement",
  
  data() {
    return {
      teachers: [],
      loading: false,
      saving: false,
      deleting: false,
      searchQuery: "",
      subjectFilter: "Barchasi",
      showPassword: false,
      headers: [
        { text: "#", value: "index", sortable: false, width: "5%" },
        { text: "O'qituvchi ismi", value: "name", width: "25%" },
        { text: "Foydalanuvchi nomi", value: "username", width: "20%" },
        { text: "Fan", value: "subject", width: "20%" },
        { text: "Rol", value: "role", width: "15%" },
        { text: "Amallar", value: "actions", sortable: false, align: "center", width: "15%" },
      ],
      subjects: [
        "Matematika",
        "English",
        "Tarix",
        "Kimyo",
        "Huquq",
        "Ona tili",
        "Fizika",
        "Biologiya",
        "Geografiya",
        "Informatika",
        "San'at",
        "Musiqa",
        "Jismoniy tarbiya",
        "Texnologiya",
        "Psixologiya",
        "Iqtisodiyot",
        "Nemis tili",
        "Fransuz tili",
        "Rus tili",
        "Koreys tili",
        "Arab tili",
        "Turk tili",
      ],
      showModal: false,
      form: {
        username: "",
        password: "",
        name: "",
        subject: "",
      },
      isEdit: false,
      editId: null,
      formValid: false,
      deleteDialog: false,
      teacherToDelete: null,
      
      // Validation rules
      nameRules: [
        v => !!v || "Ism kiritish majburiy",
        v => v.length >= 3 || "Ism kamida 3 ta belgidan iborat bo'lishi kerak",
      ],
      usernameRules: [
        v => !!v || "Foydalanuvchi nomi kiritish majburiy",
        v => v.length >= 4 || "Foydalanuvchi nomi kamida 4 ta belgidan iborat bo'lishi kerak",
      ],
      passwordRules: [
        v => !!v || "Parol kiritish majburiy",
        v => v.length >= 6 || "Parol kamida 6 ta belgidan iborat bo'lishi kerak",
      ],
      subjectRules: [
        v => !!v || "Fan tanlanishi majburiy",
      ],
    };
  },
  
  computed: {
    filteredTeachers() {
      if (this.subjectFilter === "Barchasi" || !this.subjectFilter) {
        return this.teachers;
      }
      return this.teachers.filter(teacher => teacher.subject === this.subjectFilter);
    },
  },
  
  methods: {
    // Get user initials for avatar
    getInitials(name) {
      if (!name) return "O";
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    },
    
    // Fetch teachers from database
    async fetchTeachers() {
      this.loading = true;
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        this.teachers = querySnapshot.docs
          .filter((doc) => doc.data().role === "teacher")
          .map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        console.error("Error fetching teachers:", error);
        this.showToast("O'qituvchilarni yuklashda xatolik yuz berdi", "error");
      } finally {
        this.loading = false;
      }
    },
    
    // Open modal to add new teacher
    openAddTeacherModal() {
      this.isEdit = false;
      this.form = { 
        username: "", 
        password: "", 
        name: "", 
        subject: "" 
      };
      this.$refs.form?.reset();
      this.showModal = true;
    },
    
    // Save or update teacher
    async saveTeacher() {
      if (!this.$refs.form.validate()) return;
      
      this.saving = true;
      try {
        const teacherId = this.isEdit ? this.editId : this.form.username;
        
        // Save to subjects collection
        await setDoc(doc(db, "subjects", teacherId), {
          teacherName: this.form.name,
          name: this.form.subject,
        });
        
        // Save to teachers collection
        await setDoc(doc(db, "teachers", teacherId), {
          name: this.form.name,
          subject: this.form.subject,
        });
        
        // Save to users collection
        await setDoc(doc(db, "users", teacherId), {
          username: this.form.username,
          password: this.form.password,
          name: this.form.name,
          subject: this.form.subject,
          role: "teacher",
        });
        
        this.showToast(
          this.isEdit 
            ? "O'qituvchi muvaffaqiyatli tahrirlandi" 
            : "O'qituvchi muvaffaqiyatli qo'shildi", 
          "success"
        );
        
        this.closeModal();
        this.fetchTeachers();
      } catch (error) {
        console.error("Error saving teacher:", error);
        this.showToast("Saqlashda xatolik yuz berdi", "error");
      } finally {
        this.saving = false;
      }
    },
    
    // Edit existing teacher
    editTeacher(teacher) {
      this.isEdit = true;
      this.editId = teacher.id;
      this.form = {
        username: teacher.username,
        password: teacher.password || "",
        name: teacher.name,
        subject: teacher.subject,
      };
      this.$refs.form?.resetValidation();
      this.showModal = true;
    },
    
    // Show delete confirmation dialog
    confirmDelete(teacher) {
      this.teacherToDelete = teacher;
      this.deleteDialog = true;
    },
    
    // Delete teacher
    async deleteTeacher(id) {
      this.deleting = true;
      try {
        await deleteDoc(doc(db, "users", id));
        await deleteDoc(doc(db, "teachers", id)).catch(() => {});
        await deleteDoc(doc(db, "subjects", id)).catch(() => {});
        
        this.showToast("O'qituvchi muvaffaqiyatli o'chirildi", "success");
        this.deleteDialog = false;
        this.fetchTeachers();
      } catch (error) {
        console.error("Error deleting teacher:", error);
        this.showToast("O'chirishda xatolik yuz berdi", "error");
      } finally {
        this.deleting = false;
      }
    },
    
    // Close modal
    closeModal() {
      this.showModal = false;
    },
    
    // Show notification toast
    showToast(message, type) {
      Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor:
          type === "success" ? "#4CAF50" : 
          type === "error" ? "#F44336" : 
          type === "info" ? "#2196F3" : "#607D8B",
        className: "custom-toast",
        stopOnFocus: true,
      }).showToast();
    },
  },
  
  mounted() {
    this.fetchTeachers();
  },
};
</script>

<style>
.teacher-management-card {
  border-radius: 8px;
  overflow: hidden;
}

.header-section {
  background-color: #f5f5f5;
}

.header-title {
  display: flex;
  align-items: center;
}

.add-teacher-btn {
  transition: all 0.3s ease;
}

.add-teacher-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
}

.filter-section {
  background-color: #fafafa;
}

.actions-cell {
  display: flex;
  justify-content: center;
}

.modal-header {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.custom-toast {
  border-radius: 8px !important;
  font-family: "Fira Code", monospace !important;
}

/* Responsive styles */
@media (max-width: 600px) {
  .header-section {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .add-teacher-btn {
    margin-top: 16px;
    width: 100%;
  }
  
  .actions-cell {
    flex-direction: row;
    justify-content: center;
  }
}
</style>