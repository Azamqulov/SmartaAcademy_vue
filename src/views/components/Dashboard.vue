<template>
  <v-container fluid>
    <!-- Dashboard Header -->
    <v-row class="mt-6">
      <v-col cols="12">
        <div class="dashboard-header">
          <h2 class="dashboard-title">Dashboard</h2>
          <p class="dashboard-subtitle">O'quvchilar soni va to'lovlarni kuzating</p>
        </div>
      </v-col>
    </v-row>

    <v-row>
      <!-- Profile Card -->
      <v-col cols="12" md="6" lg="6">
        <v-card class="profile-card pa-4" outlined elevation="2">
          <v-card-title class="profile-header">
            <v-avatar size="100" class="avatar-main mb-3">
              <template v-if="teacher.photoURL">
                <img class="profile-image" :src="teacher.photoURL" alt="Profil rasmi" />
              </template>
              <template v-else>
                <v-avatar color="blue" class="white--text profile-initial">
                  {{ profileInitial }}
                </v-avatar>
              </template>
            </v-avatar>
            <div class="profile-info">
              <h3 class="profile-name">Ism: {{ teacher.name }}</h3>
              <p class="profile-username"><strong>Username:</strong> {{ teacher.username }}</p>
              <h4 class="profile-subject grey--text">Fan: {{ teacher.subject }}</h4>
            </div>
          </v-card-title>
          <v-card-actions class="action-buttons">
            <v-btn color="blue" @click="openEditModal" class="action-button">
              <v-icon left>mdi-pencil</v-icon> Tahrirlash
            </v-btn>
            <v-btn color="red" @click="openLoginEditModal" class="action-button">
              <v-icon left>mdi-lock</v-icon> Parolni Tahrirlash
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Revenue Statistics Card -->
      <v-col cols="12" md="3" sm="6">
        <v-card class="stats-card revenue-card" elevation="2" @mouseover="animateCard('revenue')"
          @mouseleave="resetAnimation('revenue')">
          <div class="stats-icon-container blue lighten-4">
            <v-icon color="blue" size="24">mdi-currency-usd</v-icon>
          </div>
          <div class="stats-content">
            <div class="stats-title">Jami To'lovlar</div>
            <div class="stats-value" ref="revenueValue">
              <span class="currency">$</span> {{ formatNumber(teacher.totalPayments || 0) }}
            </div>
            <div class="stats-chart">
              <svg class="chart" viewBox="0 0 100 30">
                <path :d="revenuePath" class="chart-path revenue-path"></path>
              </svg>
            </div>
          </div>
        </v-card>
      </v-col>

      <!-- Students Statistics Card -->
      <v-col cols="12" md="3" sm="6">
        <v-card class="stats-card clients-card" elevation="2" @mouseover="animateCard('clients')"
          @mouseleave="resetAnimation('clients')">
          <div class="stats-icon-container indigo lighten-4">
            <v-icon color="indigo" size="24">mdi-account-group-outline</v-icon>
          </div>
          <div class="stats-content">
            <div class="stats-title">O'quvchilar Soni</div>
            <div class="stats-value" ref="clientsValue">{{ formatNumber(teacher.totalStudents || 0) }}</div>
            <div class="stats-chart">
              <svg class="chart" viewBox="0 0 100 30">
                <path :d="clientsPath" class="chart-path clients-path"></path>
              </svg>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Edit Profile Modal -->
    <v-dialog v-model="editModal" max-width="500">
      <v-card>
        <v-card-title class="headline">
          <v-icon left color="blue">mdi-account-edit</v-icon>
          Tahrirlash
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="editForm.name" label="Ismi" prepend-icon="mdi-account" outlined></v-text-field>

          <v-autocomplete v-model="editForm.subject" :items="subjects" label="Fan" prepend-icon="mdi-book-open-variant"
            outlined></v-autocomplete>
        </v-card-text>
        <v-card-actions class="modal-actions">
          <v-spacer></v-spacer>
          <v-btn text @click="closeEditModal">
            <v-icon left>mdi-close</v-icon>
            Bekor qilish
          </v-btn>
          <v-btn color="primary" @click="saveTeacher">
            <v-icon left>mdi-content-save</v-icon>
            Saqlash
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Password Edit Modal -->
    <v-dialog v-model="loginEditModal" max-width="500">
      <v-card>
        <v-card-title class="headline">
          <v-icon left color="red">mdi-lock-reset</v-icon>
          Login va Parolni Tahrirlash
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="editForm.username" label="Login" prepend-icon="mdi-account" outlined
            disabled></v-text-field>

          <v-text-field v-model="editForm.password" label="Parol" prepend-icon="mdi-lock"
            :type="passwordVisible ? 'text' : 'password'" outlined
            :append-icon="passwordVisible ? 'mdi-eye-off' : 'mdi-eye'"
            @click:append="togglePasswordVisibility"></v-text-field>
        </v-card-text>
        <v-card-actions class="modal-actions">
          <v-spacer></v-spacer>
          <v-btn text @click="closeLoginEditModal">
            <v-icon left>mdi-close</v-icon>
            Bekor qilish
          </v-btn>
          <v-btn color="primary" @click="saveLoginDetails">
            <v-icon left>mdi-content-save</v-icon>
            Saqlash
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- O'quv Faoliyati Tahlili -->
    <v-row class="mt-6">
      <v-col cols="12">
        <v-card outlined class="analytics-card">
          <v-card-title class="analytics-header">
            <v-icon left color="blue" size="28">mdi-chart-line-variant</v-icon>
            O'quv Faoliyati Tahlili
            <v-spacer></v-spacer>

          </v-card-title>

          <v-card-text>
            <!-- Dars jadvali va kelasi hafta rejasi -->
            <v-row class="mt-4">
              <!-- Bugungi Dars Jadvali -->
              <v-col cols="12" md="6">
                <div class="schedule-container">
                  <div class="d-flex justify-space-between align-center mb-3">
                    <h3 class="chart-title mb-0">
                      <v-icon color="blue" small class="mr-1">mdi-calendar-clock</v-icon>
                       Dars Jadvali
                    </h3>
                    <v-btn color="success" small @click="openNewLessonModal">
                      <v-icon left small>mdi-plus</v-icon> Qo'shish
                    </v-btn>
                  </div>

                  <v-progress-linear v-if="loadingLessons" indeterminate color="blue"></v-progress-linear>

                  <div class="schedule-timeline" v-else>
                    <div v-for="(lesson, index) in todayLessons" :key="index" class="timeline-item">
                      <div class="timeline-time">{{ lesson.time }}</div>
                      <div class="timeline-content">
                        <div class="timeline-title">{{ lesson.title }}</div>
                        <div class="timeline-group">{{ lesson.group }}</div>
                     
                      </div>
                      <div class="timeline-actions">
                        <v-btn icon x-small @click="editLesson(index)">
                          <v-icon small color="gray">mdi-pencil</v-icon>
                        </v-btn>
                        <v-btn icon x-small @click="confirmDeleteLesson(index)">
                          <v-icon small color="red">mdi-delete</v-icon>
                        </v-btn>
                      </div>
                    </div>
                    <div v-if="todayLessons.length === 0" class="empty-state">
                      <p class="text-center grey--text">Bugun uchun darslar yo'q</p>
                    </div>
                  </div>
                </div>
              </v-col>

              <!-- Kelasi hafta rejasi -->
              <v-col cols="12" md="6">
                <div class="week-plan-container">
                  <div class="d-flex justify-space-between align-center mb-3">
                    <h3 class="chart-title mb-0">
                      <v-icon color="blue" small class="mr-1">mdi-calendar-check</v-icon>
                      Kelasi Hafta Rejasi
                    </h3>
                    <v-btn color="success" small @click="openNewPlanModal">
                      <v-icon left small>mdi-plus</v-icon> Qo'shish
                    </v-btn>
                  </div>

                  <v-progress-linear v-if="loadingPlans" indeterminate color="blue"></v-progress-linear>

                  <div class="week-plan-content" v-else>
                    <v-div dense>
                      <v-list-item v-for="(plan, index) in weekPlan" :key="index" class="week-plan-item">
                        <v-list-item-icon>
                          <v-icon color="blue">{{ plan.icon }}</v-icon>
                        </v-list-item-icon>
                        <v-row justify="space-between" align="center" class="plan-content" >
                       
                        <v-list-item-content >
                          <v-list-item-title>{{ plan.title }}</v-list-item-title>
                          <v-list-item-subtitle>{{ plan.date }} • {{ plan.time }}</v-list-item-subtitle>
                        </v-list-item-content>
                        <v-list-item-action>
                          <v-btn icon small @click="editPlan(index)">
                            <v-icon color="grey lighten-1" small>mdi-pencil</v-icon>
                          </v-btn>
                          <v-btn icon small @click="confirmDeletePlan(index)">
                            <v-icon color="red lighten-1" small>mdi-delete</v-icon>
                          </v-btn>
                        </v-list-item-action>
                      </v-row>
                      </v-list-item>
                      <div v-if="weekPlan.length === 0" class="empty-state">
                        <p class="text-center grey--text ">Kelasi hafta uchun rejalar yo'q</p>
                      </div>
                    </v-div>
                  </div>
                </div>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Add/Edit Lesson Modal -->
    <v-dialog v-model="lessonModal" max-width="500">
      <v-card>
        <v-card-title class="headline">
          <v-icon left color="blue">mdi-calendar-edit</v-icon>
          {{ isEditingLesson ? "Darsni Tahrirlash" : "Yangi Dars Qo'shish" }}
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="lessonForm.title" label="Dars Nomi" prepend-icon="mdi-book-open-variant" outlined
            required></v-text-field>

          <v-text-field v-model="lessonForm.group" label="Sinf/Guruh" prepend-icon="mdi-account-group" outlined
            required></v-text-field>

          <v-text-field v-model="lessonForm.time" label="Vaqt (09:00 - 10:30)" prepend-icon="mdi-clock-outline" outlined
            required></v-text-field>

        </v-card-text>
        <v-card-actions class="modal-actions">
          <v-spacer></v-spacer>
          <v-btn text @click="closeLessonModal">
            <v-icon left>mdi-close</v-icon>
            Bekor qilish
          </v-btn>
          <v-btn color="primary" @click="saveLesson">
            <v-icon left>mdi-content-save</v-icon>
            Saqlash
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Add/Edit Plan Modal -->
    <v-dialog v-model="planModal" max-width="500">
      <v-card>
        <v-card-title class="headline">
          <v-icon left color="blue-grey">mdi-calendar-check</v-icon>
          {{ isEditingPlan ? "Rejani Tahrirlash" : "Yangi Reja Qo'shish" }}
        </v-card-title>
        <v-card-text>
          <v-text-field v-model="planForm.title" label="Reja Nomi" prepend-icon="mdi-text-short" outlined
            required></v-text-field>

          <v-menu ref="dateMenu" v-model="dateMenu" :close-on-content-click="false" transition="scale-transition"
            offset-y min-width="auto">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="planForm.date" label="Sana" prepend-icon="mdi-calendar"></v-text-field>
            </template>
            <v-date-picker v-model="dateSelected" @input="setFormattedDate" locale="uz" :min="today"></v-date-picker>
          </v-menu>

          <v-text-field v-model="planForm.time" label="Vaqt " prepend-icon="mdi-clock-outline" outlined
            required></v-text-field>
        </v-card-text>
        <v-card-actions class="modal-actions">
          <v-spacer></v-spacer>
          <v-btn text @click="closePlanModal">
            <v-icon left>mdi-close</v-icon>
            Bekor qilish
          </v-btn>
          <v-btn color="primary" @click="savePlan">
            <v-icon left>mdi-content-save</v-icon>
            Saqlash
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="deleteDialog" max-width="400">
      <v-card>
        <v-card-title class="headline error--text">
          <v-icon left color="error">mdi-alert-circle</v-icon>
          O'chirish
        </v-card-title>
        <v-card-text>
          {{ deleteMessage }}
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="deleteDialog = false">
            Bekor qilish
          </v-btn>
          <v-btn color="error" @click="confirmDelete">
            O'chirish
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
import { db } from "@/firebaseConfig";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  query,
  where,
  setDoc,
  addDoc,
  deleteDoc
} from "firebase/firestore";
import Toastify from "toastify-js";

export default {
  name: "TeacherDashboard",

  data() {
    return {
      teacher: {},
      editModal: false,
      loginEditModal: false,
      passwordVisible: false,
      editForm: {
        name: "",
        subject: "",
        username: "",
        password: "",
      },
      subjects: [],
      currentUser: localStorage.getItem("teacherName"),

      // Chart paths
      revenuePath: "M0,25 L10,20 L20,28 L30,15 L40,20 L50,10 L60,18 L70,5 L80,15 L90,8 L100,15",
      clientsPath: "M0,15 L10,5 L20,15 L30,10 L40,20 L50,15 L60,25 L70,15 L80,5 L90,15 L100,20",

      // Animation timeouts
      animationTimeouts: {},

      // Loading state
      loading: true,
      loadingLessons: true,
      loadingPlans: true,

      // Bugungi dars jadvali
      todayLessons: [],

      // Kelasi hafta rejasi
      weekPlan: [],

      // Lesson modal
      lessonModal: false,
      isEditingLesson: false,
      editingLessonIndex: -1,
      lessonForm: {
        title: "",
        group: "",
        time: "",
        status: "Kutilmoqda"
      },
      lessonStatuses: ["Kutilmoqda", "Hozirda", "Tugallandi"],

      // Plan modal
      planModal: false,
      isEditingPlan: false,
      editingPlanIndex: -1,
      dateMenu: false,
      dateSelected: new Date().toISOString().substr(0, 10),
      planForm: {
        title: "",
        date: "",
        time: "",
        icon: "mdi-notebook-check",
        color: "red"
      },

      // Icons and colors for plan
      iconOptions: [
        { name: "Nazorat ishi", value: "mdi-notebook-check", color: "red" },
        { name: "Taqdimot", value: "mdi-presentation", color: "indigo" },
        { name: "Uchrashuv", value: "mdi-account-group", color: "green" },
        { name: "Seminar", value: "mdi-school", color: "deep-purple" },
        { name: "Mashg'ulot", value: "mdi-book-open-page-variant", color: "blue" },
        { name: "Majlis", value: "mdi-clipboard-text", color: "brown" }
      ],

      colorOptions: [
        { name: "Qizil", value: "red" },
        { name: "Ko'k", value: "blue" },
        { name: "Yashil", value: "green" },
        { name: "Sariq", value: "amber" },
        { name: "Binafsha", value: "deep-purple" },
        { name: "Zangori", value: "cyan" },
        { name: "Jigarrang", value: "brown" },
        { name: "To'q ko'k", value: "indigo" }
      ],

      // Delete dialog
      deleteDialog: false,
      deleteMessage: "",
      deleteType: "", // 'lesson' or 'plan'
      deleteIndex: -1,

      // Today's date
      today: new Date().toISOString().substr(0, 10)
    };
  },

  computed: {
    profileInitial() {
      return this.teacher.name ? this.teacher.name.charAt(0).toUpperCase() : '';
    },
  },

  methods: {
    // O'qituvchi ma'lumotlarini olish
    async fetchTeacher() {
      try {
        const teacherName = localStorage.getItem("teacherName");
        if (!teacherName) {
          this.showToast("O'qituvchi nomi topilmadi", "error");
          return;
        }

        this.editForm.name = teacherName;
        const teacherRef = doc(db, "users", teacherName);
        const docSnap = await getDoc(teacherRef);

        if (docSnap.exists()) {
          this.teacher = docSnap.data();
          this.editForm.subject = this.teacher.subject;
          this.editForm.username = this.teacher.username;
          this.editForm.password = this.teacher.password;
        } else {
          this.showToast("O'qituvchi ma'lumotlari topilmadi", "error");
        }

        // Fanlarni yuklash
        await this.fetchSubjects();

        // Dars jadvalini va rejalarni yuklash
        await this.fetchLessons();
        await this.fetchPlans();
      } catch (error) {
        this.showToast("Ma'lumotlarni yuklashda xatolik yuz berdi", "error");
        console.error("Error fetching teacher data:", error);
      } finally {
        this.loading = false;
      }
    },

    // Dars jadvalini yuklash
    async fetchLessons() {
      this.loadingLessons = true;
      try {
        const teacherName = localStorage.getItem("teacherName");
        if (!teacherName) return;

        const lessonsRef = collection(db, "lessons");
        const q = query(lessonsRef, where("teacherName", "==", teacherName));
        const querySnapshot = await getDocs(q);

        this.todayLessons = [];
        querySnapshot.forEach((doc) => {
          const lessonData = doc.data();
          lessonData.id = doc.id;
          this.todayLessons.push(lessonData);
        });

        // Sort lessons by time
        this.todayLessons.sort((a, b) => {
          const timeA = a.time.split(' - ')[0];
          const timeB = b.time.split(' - ')[0];
          return timeA.localeCompare(timeB);
        });
      } catch (error) {
        console.error("Error fetching lessons:", error);
        this.showToast("Dars jadvalini yuklashda xatolik", "error");
      } finally {
        this.loadingLessons = false;
      }
    },

    // Hafta rejalarini yuklash
    async fetchPlans() {
      this.loadingPlans = true;
      try {
        const teacherName = localStorage.getItem("teacherName");
        if (!teacherName) return;

        const plansRef = collection(db, "plans");
        const q = query(plansRef, where("teacherName", "==", teacherName));
        const querySnapshot = await getDocs(q);

        this.weekPlan = [];
        querySnapshot.forEach((doc) => {
          const planData = doc.data();
          planData.id = doc.id;
          this.weekPlan.push(planData);
        });

        // Sort plans by date and time
        this.weekPlan.sort((a, b) => {
          if (a.dateRaw === b.dateRaw) {
            return a.time.localeCompare(b.time);
          }
          return a.dateRaw.localeCompare(b.dateRaw);
        });
      } catch (error) {
        console.error("Error fetching plans:", error);
        this.showToast("Hafta rejasini yuklashda xatolik", "error");
      } finally {
        this.loadingPlans = false;
      }
    },

    // Fanlarni olish
    async fetchSubjects() {
      try {
        const querySnapshot = await getDocs(collection(db, "subjects"));
        this.subjects = querySnapshot.docs.map(doc => doc.data().name);
      } catch (error) {
        console.error("Fanlarni yuklashda xatolik:", error);
      }
    },

    // Profile update methods
    openEditModal() {
      this.editModal = true;
    },

    closeEditModal() {
      this.editModal = false;
    },

    async saveTeacher() {
      try {
        const teacherRef = doc(db, "users", this.editForm.name);
        await updateDoc(teacherRef, {
          name: this.editForm.name,
          subject: this.editForm.subject,
        });

        this.teacher.name = this.editForm.name;
        this.teacher.subject = this.editForm.subject;
        this.closeEditModal();

        this.showToast("Ma'lumotlar muvaffaqiyatli saqlandi", "success");
      } catch (error) {
        this.showToast("Ma'lumotlarni saqlashda xatolik yuz berdi", "error");
        console.error("Error saving teacher data:", error);
      }
    },

    openLoginEditModal() {
      this.loginEditModal = true;
    },

    closeLoginEditModal() {
      this.loginEditModal = false;
    },

    async saveLoginDetails() {
      try {
        const teacherRef = doc(db, "users", this.editForm.name);
        await updateDoc(teacherRef, {
          username: this.editForm.username,
          password: this.editForm.password,
        });

        this.teacher.username = this.editForm.username;
        this.teacher.password = this.editForm.password;
        this.closeLoginEditModal();

        this.showToast("Login va parol muvaffaqiyatli saqlandi", "success");
      } catch (error) {
        this.showToast("Login va parolni saqlashda xatolik yuz berdi", "error");
        console.error("Error saving login details:", error);
      }
    },

    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
    },

    // Lesson methods
    openNewLessonModal() {
      this.isEditingLesson = false;
      this.lessonForm = {
        title: "",
        group: "",
        time: "",
        status: "Kutilmoqda"
      };
      this.lessonModal = true;
    },

    editLesson(index) {
      this.isEditingLesson = true;
      this.editingLessonIndex = index;

      const lesson = this.todayLessons[index];
      this.lessonForm = {
        title: lesson.title,
        group: lesson.group,
        time: lesson.time,
        status: lesson.status
      };

      this.lessonModal = true;
    },

    closeLessonModal() {
      this.lessonModal = false;
    },

    // Continue saveLesson method
    async saveLesson() {
      try {
        // Validate form
        if (!this.lessonForm.title || !this.lessonForm.group || !this.lessonForm.time) {
          this.showToast("Barcha maydonlarni to'ldiring", "error");
          return;
        }

        const teacherName = localStorage.getItem("teacherName");

        if (this.isEditingLesson) {
          // Update existing lesson
          const lessonId = this.todayLessons[this.editingLessonIndex].id;
          const lessonRef = doc(db, "lessons", lessonId);

          await updateDoc(lessonRef, {
            title: this.lessonForm.title,
            group: this.lessonForm.group,
            time: this.lessonForm.time,
            status: this.lessonForm.status,
          });

          // Update local array
          this.todayLessons[this.editingLessonIndex] = {
            ...this.todayLessons[this.editingLessonIndex],
            title: this.lessonForm.title,
            group: this.lessonForm.group,
            time: this.lessonForm.time,
            status: this.lessonForm.status,
          };

          this.showToast("Dars muvaffaqiyatli yangilandi", "success");
        } else {
          // Add new lesson
          const newLesson = {
            teacherName: teacherName,
            title: this.lessonForm.title,
            group: this.lessonForm.group,
            time: this.lessonForm.time,
            status: this.lessonForm.status,
            createdAt: new Date().toISOString(),
          };

          const docRef = await addDoc(collection(db, "lessons"), newLesson);
          newLesson.id = docRef.id;

          // Add to local array
          this.todayLessons.push(newLesson);

          // Sort lessons by time
          this.todayLessons.sort((a, b) => {
            const timeA = a.time.split(' - ')[0];
            const timeB = b.time.split(' - ')[0];
            return timeA.localeCompare(timeB);
          });

          this.showToast("Yangi dars qo'shildi", "success");
        }

        this.closeLessonModal();
      } catch (error) {
        console.error("Error saving lesson:", error);
        this.showToast("Darsni saqlashda xatolik yuz berdi", "error");
      }
    },

    // Plan methods
    openNewPlanModal() {
      this.isEditingPlan = false;

      // Set default date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      this.dateSelected = tomorrow.toISOString().substr(0, 10);

      // Format the date for display
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = new Date(this.dateSelected).toLocaleDateString('uz-UZ', options);

      this.planForm = {
        title: "",
        date: formattedDate,
        dateRaw: this.dateSelected,
        time: "",
        icon: "mdi-notebook-check",
        color: "red"
      };

      this.planModal = true;
    },

    editPlan(index) {
      this.isEditingPlan = true;
      this.editingPlanIndex = index;

      const plan = this.weekPlan[index];
      this.dateSelected = plan.dateRaw;

      this.planForm = {
        title: plan.title,
        date: plan.date,
        dateRaw: plan.dateRaw,
        time: plan.time,
        icon: plan.icon,
        color: plan.color
      };

      this.planModal = true;
    },

    closePlanModal() {
      this.planModal = false;
    },

    setFormattedDate() {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const formattedDate = new Date(this.dateSelected).toLocaleDateString('uz-UZ', options);

      this.planForm.date = formattedDate;
      this.planForm.dateRaw = this.dateSelected;
      this.dateMenu = false;
    },

    async savePlan() {
      try {
        // Validate form
        if (!this.planForm.title || !this.planForm.date || !this.planForm.time) {
          this.showToast("Barcha maydonlarni to'ldiring", "error");
          return;
        }

        const teacherName = localStorage.getItem("teacherName");

        if (this.isEditingPlan) {
          // Update existing plan
          const planId = this.weekPlan[this.editingPlanIndex].id;
          const planRef = doc(db, "plans", planId);

          await updateDoc(planRef, {
            title: this.planForm.title,
            date: this.planForm.date,
            dateRaw: this.planForm.dateRaw,
            time: this.planForm.time,
            icon: this.planForm.icon,
            color: this.planForm.color
          });

          // Update local array
          this.weekPlan[this.editingPlanIndex] = {
            ...this.weekPlan[this.editingPlanIndex],
            title: this.planForm.title,
            date: this.planForm.date,
            dateRaw: this.planForm.dateRaw,
            time: this.planForm.time,
            icon: this.planForm.icon,
            color: this.planForm.color
          };

          this.showToast("Reja muvaffaqiyatli yangilandi", "success");
        } else {
          // Add new plan
          const newPlan = {
            teacherName: teacherName,
            title: this.planForm.title,
            date: this.planForm.date,
            dateRaw: this.planForm.dateRaw,
            time: this.planForm.time,
            icon: this.planForm.icon,
            color: this.planForm.color,
            createdAt: new Date().toISOString()
          };

          const docRef = await addDoc(collection(db, "plans"), newPlan);
          newPlan.id = docRef.id;

          // Add to local array
          this.weekPlan.push(newPlan);

          // Sort plans
          this.weekPlan.sort((a, b) => {
            if (a.dateRaw === b.dateRaw) {
              return a.time.localeCompare(b.time);
            }
            return a.dateRaw.localeCompare(b.dateRaw);
          });

          this.showToast("Yangi reja qo'shildi", "success");
        }

        this.closePlanModal();
      } catch (error) {
        console.error("Error saving plan:", error);
        this.showToast("Rejani saqlashda xatolik yuz berdi", "error");
      }
    },

    // Delete methods
    confirmDeleteLesson(index) {
      this.deleteType = "lesson";
      this.deleteIndex = index;
      this.deleteMessage = "Siz rostdan ham bu darsni o'chirmoqchimisiz?";
      this.deleteDialog = true;
    },

    confirmDeletePlan(index) {
      this.deleteType = "plan";
      this.deleteIndex = index;
      this.deleteMessage = "Siz rostdan ham bu rejani o'chirmoqchimisiz?";
      this.deleteDialog = true;
    },

    async confirmDelete() {
      try {
        if (this.deleteType === "lesson") {
          const lessonId = this.todayLessons[this.deleteIndex].id;
          await deleteDoc(doc(db, "lessons", lessonId));
          this.todayLessons.splice(this.deleteIndex, 1);
          this.showToast("Dars muvaffaqiyatli o'chirildi", "success");
        } else if (this.deleteType === "plan") {
          const planId = this.weekPlan[this.deleteIndex].id;
          await deleteDoc(doc(db, "plans", planId));
          this.weekPlan.splice(this.deleteIndex, 1);
          this.showToast("Reja muvaffaqiyatli o'chirildi", "success");
        }
      } catch (error) {
        console.error("Error deleting item:", error);
        this.showToast("O'chirishda xatolik yuz berdi", "error");
      } finally {
        this.deleteDialog = false;
      }
    },

    // Utility methods
    refreshAnalytics() {
      this.fetchLessons();
      this.fetchPlans();
      this.showToast("Ma'lumotlar yangilandi", "success");
    },

    getLessonStatusColor(status) {
      if (status === "Tugallandi") return "success";
      if (status === "Hozirda") return "info";
      return "warning";
    },

    // Animation methods
    animateCard(card) {
      if (this.animationTimeouts[card]) {
        clearTimeout(this.animationTimeouts[card]);
      }

      const element = this.$refs[card + 'Value'];
      if (element) {
        element.classList.add('animated');
      }
    },

    resetAnimation(card) {
      this.animationTimeouts[card] = setTimeout(() => {
        const element = this.$refs[card + 'Value'];
        if (element) {
          element.classList.remove('animated');
        }
      }, 300);
    },

    // Format numbers with commas
    formatNumber(num) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
    },

    // Toast notification
    showToast(message, type = "success") {
      Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor: type === "success" ? "#4CAF50" : "#F44336",
      }).showToast();
    }
  },

  async created() {
    await this.fetchTeacher();
  }
};
</script>

<style scoped>
/* Enhanced Dashboard Styles with Modern Design */

.plan-content{
  height: 12vh;
  padding: 15px;
}
.dashboard-header {
  margin-bottom: 32px;
  text-align: center;
  position: relative;
  padding-bottom: 20px;
}

.dashboard-header:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: linear-gradient(90deg, #3f51b5, #2196f3);
  border-radius: 2px;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 8px;
  text-shadow: 0px 1px 2px rgba(0, 0, 0, 0.1);
}

.dashboard-subtitle {
  font-size: 1.1rem;
  font-weight: 400;
  letter-spacing: 0.5px;
}

/* Profile card */
.profile-card {
  border-radius: 16px;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  overflow: hidden;
  /* background: linear-gradient(145deg, #ffffff, #f7f9fc); */
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08) !important;
  border: none !important;
}

.profile-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(41, 53, 108, 0.12) !important;
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 16px 16px;
  /* background: linear-gradient(120deg, #e8eaf6, #ede7f6); */
}

.avatar-main {
  border: 5px solid #ffffff;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

.profile-card:hover .avatar-main {
  transform: scale(1.05);
}

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-initial {
  font-size: 2.8rem;
  font-weight: bold;
}

.profile-info {
  width: 100%;
  text-align: center;
  margin-top: 1.5rem;
  padding: 0 12px;
}

.profile-name {
  margin-bottom: 8px;
  font-weight: 700;
  font-size: 1.3rem;
}

.profile-username {
  margin-bottom: 10px;
  font-weight: 500;
  padding: 6px 12px;
  background-color: rgba(92, 107, 192, 0.08);
  border-radius: 100px;
  display: inline-block;
}

.profile-subject {
  margin-bottom: 12px;
  font-weight: 600;
  font-size: 1rem;
  /* color: #3949ab !important; */
  position: relative;
  padding-bottom: 10px;
}

.profile-subject::after {
  content: '';
  position: absolute;
  width: 40px;
  height: 3px;
  background-color: #c5cae9;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 3px;
}

.action-buttons {
  padding: 20px 16px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 16px;
  /* background-color: #fafafa; */
}

.action-button {
  text-transform: none;
  font-weight: 600;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 8px 24px !important;
  min-width: 140px;
  letter-spacing: 0.5px;
  transition: all 0.3s ease !important;
}

.action-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* Stats cards */
.stats-card {
  border-radius: 16px;
  padding: 24px;
  position: relative;
  min-height: 180px;
  display: flex;
  flex-direction: column;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  overflow: hidden;
  background-color: #ffffff;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08) !important;
  border: none !important;
}

.dark-mode .revenue-card,
.clients-card {
  /* background: linear-gradient(135deg, #e3f2fd, #ffffff); */
  background: linear-gradient(135deg, #1e1e2f, #2a2a3b);
}

.dark-mode .analytics-card,
.dark-mode .schedule-container,
.dark-mode .week-plan-container {

  background: #0D1117;
}

.revenue-card {
  background: linear-gradient(135deg, #e3f2fd, #ffffff);
}

.light-mode .clients-card {
  background: linear-gradient(135deg, #e3f2fd, #ffffff);
}

/* .clients-card {
  background: linear-gradient(135deg, #e3f2fd, #ffffff);

} */

.stats-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important;
}

.stats-icon-container {
  width: 60px;
  height: 60px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.stats-card:hover .stats-icon-container {
  transform: rotate(10deg);
}

.stats-content {
  flex: 1;
  z-index: 1;
}

.stats-title {
  font-size: 1rem;
  color: #546e7a;
  margin-bottom: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
}

.stats-value {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 20px;
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  color: #263238;
}

.revenue-card .stats-value {
  color: #1565c0;
}

.clients-card .stats-value {
  /* color: #5e35b1; */
  color: #1565c0;

}

.stats-value.animated {
  transform: scale(1.05);
}

.currency {
  font-size: 1.2rem;
  font-weight: 600;
  color: #78909c;
  margin-right: 4px;
}

.stats-chart {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  opacity: 0.2;
  transition: opacity 0.3s ease;
}

.stats-card:hover .stats-chart {
  opacity: 0.4;
}

.chart {
  width: 100%;
  height: 100%;
}

.chart-path {
  fill: none;
  stroke-width: 2.5;
  stroke-linecap: round;
}

.revenue-path {
  stroke: #2196F3;
}

.clients-path {
  stroke: #2196F3;

}


.analytics-card:hover {
  /* box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1) !important; */
}

.analytics-header {
  display: flex;
  align-items: center;
  /* background: linear-gradient(90deg, #f3e5f5, #e8eaf6); */
  padding: 20px;
  border-bottom: 1px solid #ede7f6;
}



/* Schedule */
.schedule-container,
.week-plan-container {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 20px;
  height: 100%;
  min-height: 320px;
  /* box-shadow: 0 5px 20px rgba(0, 0, 0, 0.05); */
  transition: all 0.3s ease;
}

.schedule-container:hover,
.week-plan-container:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
}

.schedule-timeline {
  max-height: 320px;
  overflow-y: auto;
  padding-right: 8px;
}

.schedule-timeline::-webkit-scrollbar {
  width: 5px;
}

.schedule-timeline::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.schedule-timeline::-webkit-scrollbar-thumb {
  background: #c5cae9;
  border-radius: 10px;
}



.timeline-item {
  display: flex;
  padding: 16px 12px;
  border-bottom: 1px solid #eceff1;
  align-items: center;
  transition: all 0.2s ease;
  border-radius: 8px;
}

.timeline-item:hover {
  background-color: #f5f7fa;
  transform: translateX(5px);
}

.timeline-item:last-child {
  border-bottom: none;
}

.timeline-time {
  min-width: 110px;
  color: #455a64;
  font-weight: 600;
  font-size: 0.9rem;
  background-color: #eceff1;
  padding: 6px 10px;
  border-radius: 6px;
  text-align: center;
}

.timeline-content {
  flex: 1;
  margin: 0 16px;
}

.timeline-title {
  font-weight: 600;
  margin-bottom: 4px;
  color: #263238;
  font-size: 1rem;
}

.timeline-group {
  font-size: 0.875rem;
  color: #607d8b;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
}

.timeline-group::before {
  content: '\2022';
  margin-right: 6px;
  color: #90a4ae;
  font-size: 1.2rem;
}

.timeline-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 4px 12px;
}

.timeline-actions {
  display: flex;
  gap: 10px;
}

.timeline-actions .v-btn {
  opacity: 0.6;
  transition: all 0.2s ease;
}

.timeline-item:hover .timeline-actions .v-btn {
  opacity: 1;
}

/* Week Plan */
.week-plan-content {
  max-height: 320px;
  overflow-y: auto;
}

.week-plan-content::-webkit-scrollbar {
  width: 5px;
}

.week-plan-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.week-plan-content::-webkit-scrollbar-thumb {
  background: #c5cae9;
  border-radius: 10px;
}

.week-plan-content::-webkit-scrollbar-thumb:hover {
  background: #9fa8da;
}

.week-plan-item {
  border-radius: 8px;
  margin-bottom: 4px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.week-plan-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background-color: #e0e0e0;
  transition: all 0.3s ease;
}

.week-plan-item:hover {
  background-color: #f5f7fa;
}

.week-plan-item:hover::before {
  width: 5px;
}

/* Empty states */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 150px;
  color: #90a4ae;
  /* background-color: #f5f7fa; */
  border-radius: 10px;
  border: 1px dashed #cfd8dc;
  margin: 12px 0;
}

/* Modal styling */
.v-dialog .v-card {
  border-radius: 12px;
  overflow: hidden;
}

.v-dialog .v-card__title {
  padding: 24px;
  font-size: 1.3rem;
  background: linear-gradient(135deg, #e8eaf6, #ede7f6);
  color: #3949ab;
}

.v-dialog .v-card__text {
  padding: 24px;
}

.modal-actions {
  padding: 16px 24px;
  background-color: #f5f7fa;
}

.v-text-field.v-text-field--outlined .v-label {
  font-size: 0.95rem;
}

.v-text-field--outlined fieldset {
  border-color: #c5cae9;
}

/* Responsive fixes */
@media (max-width: 960px) {
  .dashboard-title {
    font-size: 2rem;
  }

  .profile-header {
    flex-direction: column;
  }

  .profile-info {
    margin-top: 16px;
    text-align: center;
  }

  .timeline-time {
    min-width: 90px;
    font-size: 0.8rem;
  }

  .stats-value {
    font-size: 1.7rem;
  }
}

@media (max-width: 600px) {
  .dashboard-header:after {
    width: 40px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-button {
    width: 100%;
  }

  .timeline-item {
    flex-direction: column;
    align-items: flex-start;
  }

  .timeline-time {
    margin-bottom: 12px;
    width: 100%;
  }

  .timeline-content {
    margin: 0 0 12px 0;
    width: 100%;
  }

  .timeline-actions {
    margin-top: 10px;
    align-self: flex-end;
  }
}

/* Animation keyframes for cards and elements */
@keyframes float {
  0% {
    transform: translateY(0px);
  }

  50% {
    transform: translateY(-5px);
  }

  100% {
    transform: translateY(0px);
  }
}

.profile-card:hover .profile-image,
.profile-card:hover .profile-initial {
  animation: float 3s ease-in-out infinite;
}
</style>