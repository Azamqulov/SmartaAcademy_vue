<template>
    <div>
      <v-chart class="chart" :option="chartOption" />
    </div>
  </template>
  
  <script>
  import { use } from "echarts/core";
  import { CanvasRenderer } from "echarts/renderers";
  import { PieChart } from "echarts/charts";
  import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent
  } from "echarts/components";
  import VChart from "vue-echarts";
  
  use([
    CanvasRenderer,
    PieChart,
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
      passedData: {
        type: Array,
        required: true
      }
    },
    
    computed: {
      chartOption() {
        return {
          title: {
            text: "O'tganlar Statistikasi",
            left: "center"
          },
          tooltip: {
            trigger: "item",
            formatter: "{b}: {c} ta ({d}%)"
          },
          legend: {
            orient: "vertical",
            left: "left",
            data: this.passedData.map(item => item.category)
          },
          series: [
            {
              type: "pie",
              radius: ["40%", "70%"],
              avoidLabelOverlap: false,
              itemStyle: {
                borderRadius: 10,
                borderColor: "#fff",
                borderWidth: 2
              },
              label: {
                show: true,
                formatter: "{b}: {c} ta"
              },
              emphasis: {
                label: {
                  show: true,
                  fontSize: 16,
                  fontWeight: "bold"
                }
              },
              labelLine: {
                show: true
              },
              data: this.passedData.map(item => ({
                value: item.value,
                name: item.category,
                itemStyle: {
                  color: item.category === "O'tganlar" ? "#2196f3" : "#ff9800"
                }
              }))
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