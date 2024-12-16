<template>
      <v-container>
        <h2 class="text-h5 mb-4">O‘qituvchilar Ro‘yxati</h2>
        <v-data-table
          :headers="headers"
          :items="teachers"
          item-value="id"
          class="elevation-1"
        >
        <template v-slot:item.index="{ index }">
            <!-- Display sequence number based on index and pagination -->
            {{ index + 1 }}
          </template>
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>O‘qituvchilar</v-toolbar-title>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="addTeacher">Yangi O‘qituvchi</v-btn>
            </v-toolbar>
          </template>
        </v-data-table>
      </v-container>
    </template>
    
    <script>
    import { collection, getDocs } from "firebase/firestore";
    import { db } from "../firebaseConfig";
    
    export default {
      name: "TeachersList",
      data() {
        return {
          headers: [
            { text: "No", value: "index", sortable: false },
            { text: "Ismi", value: "name" },
            { text: "Familiyasi", value: "surname" },
            { text: "Fan", value: "subject" },
          ],
          teachers: [],
        };
      },
      async created() {
        const querySnapshot = await getDocs(collection(db, "teachers"));
        this.teachers = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      },
      methods: {
        addTeacher() {
          console.log("Yangi o‘qituvchi qo‘shish modalini ochish");
        },
      },
    };
    </script>
    