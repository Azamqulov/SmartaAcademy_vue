<template>
  <v-container>
    <v-row justify="center">
      <!-- Profil Kartasi -->
      <v-col cols="12" md="10" lg="7">
        <v-card class="pa-4 m-auto" outlined>
          <v-card-title>
            <v-avatar size="100" style="margin: 20px  47%" justify="center">
              <template v-if="teacher.photoURL">
                <img
                  width="100% "
                  style="height: 150px; margin: 0 auto"
                  class="text-center m-auto"
                  :src="teacher.photoURL"
                  alt="Profil rasmi"
                />
              </template>
              <template v-else>
                <v-avatar
                  style="height: 150px; width: 150px;  font-size: 28px; text-align: center;"
                  color="primary"
                  class="white--text text--center m--auto text-3xl"
                >
                  {{ profileInitial }}
                </v-avatar>
              </template>
            </v-avatar>
            <div>
              <h3 class="">Ism: {{ teacher.name }}</h3>
              <p><strong>Username:</strong> {{ teacher.username }}</p>
              <h4 class="grey--text">Fan: {{ teacher.subject }}</h4>
            </div>
          </v-card-title>
          <v-card-actions>
            <v-btn color="primary" @click="openEditModal"> Tahrirlash</v-btn>
            <v-btn color="secondary" @click="openLoginEditModal">Login va Parolni Tahrirlash</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tahrirlash Modal -->
    <v-dialog v-model="editModal" max-width="500">
      <v-card>
        <v-card-title>Tahrirlash</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editForm.name"
            label="Ismi"
            outlined
          ></v-text-field>

          <!-- Fan Tanlash -->
          <v-autocomplete
            v-model="editForm.subject"
            :items="subjects"
            label="Fan"
            item-text="name"
            item-value="name"
            return-object
            outlined
          ></v-autocomplete>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeEditModal">Bekor qilish</v-btn>
          <v-btn color="primary" @click="saveTeacher">Saqlash</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Login va Parol Tahrirlash Modal -->
    <v-dialog v-model="loginEditModal" max-width="500">
      <v-card>
        <v-card-title>Login va Parolni Tahrirlash</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editForm.username"
            label="Login"
            outlined
          ></v-text-field>

          <!-- Parolni ko'rish va yashirish -->
          <v-text-field
            v-model="editForm.password"
            label="Parol"
            :type="passwordVisible ? 'text' : 'password'"
            outlined
            append-icon="mdi-eye"
            @click:append="togglePasswordVisibility"
          ></v-text-field>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="closeLoginEditModal">Bekor qilish</v-btn>
          <v-btn color="primary" @click="saveLoginDetails">Saqlash</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Admin Paneli -->
    <v-row v-if="isAdmin" class="mt-5">
      <v-col cols="12" md="4">
        <v-card outlined>
          <v-card-title>Jami O'quvchilar</v-card-title>
          <v-card-subtitle>{{ totalStudents }}</v-card-subtitle>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card outlined>
          <v-card-title>Jami To'lovlar</v-card-title>
          <v-card-subtitle>{{ totalPayments }} so'm</v-card-subtitle>
        </v-card>
      </v-col>
      <v-col cols="12" md="4">
        <v-card outlined>
          <v-card-title>Jami O'tganlar</v-card-title>
          <v-card-subtitle>{{ totalPass }}</v-card-subtitle>
        </v-card>
      </v-col>
    </v-row>
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
} from "firebase/firestore";
import Toastify from "toastify-js"; // Import Toastify

export default {
  data() {
    return {
      teacher: {},
      isAdmin: false, // Admin bo'lishini aniqlash
      editModal: false,
      loginEditModal: false,
      passwordVisible: false,
      editForm: {
        name: "",
        subject: "",
        username: "",
        password: "",
      },
      subjects: [], // Array to hold subjects
      totalStudents: 0, // Barcha o'quvchilar soni
      totalPayments: 0, // Barcha to'lovlar summasi
      totalPass: 0,
      currentUser: localStorage.getItem("teacherName"), // Get Teacher Name from localStorage
    };
  },
  computed: {
    profileInitial() {
      return this.currentUser.charAt(0).toUpperCase();
    },
  },
  methods: {
    async fetchTeacher() {
      const teacherName = localStorage.getItem("teacherName");

      if (teacherName) {
        this.editForm.name = teacherName;
      }

      const teacherRef = doc(db, "users", teacherName);
      const docSnap = await getDoc(teacherRef);

      if (docSnap.exists()) {
        this.teacher = docSnap.data();
        this.editForm.subject = this.teacher.subject;
        this.editForm.username = this.teacher.username;
        this.editForm.password = this.teacher.password;
      }

      // Fetch subjects from Firestore
      await this.fetchSubjects();
    },
    
    async fetchSubjects() {
      try {
        const querySnapshot = await getDocs(collection(db, "subjects"));
        this.subjects = querySnapshot.docs.map((doc) => doc.data().name); // Saqlash faqat `name` stringini
        console.log("Teachers loaded:", this.subjects);
      } catch (error) {
        console.error("Error loading teachers:", error);
      }
    },
   
    openEditModal() {
      this.editModal = true;
    },
    closeEditModal() {
      this.editModal = false;
    },
    async saveTeacher() {
      const teacherRef = doc(db, "users", this.editForm.name);
      try {
        await updateDoc(teacherRef, {
          name: this.editForm.name,
          subject: this.editForm.subject,
        });
        this.teacher.name = this.editForm.name;
        this.teacher.subject = this.editForm.subject;
        this.closeEditModal();

        // Success notification
        Toastify({
          text: "Ma'lumotlar muvaffaqiyatli saqlandi",
          backgroundColor: "green",
          duration: 3000,
          top: 300,
        }).showToast();
      } catch (error) {
        // Error notification
        Toastify({
          text: "Ma'lumotlarni saqlashda xatolik yuz berdi",
          backgroundColor: "red",
          duration: 3000,
        }).showToast();
      }
    },
    openLoginEditModal() {
      this.loginEditModal = true;
    },
    closeLoginEditModal() {
      this.loginEditModal = false;
    },
    async saveLoginDetails() {
      const teacherRef = doc(db, "users", this.editForm.name);
      try {
        await updateDoc(teacherRef, {
          username: this.editForm.username,
          password: this.editForm.password,
        });
        this.teacher.username = this.editForm.username;
        this.teacher.password = this.editForm.password;
        this.closeLoginEditModal();

        // Success notification
        Toastify({
          text: "Login va parol muvaffaqiyatli saqlandi",
          backgroundColor: "green",
          duration: 3000,
          top: 300,
        }).showToast();
      } catch (error) {
        // Error notification
        Toastify({
          text: "Login va parolni saqlashda xatolik yuz berdi",
          backgroundColor: "red",
          duration: 3000,
        }).showToast();
      }
    },
    togglePasswordVisibility() {
      this.passwordVisible = !this.passwordVisible;
    },
  },
  async created() {
    await this.fetchTeacher();
  },
};
</script>

<style scoped>
/* Custom Styles */
</style>
