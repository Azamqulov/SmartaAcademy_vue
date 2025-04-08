<template>
    <div>
      <v-chart class="chart" :option="chartOption" />
    </div>
  </template>
  
  <script>
  import { use } from "echarts/core";
  import { CanvasRenderer } from "echarts/renderers";
  import { LineChart } from "echarts/charts";
  import {
    TitleComponent,
    TooltipComponent,
    GridComponent,
    LegendComponent
  } from "echarts/components";
  import VChart from "vue-echarts";
  
  use([
    CanvasRenderer,
    LineChart,
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
      payments: {
        type: Array,
        required: true
      }
    },
    
    computed: {
      chartOption() {
        return {
          title: {
            text: "To'lovlar Statistikasi",
            left: "center"
          },
          tooltip: {
            trigger: "axis",
            formatter: "{b}: {c} ta"
          },
          xAxis: {
            type: "category",
            data: this.payments.map(item => item.month)
          },
          yAxis: {
            type: "value",
            minInterval: 1
          },
          series: [
            {
              data: this.payments.map(item => item.value),
              type: "line",
              smooth: true,
              symbolSize: 8,
              lineStyle: {
                width: 3,
                color: "#4caf50"
              },
              itemStyle: {
                color: "#4caf50"
              },
              areaStyle: {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0,
                      color: "rgba(76, 175, 80, 0.5)"
                    },
                    {
                      offset: 1,
                      color: "rgba(76, 175, 80, 0.1)"
                    }
                  ]
                }
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