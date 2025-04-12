<template>
  <div class="error-page">
    <div class="stars-container">
      <div v-for="n in 50" :key="n" class="star" :style="getRandomStarStyle()"></div>
    </div>
    
    <div class="error-content">
      <div class="error-animation">
        <div class="book">
          <div class="book-page"></div>
          <div class="book-page"></div>
          <div class="book-page"></div>
        </div>
        <div class="error-number">404</div>
        <div class="pencils">
          <div class="pencil pencil-1"></div>
          <div class="pencil pencil-2"></div>
          <div class="pencil pencil-3"></div>
        </div>
      </div>

      <h2 class="error-message">Sahifa topilmadi!</h2>
      <p class="error-description">Siz qidirayotgan sahifa mavjud emas yoki o'chirilgan bo'lishi mumkin.</p>
      
      <v-btn @click="goBack" class="mt-6 error-button" elevation="8" x-large>
        <v-icon left>mdi-arrow-left</v-icon>
        Orqaga qaytish
      </v-btn>
    </div>

    <div class="paper-plane" ref="paperPlane">
      <div class="plane-body"></div>
      <div class="plane-wing"></div>
    </div>

    <div class="bottom-wave"></div>
  </div>
</template>

<script>
export default {
  name: "Error404Page",
  data() {
    return {
      planePosition: { x: 0, y: 0 },
      mousePosition: { x: 0, y: 0 },
      isAnimating: false
    };
  },
  mounted() {
    this.animateElements();
    window.addEventListener("mousemove", this.trackMouse);
    this.animatePlane();
  },
  beforeDestroy() {
    window.removeEventListener("mousemove", this.trackMouse);
  },
  methods: {
    goBack() {
      this.$router.back();
    },
    getRandomStarStyle() {
      const size = Math.random() * 4 + 1;
      const posX = Math.random() * 100;
      const posY = Math.random() * 100;
      const animationDuration = Math.random() * 3 + 2;
      const delay = Math.random() * 3;

      return {
        width: `${size}px`,
        height: `${size}px`,
        top: `${posY}%`,
        left: `${posX}%`,
        animationDuration: `${animationDuration}s`,
        animationDelay: `${delay}s`
      };
    },
    trackMouse(e) {
      this.mousePosition.x = e.clientX;
      this.mousePosition.y = e.clientY;
    },
    animatePlane() {
      setInterval(() => {
        if (this.$refs.paperPlane) {
          const dx = (this.mousePosition.x - this.planePosition.x) / 20;
          const dy = (this.mousePosition.y - this.planePosition.y) / 20;
          
          this.planePosition.x += dx;
          this.planePosition.y += dy;
          
          const angle = Math.atan2(dy, dx) * 180 / Math.PI;
          
          this.$refs.paperPlane.style.transform = `translate(${this.planePosition.x}px, ${this.planePosition.y}px) rotate(${angle}deg)`;
        }
      }, 50);
    },
    animateElements() {
      // Using DOM manipulation for animations since we can't use direct GSAP imports in this example
      // In a real project, you would import and use GSAP properly
      setTimeout(() => {
        const errorNumber = document.querySelector('.error-number');
        if (errorNumber) {
          errorNumber.style.opacity = 1;
          errorNumber.style.transform = 'translateY(0)';
        }

        const book = document.querySelector('.book');
        if (book) {
          book.style.opacity = 1;
          book.style.transform = 'rotate(0deg)';
        }

        const pencils = document.querySelectorAll('.pencil');
        pencils.forEach((pencil, index) => {
          setTimeout(() => {
            pencil.style.opacity = 1;
            pencil.style.transform = 'translateY(0) rotate(0deg)';
          }, 300 * (index + 1));
        });

        const errorMessage = document.querySelector('.error-message');
        if (errorMessage) {
          setTimeout(() => {
            errorMessage.style.opacity = 1;
            errorMessage.style.transform = 'translateY(0)';
          }, 600);
        }

        const errorDescription = document.querySelector('.error-description');
        if (errorDescription) {
          setTimeout(() => {
            errorDescription.style.opacity = 1;
            errorDescription.style.transform = 'translateY(0)';
          }, 800);
        }

        const errorButton = document.querySelector('.error-button');
        if (errorButton) {
          setTimeout(() => {
            errorButton.style.opacity = 1;
            errorButton.style.transform = 'translateY(0) scale(1)';
          }, 1000);
        }
      }, 500);
    }
  }
};
</script>

<style scoped>
.error-page {
  position: relative;
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #07483d 0%, #2b0518 100%);
  overflow: hidden;
  font-family: 'Montserrat', sans-serif;
}

.stars-container {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0;
}

.star {
  position: absolute;
  background-color: #fff;
  border-radius: 50%;
  animation: twinkle linear infinite;
}

@keyframes twinkle {
  0% { opacity: 0.2; }
  50% { opacity: 1; }
  100% { opacity: 0.2; }
}

.error-content {
  position: relative;
  z-index: 2;
  text-align: center;
  color: white;
  max-width: 600px;
  padding: 2rem;
}

.error-animation {
  position: relative;
  height: 200px;
  margin-bottom: 30px;
}

.error-number {
  font-size: 120px;
  font-weight: 900;
  color: white;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.5), 
               0 0 40px rgba(255, 0, 128, 0.5),
               0 0 60px rgba(255, 0, 128, 0.3);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, 50px);
  opacity: 0;
  transition: all 1s ease;
}

.error-message {
  font-size: 32px;
  margin-bottom: 15px;
  transform: translateY(20px);
  opacity: 0;
  transition: all 0.8s ease;
}

.error-description {
  font-size: 18px;
  margin-bottom: 30px;
  transform: translateY(20px);
  opacity: 0;
  transition: all 0.8s ease;
}

.error-button {
  background: linear-gradient(45deg, #ff6b6b, #ff0080) !important;
  color: white !important;
  font-weight: bold !important;
  padding: 12px 30px !important;
  border-radius: 50px !important;
  transform: translateY(20px) scale(0.9);
  opacity: 0;
  transition: all 0.8s ease, box-shadow 0.3s ease, transform 0.3s ease !important;
}

.error-button:hover {
  box-shadow: 0 8px 25px rgba(255, 0, 128, 0.6) !important;
  transform: translateY(-3px) scale(1) !important;
}

.book {
  position: absolute;
  width: 80px;
  height: 100px;
  background: #ff9f43;
  border-radius: 5px 15px 15px 5px;
  top: 50%;
  left: 30%;
  transform: translate(-50%, -50%) rotate(-30deg);
  box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.3);
  transform-origin: center;
  opacity: 0;
  transition: all 1.2s cubic-bezier(0.68, -0.55, 0.27, 1.55);
  z-index: 1;
}

.book-page {
  position: absolute;
  width: 70px;
  height: 90px;
  background: white;
  top: 5px;
  left: 5px;
  border-radius: 3px 10px 10px 3px;
}

.book-page:nth-child(2) {
  width: 68px;
  height: 88px;
  top: 6px;
  left: 6px;
  background: #f1f1f1;
}

.book-page:nth-child(3) {
  width: 66px;
  height: 86px;
  top: 7px;
  left: 7px;
  background: #e8e8e8;
}

.pencils {
  position: absolute;
  width: 100%;
  height: 100%;
}

.pencil {
  position: absolute;
  width: 10px;
  height: 120px;
  background: linear-gradient(to bottom, #ffbe76, #f9ca24 20%, #f6e58d 30%);
  border-radius: 5px;
  z-index: 0;
  opacity: 0;
  transition: all 1s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.pencil::after {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 15px solid #e74c3c;
  bottom: -10px;
  left: 0;
  transform: rotate(180deg);
}

.pencil-1 {
  top: 50%;
  right: 25%;
  transform: translateY(50px) rotate(20deg);
}

.pencil-2 {
  top: 40%;
  right: 35%;
  transform: translateY(80px) rotate(-15deg);
}

.pencil-3 {
  top: 60%;
  right: 15%;
  transform: translateY(60px) rotate(45deg);
}

.paper-plane {
  position: absolute;
  width: 50px;
  height: 30px;
  z-index: 3;
  transition: transform 0.3s ease;
}

.plane-body {
  position: absolute;
  width: 50px;
  height: 10px;
  background: white;
  transform: skew(-20deg, 0deg);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.plane-wing {
  position: absolute;
  width: 30px;
  height: 30px;
  background: white;
  transform: rotate(45deg);
  top: -15px;
  left: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.bottom-wave {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 120px;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='0.2' d='M0,160L48,170.7C96,181,192,203,288,208C384,213,480,203,576,186.7C672,171,768,149,864,144C960,139,1056,149,1152,144C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E") no-repeat;
  background-size: cover;
}

/* Mobile responsive styling */
@media (max-width: 768px) {
  .error-number {
    font-size: 90px;
  }
  
  .error-message {
    font-size: 24px;
  }
  
  .error-description {
    font-size: 16px;
  }
  
  .book {
    left: 25%;
    width: 60px;
    height: 80px;
  }
  
  .pencil {
    height: 90px;
  }
}
</style>