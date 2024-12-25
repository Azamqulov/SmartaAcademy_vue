<template>
  <v-container>
    <!-- *** -->
    <v-card class="text-center">
      <!--  -->
      <v-card-title>{{ title }}</v-card-title>
      <!--  -->
      <v-card-subtitle class="headline text-3xl" style="font-size: 20px">
        {{ value }}
      </v-card-subtitle>
    </v-card>
    <!-- *** -->
  </v-container>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    value: {
      type: [Number, String],
      required: true,
    },
  },
};
</script>

<style scoped>
.text-center {
  text-align: center;
}
</style>
