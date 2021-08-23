
import { Component, OnInit, Input } from "@angular/core";
import { AppService } from "../../app.service";
import * as Highcharts from "highcharts";
import HC_exporting from "highcharts/modules/exporting";
import { EventService } from 'src/app/event.service';
import { Subscription } from 'rxjs';
HC_exporting(Highcharts);

@Component({
  selector: "js-stacked-area-chart",
  templateUrl: "./stacked-area-chart.component.html",
  styleUrls: ["./stacked-area-chart.component.scss"],
})
export class StackedAreaChartComponent implements OnInit {
  public Highcharts: typeof Highcharts = Highcharts; // required


  @Input() categories=["Mar2021", "Apr2021", "May2021", "Jun2021", "Jul2021", "Aug2021"];
  @Input() title="Covid data Malaysia";
  @Input() subtitle="Covid new cases";
  @Input() series=  [ {
        name: "cases",
        data: [502, 635, 809, 947, 1402, 3634],
      }];


  public chartOptions: any = {
    chart: {
      type: "line",
    },
    title: {
      text: this.title,
    },
    subtitle: {
      text: this.subtitle,
    },
    xAxis: {
      categories: this.categories,
      tickmarkPlacement: "on",
      title: {
        enabled: false,
      },
    },
    yAxis: {
      title: {
        text: "cases",
      },
      labels: {
        formatter: function () {
          return this.value / 1000+'k';
        },
      },
    },
    tooltip: {
      split: true,
      valueSuffix: " case(s)",
    },
    plotOptions: {
      area: {
        stacking: "normal",
        lineColor: "#666666",
        lineWidth: 1,
        marker: {
          lineWidth: 1,
          lineColor: "#666666",
        },
      },
    },
    credits: {
      enabled: false,
    },
    exporting: {
      enabled: true,
    }
    ,
    series: this.series

  }; // required

  rebindOption(){
    this.chartOptions={
      chart: {
        type: "line",
      },
      title: {
        text: this.title,
      },
      subtitle: {
        text: this.subtitle,
      },
      xAxis: {
        categories: this.categories,
        tickmarkPlacement: "on",
        title: {
          enabled: false,
        },
      },
      yAxis: {
        title: {
          text: "cases",
        },
        labels: {
          formatter: function () {
            return this.value / 1000+'k';
          },
        },
      },
      tooltip: {
        split: true,
        valueSuffix: " case(s)",
      },
      plotOptions: {
        area: {
          stacking: "normal",
          lineColor: "#666666",
          lineWidth: 1,
          marker: {
            lineWidth: 1,
            lineColor: "#666666",
          },
        },
      },
      credits: {
        enabled: false,
      },
      exporting: {
        enabled: true,
      }
      ,
      series: this.series
    };
  }

  constructor(private appService: AppService,public event:EventService) {
    this.resetListen();
    this.chartChangeSubscription=this.event.subscribe('chartPopulate',d=>{
      console.log(this.TAG+' chartPopulate event triggered')
      if(d){
        console.log(d);

        if(d.status=='200' && d.data && d.data['fieldArr'] && d.data['fieldArr'].length){
          //&& d['fieldArr']
          let filter=d['index'];//0=> monthly   |   1=>daily
          for(let item of d.data['fieldArr']){
            let id=item['id'];console.log('data from :'+id);
            let data=item['data'];
            if(filter==0){console.log('data filter by month');
              //by month
              let monthData=data['monthly']//array
              if(monthData && monthData.length){
                let keyArr=[];let dArr=[];
                for(let node of monthData){
                  keyArr.push(node['key']);
                  dArr.push(Number(node['data']));
                  // node['key']//string
                  // node['data']//number
                }
                this.categories=[...keyArr];
                this.series[0].data=[...dArr];
              }
            }else if(filter==1){console.log('data filter by day');
              //by day
              let dayData=data['daily']//array
              if(dayData && dayData.length){
                let keyArr=[];let dArr=[];
                let l=dayData.length;//6
                let d=new Date();d.setDate(d.getDate() - l);

                for(let i=0;i<l;++i ){
                  d.setDate(d.getDate() +i);
                  let dStr=this.appService.getCurrentDeviceDateTimeStr_withFormat('ddMMM',d);
                  //node => number
                  keyArr.push(dStr);
                  dArr.push(Number(dayData[i]));
                }
                this.categories=[...keyArr];
                this.series[0].data=[...dArr];
              }


            }
          }
          this.rebindOption();
          this.appService.triggerResizeEvent();
        }
      }
    })
  }

  ngOnInit(): void {
    this.appService.triggerResizeEvent();
  }
  chartChangeSubscription:Subscription;
  TAG='LINE-CHART'
  resetListen(){
    if(this.chartChangeSubscription){
      this.chartChangeSubscription.unsubscribe();this.chartChangeSubscription=null;
    }
  }
  ngOnDestroy(){
   this.resetListen();
  }
}
