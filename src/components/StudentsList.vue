<template>
  <v-container>
    <!-- *** -->
    <h2 class="text-h5 mb-4">Talabalar Ro‘yxati</h2>
    <!-- Sub title  -->
    <v-data-table
      :headers="headers"
      :items="students"
      item-value="id"
      class="elevation-1"
    >
      <template v-slot:item.index="{ index }">
        <!-- Display sequence number based on index and pagination -->
        {{ index + 1 }}
      </template>
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Talabalar</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="addStudent">Yangi Talaba</v-btn>
        </v-toolbar>
      </template>
    </v-data-table>
    <!-- *** -->
  </v-container>
</template>
    
<script>
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default {
  name: "StudentsList",
  data() {
    return {
      headers: [
        { text: "No", value: "index", sortable: false },
        { text: "Ismi", value: "name" },
        { text: "Familiyasi", value: "surname" },
        { text: "Telefon", value: "phone" },
        { text: "O‘qituvchi", value: "teacher.name" },
      ],
      students: [],
    };
  },
  async created() {
    const querySnapshot = await getDocs(collection(db, "students"));
    this.students = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  },
  methods: {
    addStudent() {
      console.log("Yangi talaba qo‘shish modalini ochish");
    },
  },
};
</script>
    