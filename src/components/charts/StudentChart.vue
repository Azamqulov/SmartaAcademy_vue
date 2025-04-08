<template>
    <div>
      <v-chart class="chart" :option="chartOption" />
    </div>
  </template>
  
  <script>
  import { use } from "echarts/core";
  import { CanvasRenderer } from "echarts/renderers";
  import { BarChart } from "echarts/charts";
  import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent
  } from "echarts/components";
  import VChart from "vue-echarts";
  
  use([
    CanvasRenderer,
    BarChart,
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent
  ]);
  
  export default {
    components: {
      VChart
    },
    
    props: {
      students: {
        type: Array,
        required: true
      }
    },
    
    computed: {
      // Generate data for visualization
      chartData() {
        const currentDate = new Date();
        const monthsData = Array(12).fill(0);
        
        this.students.forEach(student => {
          if (student.joinedDate) {
            const joinedDate = new Date(student.joinedDate);
            // Count only students from current year
            if (joinedDate.getFullYear() === currentDate.getFullYear()) {
              const month = joinedDate.getMonth();
              monthsData[month]++;
            }
          }
        });
        
        return monthsData;
      },
      
      chartOption() {
        const months = [
          "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
          "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
        ];
        
        return {
          title: {
            text: "O'quvchilar qo'shilishi",
            subtext: `Jami: ${this.students.length} ta`,
            left: "center"
          },
          tooltip: {
            trigger: "axis",
            formatter: "{b}: {c} ta o'quvchi"
          },
          xAxis: {
            type: "category",
            data: months
          },
          yAxis: {
            type: "value",
            minInterval: 1
          },
          series: [
            {
              data: this.chartData,
              type: "bar",
              itemStyle: {
                color: "#3f51b5"
              },
              emphasis: {
                itemStyle: {
                  color: "#1a237e"
                }
              },
              label: {
                show: true,
                position: "top"
              }
            }
          ]
        };
      }
    }
  };
  </script>
  
  <style scoped>
  .chart {
    height: 400px;
    width: 100%;
  }
  </style>