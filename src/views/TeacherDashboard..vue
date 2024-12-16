<template>
      <v-container>
        <h1>Teacher Dashboard</h1>
        <p>Welcome to the teacher dashboard. Here you can view and manage your students.</p>
      </v-container>
    </template>
    
    <script>
    export default {
      created() {
        if (localStorage.getItem('userRole') !== 'teacher') {
          this.$router.push('/login');
        }
      },
    };
    </script>
    