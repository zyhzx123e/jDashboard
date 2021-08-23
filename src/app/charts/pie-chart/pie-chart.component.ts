
import { Component, OnInit, Input } from "@angular/core";
import { AppService } from "../../app.service";
import * as Highcharts from "highcharts";
import HC_exporting from "highcharts/modules/exporting";
import { Subscription } from 'rxjs';
import { EventService } from 'src/app/event.service';
HC_exporting(Highcharts);

@Component({
  selector: "js-pie-chart",
  templateUrl: "./pie-chart.component.html",
  styleUrls: ["./pie-chart.component.scss"],
})
export class PieChartComponent implements OnInit {
  public Highcharts: typeof Highcharts = Highcharts;


  @Input() data= [
    {
      name: "Perak",
      y: 10
    },
    {
      name: "Sarawak",
      y: 10
    },
    {
      name: "Sabah",
      y: 15
    },
    {
      name: "Penang",
      y: 10
    },
    {
      name: "Selangor",
      y: 40
    },
    {
      name: "KL",
      y: 15,
      sliced: true,
      selected: true
    }
  ]
  @Input() title="Covid data Malaysia by state";
  @Input() subtitle="Covid new cases";
  @Input() seriesName='State';

  public chartOptions: any = {
    chart: {
      plotBackgroundColor: null,
      plotBorderWidth: null,
      plotShadow: false,
      type: "pie",
    },
    title: {
      text: this.title,
    },
    tooltip: {
      pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
    },
    credits: {
      enabled: false,
    },
    accessibility: {
      point: {
        valueSuffix: "%",
      },
    },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: "pointer",
        dataLabels: {
          enabled: true,
          format: "<b>{point.name}</b>: {point.percentage:.1f} %",
        },
      },
    },
    series: [
      {
        name: this.seriesName,
        colorByPoint: true,
        data:this.data

      },
    ],
  }; // required

  rebindOption(){
    this.chartOptions={
      chart: {
        plotBackgroundColor: null,
        plotBorderWidth: null,
        plotShadow: false,
        type: "pie",
      },
      title: {
        text: this.title,
      },
      tooltip: {
        pointFormat: "{series.name}: <b>{point.percentage:.1f}%</b>",
      },
      credits: {
        enabled: false,
      },
      accessibility: {
        point: {
          valueSuffix: "%",
        },
      },
      plotOptions: {
        pie: {
          allowPointSelect: true,
          cursor: "pointer",
          dataLabels: {
            enabled: true,
            format: "<b>{point.name}</b>: {point.percentage:.1f} %",
          },
        },
      },
      series: [
        {
          name: this.seriesName,
          colorByPoint: true,
          data:this.data

        },
      ],
    };
  }
  constructor(private appService: AppService,public event:EventService) {
    this.resetListen();
    this.chartChangeSubscription=this.event.subscribe('chartPopulate',d=>{
      console.log(this.TAG+' chartPopulate event triggered')
      if(d){
        console.log(d)
        if(d.status=='200' && d.data && d.data['fieldArrByState'] && d.data['fieldArrByState'].length){
          //&& d['fieldArr']
          let filter=d['index'];//0=> monthly   |   1=>daily
          for(let item of d.data['fieldArrByState']){
            let id=item['id'];console.log('data from :'+id);
            let data=item['data'];


            if(filter==0){console.log('data filter by month');
              //by month
              let monthData=data['monthly']//array
              let sum=monthData.reduce((a, b) => a + (b['data'] || 0), 0);
              console.log('data filter by month sum'+sum);

              if(monthData && monthData.length){
                console.log('data filter by month monthData:'+monthData.length);
                let keyArr=[];
                for(let i=0,l=monthData.length;i<l;++i){

                  let obj={name:monthData[i]['key'],y:Number((Number(monthData[i]['data']/sum)).toFixed(2)) };

                  if(i==(monthData.length-1)){
                    obj['sliced']=true;
                    obj['selected']=true;
                  }
                  keyArr.push(obj);
                  //Number(node['data'])
                }
                this.data=JSON.parse(JSON.stringify(keyArr));


              }
            }else if(filter==1){console.log('data filter by day');
              //by day
              let dayData=data['daily']//array
              if(dayData && dayData.length){
                let keyArr=[];let dArr=[];
                let l=dayData.length;//6
                let d=new Date();d.setDate(d.getDate() - l);
                let sum=dayData.reduce((a, b) => a + (b['data'] || 0), 0);

                for(let i=0,l=dayData.length;i<l;++i){

                  let obj={name:dayData[i]['key'],y:Number((Number(dayData[i]['data']/sum)).toFixed(2)) };

                  if(i==(dayData.length-1)){
                    obj['sliced']=true;
                    obj['selected']=true;
                  }
                  keyArr.push(obj);
                  //Number(node['data'])
                }
                this.data=JSON.parse(JSON.stringify(keyArr));
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
  TAG='PIE-CHART'
  resetListen(){
    if(this.chartChangeSubscription){
      this.chartChangeSubscription.unsubscribe();this.chartChangeSubscription=null;
    }
  }
  ngOnDestroy(){
   this.resetListen();
  }

}
