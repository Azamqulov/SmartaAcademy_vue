<template>
    <div class="student-modals">
      <!-- Add Student Modal with improved UI -->
      <v-dialog v-model="addModalLocal" max-width="600px" persistent>
        <v-card class="rounded-lg modal-card">
          <div class="modal-pattern"></div>
          <v-card-title class="blue white--text modal-header d-flex flex-row align-center justify-space-between">
            <v-icon left color="blue ">mdi-account-plus</v-icon>
            <p> Yangi o'quvchi qo'shish</p>
            <v-btn icon small @click="closeAddModal" color="blue" >
              <v-icon >mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          
          <v-card-text class="pt-6">
            <v-form ref="addForm">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="newStudentLocal.name"
                    label="Ism"
                    prepend-icon="mdi-account"
                    outlined
                    color="blue"
                    :rules="[(v) => v?.length >= 3 || 'Kamida 3 ta belgi bo\'lishi kerak']"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="newStudentLocal.surname"
                    label="Familya"
                    prepend-icon="mdi-account-details"
                    outlined
                    color="blue"
                    :rules="[(v) => v?.length >= 3 || 'Kamida 3 ta belgi bo\'lishi kerak']"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="newStudentLocal.phone"
                    label="Telefon raqam"
                    prepend-icon="mdi-phone"
                    outlined
                    type="number"
                    color="blue"
                    :rules="[(v) => v?.length >= 9 || 'To\'g\'ri kiriting telefon raqamni']"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="newStudentLocal.payment"
                    label="To'lov summasi"
                    prepend-icon="mdi-cash"
                    outlined
                    type="number"
                    suffix="so'm"
                    color="blue"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="newStudentLocal.subject"
                    :items="subjects"
                    label="Fan"
                    prepend-icon="mdi-book"
                    outlined
                    color="blue"
                    :rules="[(v) => !!v || 'Fan tanlanmadi']"
                  ></v-select>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="newStudentLocal.teacher"
                    :items="teachers"
                    label="O'qtuvchi"
                    prepend-icon="mdi-account-tie"
                    outlined
                    color="blue"
                    :rules="[(v) => !!v || 'O\'qtuvchi tanlanmadi']"
                  ></v-select>
                </v-col>
                
                <v-col cols="12">
                  <v-menu
                    ref="dateMenu"
                    v-model="dateMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="newStudentLocal.date"
                        label="Kelgan sanasi"
                        prepend-icon="mdi-calendar"
                        readonly
                        outlined
                        color="blue"
                        v-bind="attrs"
                        v-on="on"
                        :rules="[(v) => !!v || 'Sana kiritilmadi']"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="newStudentLocal.date"
                      color="blue"
                      @input="dateMenu = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          
          <v-divider></v-divider>
          
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              text
              color="grey darken-1"
              @click="closeAddModal"
            >
              Bekor qilish
            </v-btn>
            <v-btn
              color="blue"
              :disabled="!isValidForm(newStudentLocal)"
              @click="submitAddStudent"
              :loading="loading"
            >
              <v-icon left>mdi-content-save</v-icon>
              Qo'shish
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!-- Edit Student Modal -->
      <v-dialog v-model="editModalLocal" max-width="600px" persistent>
        <v-card class="rounded-lg modal-card">
          <div class="modal-pattern"></div>
          <v-card-title class="primary white--text modal-header">
            <v-icon left color="white">mdi-account-edit</v-icon>
            O'quvchi ma'lumotlarini tahrirlash
            <v-spacer></v-spacer>
            <v-btn icon small @click="closeEditModal" class="white--text">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          
          <v-card-text class="pt-6">
            <v-form ref="editForm">
              <v-row>
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="editedStudentLocal.name"
                    label="Ism"
                    prepend-icon="mdi-account"
                    outlined
                    color="blue"
                    :rules="[(v) => v?.length >= 3 || 'Kamida 3 ta belgi bo\'lishi kerak']"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="editedStudentLocal.surname"
                    label="Familya"
                    prepend-icon="mdi-account-details"
                    outlined
                    color="blue"
                    :rules="[(v) => v?.length >= 3 || 'Kamida 3 ta belgi bo\'lishi kerak']"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="editedStudentLocal.phone"
                    label="Telefon raqam"
                    prepend-icon="mdi-phone"
                    outlined
                    type="number"
                    color="blue"
                    :rules="[(v) => v?.length >= 9 || 'To\'g\'ri kiriting telefon raqamni']"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-text-field
                    v-model="editedStudentLocal.payment"
                    label="To'lov summasi"
                    prepend-icon="mdi-cash"
                    outlined
                    type="number"
                    suffix="so'm"
                    color="blue"
                  ></v-text-field>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="editedStudentLocal.subject"
                    :items="subjects"
                    label="Fan"
                    prepend-icon="mdi-book"
                    outlined
                    color="blue"
                  ></v-select>
                </v-col>
                
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="editedStudentLocal.teacher"
                    :items="teachers"
                    label="O'qtuvchi"
                    prepend-icon="mdi-account-tie"
                    outlined
                    color="blue"
                  ></v-select>
                </v-col>
                
                <v-col cols="12">
                  <v-menu
                    ref="editDateMenu"
                    v-model="editDateMenu"
                    :close-on-content-click="false"
                    transition="scale-transition"
                    min-width="auto"
                  >
                    <template v-slot:activator="{ on, attrs }">
                      <v-text-field
                        v-model="editedStudentLocal.date"
                        label="Kelgan sanasi"
                        prepend-icon="mdi-calendar"
                        readonly
                        outlined
                        color="blue"
                        v-bind="attrs"
                        v-on="on"
                      ></v-text-field>
                    </template>
                    <v-date-picker
                      v-model="editedStudentLocal.date"
                      color="blue"
                      @input="editDateMenu = false"
                    ></v-date-picker>
                  </v-menu>
                </v-col>
              </v-row>
            </v-form>
          </v-card-text>
          
          <v-divider></v-divider>
          
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              text
              color="grey darken-1"
              @click="closeEditModal"
            >
              Bekor qilish
            </v-btn>
            <v-btn
              color="blue"
              :disabled="!isValidForm(editedStudentLocal)"
              @click="submitUpdateStudent"
              :loading="loading"
            >
              <v-icon left>mdi-content-save</v-icon>
              Saqlash
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="deleteDialogLocal" max-width="420px">
        <v-card class="rounded-lg">
          <v-card-title class="error white--text">
            <v-icon left color="white">mdi-alert</v-icon>
            O'quvchini o'chirish
            <v-spacer></v-spacer>
            <v-btn icon small @click="closeDeleteModal" class="white--text">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-card-title>
          
          <v-card-text class="pt-4 text-center">
            <v-icon color="error" size="64" class="mb-4">mdi-delete-forever</v-icon>
            <h3 class="text-h6 mb-2">{{ studentToDeleteLocal ? studentToDeleteLocal.name + ' ' + studentToDeleteLocal.surname : '' }}</h3>
            <p class="text-body-1">Bu o'quvchi ma'lumotlarini o'chirishni istaysizmi?</p>
            <p class="text-caption error--text mt-2">Bu amalni qaytarib bo'lmaydi!</p>
          </v-card-text>
          
          <v-divider></v-divider>
          
          <v-card-actions class="pa-4">
            <v-spacer></v-spacer>
            <v-btn
              text
              color="grey darken-1"
              @click="closeDeleteModal"
            >
              Bekor qilish
            </v-btn>
            <v-btn
              color="error"
              @click="submitDelete"
              :loading="loading"
            >
              <v-icon left>mdi-delete</v-icon>
              O'chirish
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </template>
  
  <script>
  export default {
    name: 'StudentModal',
    props: {
      addModal: {
        type: Boolean,
        default: false
      },
      editModal: {
        type: Boolean,
        default: false
      },
      deleteDialog: {
        type: Boolean,
        default: false
      },
      newStudent: {
        type: Object,
        required: true
      },
      editedStudent: {
        type: Object,
        required: true
      },
      studentToDelete: {
        type: Object,
        default: null
      },
      subjects: {
        type: Array,
        default: () => []
      },
      teachers: {
        type: Array,
        default: () => []
      },
      loading: {
        type: Boolean,
        default: false
      }
    },
    data() {
      return {
        addModalLocal: false,
        editModalLocal: false,
        deleteDialogLocal: false,
        dateMenu: false,
        editDateMenu: false,
        newStudentLocal: {},
        editedStudentLocal: {},
        studentToDeleteLocal: null,
      };
    },
    watch: {
      addModal(val) {
        this.addModalLocal = val;
        if (val) {
          this.newStudentLocal = { ...this.newStudent };
        }
      },
      editModal(val) {
        this.editModalLocal = val;
        if (val) {
          this.editedStudentLocal = { ...this.editedStudent };
        }
      },
      deleteDialog(val) {
        this.deleteDialogLocal = val;
        if (val) {
          this.studentToDeleteLocal = this.studentToDelete;
        }
      },
      newStudent(val) {
        this.newStudentLocal = { ...val };
      },
      editedStudent(val) {
        this.editedStudentLocal = { ...val };
      },
      studentToDelete(val) {
        this.studentToDeleteLocal = val;
      }
    },
    methods: {
      // Validate form fields
      isValidForm(student) {
        return (
          student.name && 
          student.name.length >= 3 && 
          student.surname && 
          student.surname.length >= 3 &&
          student.subject &&
          student.teacher
        );
      },
      
      // Close add modal
      closeAddModal() {
        this.$emit('close-add-modal');
        this.resetForm('addForm');
      },
      
      // Close edit modal
      closeEditModal() {
        this.$emit('close-edit-modal');
      },
      
      // Close delete modal
      closeDeleteModal() {
        this.$emit('close-delete-modal');
      },
      
      // Submit add student form
      submitAddStudent() {
        if (this.$refs.addForm && this.$refs.addForm.validate()) {
          this.$emit('add-student', this.newStudentLocal);
        }
      },
      
      // Submit update student form
      submitUpdateStudent() {
        if (this.$refs.editForm && this.$refs.editForm.validate()) {
          this.$emit('update-student', this.editedStudentLocal);
        }
      },
      
      // Submit delete student
      submitDelete() {
        this.$emit('confirm-delete');
      },
      
      // Reset form validation
      resetForm(formRef) {
        if (this.$refs[formRef]) {
          this.$refs[formRef].reset();
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .modal-card {
    overflow: hidden;
    position: relative;
  }
  
  .modal-pattern {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    background-image: radial-gradient(circle at 1px 1px, rgba(255, 255, 255, 0.1) 1px, transparent 0);
    background-size: 20px 20px;
    z-index: 0;
  }
  
  .modal-header {
    position: relative;
    z-index: 1;
  }
  
  /* Adding animation for the modal */
  .v-dialog {
    transition: transform 0.3s ease, opacity 0.3s ease;
  }
  
  /* Input field animations */
  .v-text-field, .v-select {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .v-text-field:hover, .v-select:hover {
    transform: translateY(-2px);
  }
  
  .v-text-field--focused, .v-select--focused {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
  
  /* Button hover effects */
  .v-btn:not(.v-btn--icon) {
    transition: all 0.3s ease;
  }
  
  .v-btn:not(.v-btn--icon):hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
  }
  </style>