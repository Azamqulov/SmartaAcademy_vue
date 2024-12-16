// Komponentda Firestore'dan ma'lumot olish
import { db } from "@/firebaseConfig";

export default {
  data() {
    return {
      students: [],
    };
  },
  methods: {
    async fetchStudents() {
      try {
        const snapshot = await db.collection("students").get();
        this.students = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    },
  },
  mounted() {
    this.fetchStudents();
  },
};
