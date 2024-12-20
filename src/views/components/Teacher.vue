<template>
  <v-container>
    <v-card class="pa-5">
      <v-card
        class="v-card-title d-flex justify-between items-center"
        style="justify-content: space-between; align-items: center"
      >
        <v-card-title class="text-h5">O'qtuvchi qo'shish </v-card-title>
        <v-btn
          color="green"
          class="btn-title mr-4"
          @click="openAddTeacherModal"
        >
          Add Teacher
        </v-btn>
      </v-card>
      <v-data-table
        :headers="headers"
        :items="teachers"
        item-value="id"
        class="elevation-1 px-5"
      >
        <template v-slot:body="{ items }">
          <tbody>
            <tr
              v-for="(teacher, index) in items"
              :key="teacher.id"
              class="mb-5"
            >
              <td class="px-5 mb-5" col="2">{{ index + 1 }}</td>

              <td class="px-5" col="4">{{ teacher.name }}</td>

              <td class="px-5">{{ teacher.username }}</td>
              <td class="px-5">{{ teacher.subject }}</td>

              <td class="px-5">{{ teacher.role }}</td>
              <td class="text-end">
                <v-btn
                  small
                  color="warning"
                  class="ml-2 my-3"
                  @click="editTeacher(teacher)"
                >
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <v-btn
                  small
                  color="red"
                  class="ml-2 my-3"
                  @click="deleteTeacher(teacher.id)"
                >
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </td>
            </tr>
          </tbody>
        </template>
      </v-data-table>
    </v-card>

    <!-- Teacher Modal -->
    <v-dialog v-model="showModal" max-width="500px">
      <v-card>
        <v-card-title>{{
          isEdit ? "O'qtuvchi taxriirlash" : "O'qtuvchi qo'shish"
        }}</v-card-title>

        <v-card-text>
          <v-form ref="form" v-model="formValid" lazy-validation>
            <v-text-field
              v-model="form.username"
              label="Username"
              required
            ></v-text-field>
            <v-text-field
              v-model="form.password"
              label="Password"
              type="password"
              required
            ></v-text-field>
            <v-text-field
              v-model="form.name"
              label="Name"
              required
            ></v-text-field>
            <v-select
              v-model="form.subject"
              :items="subjects"
              label="Subject"
              required
            ></v-select>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="saveTeacher">saqlash</v-btn>
          <v-btn text @click="closeModal">bekor qilish</v-btn>
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
  data() {
    return {
      teachers: [],
      headers: [
        { text: "Username", value: "username" },
        { text: "Role", value: "role" },
        { text: "Actions", value: "actions", sortable: false },
      ],
      subjects: [
        "Matematika",
        "English",
        "Tarix",
        "Kareys tili",
        "Kimyo",
        "Huquq",
        "Ona tili",
      ], // O'qituvchilar uchun fanlar ro'yxati
      showModal: false,
      form: {
        username: "",
        password: "",
        name: "", // O'qituvchining ismi
        subject: "", // O'qituvchining fani
      },
      isEdit: false,
      editId: null,
    };
  },
  methods: {
    async fetchTeachers() {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        this.teachers = querySnapshot.docs
          .filter((doc) => doc.data().role === "teacher")
          .map((doc) => ({ id: doc.id, ...doc.data() }));
      } catch (error) {
        this.showToast("O'qituvchilarni yuklashda xatolik yuz berdi", "error");
      }
    },
    openAddTeacherModal() {
      this.showModal = true;
      this.isEdit = false;
      this.form = { username: "", password: "", name: "", subject: "" };
    },
    async saveTeacher() {
      try {
        if (this.isEdit) {
          await setDoc(doc(db, "subjects", this.editId), {
            teacherName: this.form.name,
            name: this.form.subject,
          });
          this.showToast("O'qituvchi muvaffaqiyatli tahrirlandi", "success");
        }
        if (this.isEdit) {
          await setDoc(doc(db, "teachers", this.editId), {
            name: this.form.name,
            subject: this.form.subject,
          });
          this.showToast("O'qituvchi muvaffaqiyatli tahrirlandi", "success");
        }
        if (this.isEdit) {
          await setDoc(doc(db, "users", this.editId), {
            username: this.form.username,
            password: this.form.password,
            name: this.form.name,
            subject: this.form.subject,
            role: "teacher",
          });
          this.showToast("O'qituvchi muvaffaqiyatli tahrirlandi", "success");
        } else {
          await setDoc(doc(db, "users", this.form.username), {
            username: this.form.username,
            password: this.form.password,
            name: this.form.name,
            subject: this.form.subject,
            role: "teacher",
          });
          this.showToast("O'qituvchi muvaffaqiyatli qo'shildi", "success");
        }

        this.closeModal();
        this.fetchTeachers(); // Yangi ma'lumotlarni olish
      } catch (error) {
        this.showToast("Saqlashda xatolik yuz berdi", "error");
      }
    },
    editTeacher(teacher) {
      this.isEdit = true;
      this.editId = teacher.id;
      this.form = {
        username: teacher.username,
        password: teacher.password,
        name: teacher.name,
        subject: teacher.subject,
      };
      this.showModal = true;
    },
    async deleteTeacher(id) {
      try {
        await deleteDoc(doc(db, "users", id));
        this.showToast("O'qituvchi muvaffaqiyatli o'chirildi", "success");
        this.fetchTeachers();
      } catch (error) {
        this.showToast("O'chirishda xatolik yuz berdi", "error");
      }
    },
    closeModal() {
      this.showModal = false;
    },
    showToast(message, type) {
      Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        backgroundColor:
          type === "success" ? "green" : type === "error" ? "red" : "blue",
      }).showToast();
    },
  },
  mounted() {
    this.fetchTeachers(); // Sahifa yuklanganda o'qituvchilarni olish
  },
};
</script>

<style>
/* Toastify uchun qo'shimcha styling kerak bo'lsa, shu yerga yozing */
.v-card-title {
  flex-wrap: wrap;
}
@media (max-width: 576px) {
  .v-card-title {
    flex-wrap: wrap;
    margin: 0 auto;
  }
  .btn-title {
    margin: 0 30%;
  }
}
</style>
