<template>
      <v-container>
        <v-form @submit.prevent="addUser">
          <v-text-field v-model="email" label="Email" required></v-text-field>
          <v-text-field v-model="password" label="Password" type="password" required></v-text-field>
          <v-select
            v-model="role"
            :items="['admin', 'teacher']"
            label="Role"
            required
          ></v-select>
          <v-btn type="submit" color="primary">Add User</v-btn>
        </v-form>
        <v-alert v-if="error" type="error" dismissible>{{ error }}</v-alert>
        <v-alert v-if="success" type="success" dismissible>{{ success }}</v-alert>
      </v-container>
    </template>
    
    <script>
    import { createUserWithEmailAndPassword } from "firebase/auth";
    import { setDoc, doc } from "firebase/firestore";
    import { auth, db } from "@/firebaseConfig";
    
    export default {
      data() {
        return {
          email: "",
          password: "",
          role: "teacher",
          error: null,
          success: null,
        };
      },
      methods: {
        async addUser() {
          try {
            // Firebase Authentication orqali foydalanuvchini qo‘shish
            const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
            const uid = userCredential.user.uid;
    
            // Firestore'da foydalanuvchi ma'lumotlarini saqlash
            await setDoc(doc(db, "users", uid), {
              email: this.email,
              role: this.role,
            });
    
            this.success = "User added successfully!";
            this.error = null;
            this.email = "";
            this.password = "";
            this.role = "teacher";
          } catch (error) {
            this.error = error.message;
            this.success = null;
          }
        },
      },
    };
    </script>
    