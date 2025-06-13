<template>
    <div>
      <!-- Search and Filter Panel -->
      <v-card class="mb-6 rounded-lg search-card " elevation="2">
        <v-card-text>
          <v-row align="center">
            <v-col cols="12" md="6">
              <v-text-field
                v-model="search"
                label="Ism yoki familiya bo'yicha qidirish"
                prepend-inner-icon="mdi-magnify"
                clearable
                filled
                dense
                hide-details
                color="primary"
                class="search-field"
              ></v-text-field>
            </v-col>
            <v-col cols="12" md="6" v-if="!isAdmin">
              <v-select
                v-model="selectedSubject"
                :items="subjects"
                label="Fan bo'yicha filterlash"
                prepend-inner-icon="mdi-book-open-variant"
                filled
                dense
                hide-details
                clearable
                color="primary"
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
  
      <!-- Students Data Table -->
      <v-card class="rounded-lg student-table-card" elevation="3">
        <v-card-title class="subtitle-1 font-weight-bold title-bar">
          <v-icon left color="primary" class="mr-2">mdi-account-group</v-icon>
          O'quvchilar ro'yxati
          <v-chip class="ml-2" color="primary" small outlined pill>
            {{ filteredStudents.length }} ta
          </v-chip>
          
          <v-spacer></v-spacer>
          
          <v-btn-toggle
            v-model="viewMode"
            dense
            mandatory
            color="primary"
            class="hidden-sm-and-down"
          >
            <v-btn value="table" small>
              <v-icon small>mdi-table</v-icon>
            </v-btn>
            <v-btn value="card" small>
              <v-icon small>mdi-view-grid</v-icon>
            </v-btn>
          </v-btn-toggle>
        </v-card-title>
        
        <!-- Card View Mode -->
        <div v-if="viewMode === 'card'" class="px-4 py-2">
          <v-row>
            <v-col cols="12" sm="6" md="4" lg="3" v-for="(item, index) in filteredStudents" :key="item.id">
              <v-card class="student-card" elevation="2">
                <v-card-title class="py-2 card-title">
                  <v-avatar color="primary" size="36" class="mr-2">
                    <span class="white--text">{{ getInitials(item.name) }}</span>
                  </v-avatar>
                  <span class="text-subtitle-1 font-weight-bold">{{ item.name }} {{ item.surname }}</span>
                </v-card-title>
                
                <v-divider></v-divider>
                
                <v-card-text>
                  <v-list-item class="px-0 py-1">
                    <v-list-item-icon class="mr-2">
                      <v-icon color="primary" small>mdi-book</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-subtitle>
                        <v-chip small color="blue" text-color="white">
                          {{ item.subject }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  
                  <v-list-item class="px-0 py-1">
                    <v-list-item-icon class="mr-2">
                      <v-icon color="primary" small>mdi-account-tie</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-subtitle>{{ item.teacher?.name }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  
                  <v-list-item class="px-0 py-1">
                    <v-list-item-icon class="mr-2">
                      <v-icon color="primary" small>mdi-phone</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-subtitle>{{ item.phone }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                  
                  <v-list-item class="px-0 py-1">
                    <v-list-item-icon class="mr-2">
                      <v-icon color="primary" small>mdi-cash</v-icon>
                    </v-list-item-icon>
                    <v-list-item-content>
                      <v-list-item-subtitle class="font-weight-bold">{{ formatCurrency(item.payment) }}</v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-card-text>
                
                <v-divider></v-divider>
                
                <v-card-actions>
                  <v-btn text small color="primary" @click="editStudent(item)">
                    <v-icon left small>mdi-pencil</v-icon> Tahrirlash
                  </v-btn>
                  <v-spacer></v-spacer>
                  <v-btn text small color="error" @click="deleteStudent(item)">
                    <v-icon left small>mdi-delete</v-icon> O'chirish
                  </v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
          </v-row>
        </div>
        
        <!-- Table View Mode -->
        <v-data-table
          v-else
          :headers="headers"
          :items="filteredStudents"
          :items-per-page="10"
          class="elevation-0"
          :footer-props="{
            'items-per-page-options': [5, 10, 15, 20],
            'items-per-page-text': 'Sahifada:',
          }"
        >
          <!-- Index column -->
          <template v-slot:item.index="{ index }">
            <v-chip small color="primary" text-color="white" class="font-weight-medium">
              {{ index + 1 }}
            </v-chip>
          </template>
          
          <!-- Name column with first letter capitalized -->
          <template v-slot:item.name="{ item }">
            <span class="font-weight-medium">{{ item.name }}</span>
          </template>
  
          <!-- Teacher column -->
          <template v-slot:item.teacher="{ item }">
            <div class="d-flex align-center">
              <v-avatar size="30" color="primary" class="mr-2">
                <span class="white--text">{{ getInitials(item.teacher?.name) }}</span>
              </v-avatar>
              {{ item.teacher?.name }}
            </div>
          </template>
  
          <!-- Subject column -->
          <template v-slot:item.subject="{ item }">
            <v-chip small color="blue" text-color="white">
              {{ item.subject }}
            </v-chip>
          </template>
  
          <!-- Payment column -->
          <template v-slot:item.payment="{ item }">
            <span class="font-weight-bold">{{ formatCurrency(item.payment) }}</span>
          </template>
  
          <!-- Actions column -->
          <template v-slot:item.actions="{ item }">
            <div class="d-flex">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    fab
                    x-small
                    color="primary"
                    class="mr-2"
                    v-bind="attrs"
                    v-on="on"
                    @click="editStudent(item)"
                  >
                    <v-icon>mdi-pencil</v-icon>
                  </v-btn>
                </template>
                <span>Tahrirlash</span>
              </v-tooltip>
              
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    fab
                    x-small
                    color="error"
                    v-bind="attrs"
                    v-on="on"
                    @click="deleteStudent(item)"
                  >
                    <v-icon>mdi-delete</v-icon>
                  </v-btn>
                </template>
                <span>O'chirish</span>
              </v-tooltip>
            </div>
          </template>
  
          <!-- Empty state -->
          <template v-slot:no-data>
            <div class="pa-6 text-center empty-state">
              <v-icon size="64" color="grey lighten-2" class="mb-4">mdi-account-school</v-icon>
              <h3 class="text-subtitle-1 font-weight-medium grey--text">O'quvchilar topilmadi</h3>
              <v-btn color="primary" class="mt-3" @click="$emit('add-student')">
                O'quvchi qo'shish
              </v-btn>
            </div>
          </template>
        </v-data-table>
      </v-card>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      students: {
        type: Array,
        required: true
      },
      subjects: {
        type: Array,
        default: () => []
      },
      isAdmin: {
        type: Boolean,
        default: false
      },
      currentUser: {
        type: String,
        default: null
      }
    },
    data() {
      return {
        search: "",
        selectedSubject: null,
        viewMode: "table",
        headers: [
          { text: "№", value: "index", sortable: false, width: "70px" },
          { text: "Familya", value: "surname", class: "text-uppercase" },
          { text: "Ism", value: "name" },
          { text: "O'qituvchi", value: "teacher.name" },
          { text: "Fan", value: "subject" },
          { text: "Sana", value: "date" },
          { text: "Telefon", value: "phone" },
          { text: "To'lov", value: "payment" },
          { text: "Amallar", value: "actions", sortable: false, width: "120px" },
        ],
      };
    },
    computed: {
      filteredStudents() {
        let filtered = this.students;
        
        // Filter by search term
        if (this.search) {
          const searchLower = this.search.toLowerCase();
          filtered = filtered.filter(student => 
            student.name?.toLowerCase().includes(searchLower) || 
            student.surname?.toLowerCase().includes(searchLower)
          );
        }
        
        // Filter by subject
        if (this.selectedSubject) {
          filtered = filtered.filter(student => student.subject === this.selectedSubject);
        }
        
        // Filter by teacher if not admin
        if (!this.isAdmin && this.currentUser) {
          filtered = filtered.filter(student => 
            student.teacher && student.teacher.name === this.currentUser
          );
        }
        
        return filtered;
      }
    },
    methods: {
      // Get initials from name
      getInitials(name) {
        return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
      },
      
      // Format currency with thousand separators
      formatCurrency(value) {
        if (!value) return '0';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " so'm";
      },
      
      // Edit student event
      editStudent(student) {
        this.$emit('edit-student', student);
      },
      
      // Delete student event
      deleteStudent(student) {
        this.$emit('delete-student', student);
      }
    }
  };
  </script>
  
  <style scoped>
  .search-card {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e0e0e0;
    transition: all 0.3s ease;
  }
  .search-card:hover {
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1) !important;
  }
  
  .search-field .v-input__slot {
    border-radius: 8px !important;
  }
  
  .student-table-card {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e0e0e0;
  }
  
  .title-bar {
    background-color: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .student-card {
    border-radius: 12px;
    transition: all 0.3s ease;
    border: 1px solid #e0e0e0;
  }
  .student-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1) !important;
  }
  
  .card-title {
    background-color: #f5f7fa;
  }
  
  .empty-state {
    padding: 40px 0;
  }
  
  /* Data table styling */
  ::v-deep .v-data-table th {
    font-weight: bold !important;
    text-transform: uppercase;
    font-size: 0.8rem;
    color: #3f51b5;
    background-color: #f5f7fa;
  }
  
  ::v-deep .v-data-table tbody tr:hover {
    background-color: #f0f4ff;
  }
  
  ::v-deep .v-data-table tbody tr {
    transition: all 0.2s ease;
  }
  </style>