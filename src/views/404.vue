<template>
    <div class="page-404 h-full ">
        <v-btn class="ma-2 bg-black  "  @click="$router.back()">
            <v-icon start icon="mdi-arrow-left"></v-icon>
            Back
        </v-btn>
    </div>
</template>
<script>

export default {

}
</script>
<style lang="scss">
.page-404 {
    background-image: url("https://support.heberjahiz.com/hc/article_attachments/21013076295570");
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
}
</style>