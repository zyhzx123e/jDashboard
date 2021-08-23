
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import { EventService } from 'src/app/event.service';
import { Subscription } from 'rxjs';
import { AppService } from 'src/app/app.service';

export interface CovidData {
  No: number;
  name: string;
  cases: number;
}


@Component({
  selector: "js-table",
  templateUrl: "./table.component.html",
  styleUrls: ["./table.component.scss"],
})
export class TableComponent implements OnInit {

  ELEMENT_DATA: CovidData[] = [
    { No: 1, name: "Selangor",  cases: 8000 },
    { No: 2, name: "KL",  cases: 3000 },
    { No: 3, name: "Penang",   cases: 2000 },
    { No: 4, name: "Sabah",  cases: 1800 },
    { No: 5, name: "Sarawak",   cases: 1200 },
    { No: 6, name: "Perak",  cases: 1000 },
  ];
  displayedColumns: string[] = ["No", "name",  "cases"];
  dataSource = new MatTableDataSource<CovidData>(this.ELEMENT_DATA);

  constructor(public event:EventService,public util:AppService){

  }

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
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

              if(monthData && monthData.length){
                let keyArr=[];
                for(let i=0,l=monthData.length;i<l;++i){
                  let obj={name:monthData[i]['key'],cases:Number(monthData[i]['data']) };
                  keyArr.push(obj);
                }
                keyArr=this.util.filterArraySequence(keyArr,false,'cases');

                let finalArr=[]
                for(let i=0,l=keyArr.length;i<l;++i){
                  let obj_={} as CovidData;
                  obj_.No=(1+i);
                  obj_.name=keyArr[i]['name'];
                  obj_.cases=keyArr[i]['cases'];
                  finalArr.push(obj_);
                }

                this.ELEMENT_DATA=JSON.parse(JSON.stringify(finalArr));


              }
            }else if(filter==1){console.log('data filter by day');
              //by day
              let dayData=data['daily']//array

              if(dayData && dayData.length){
                let keyArr=[];
                for(let i=0,l=dayData.length;i<l;++i){
                  let obj={name:dayData[i]['key'],cases:Number(dayData[i]['data']) };
                  keyArr.push(obj);
                }
                keyArr=this.util.filterArraySequence(keyArr,false,'cases');

                let finalArr=[]
                for(let i=0,l=keyArr.length;i<l;++i){
                  let obj_={} as CovidData;
                  obj_.No=(1+i);
                  obj_.name=keyArr[i]['name'];
                  obj_.cases=keyArr[i]['cases'];
                  finalArr.push(obj_);
                }

                this.ELEMENT_DATA=JSON.parse(JSON.stringify(finalArr));


              }


            }
          }
          this.dataSource.paginator = this.paginator;
          this.dataSource = new MatTableDataSource<CovidData>(this.ELEMENT_DATA);
        }

        // this.dataSource.paginator = this.paginator;
        //  dataSource = new MatTableDataSource<PeriodicElement>(this.ELEMENT_DATA);
      }
    })
  }
  chartChangeSubscription:Subscription;
  TAG='TABLE'
  resetListen(){
    if(this.chartChangeSubscription){
      this.chartChangeSubscription.unsubscribe();this.chartChangeSubscription=null;
    }
  }
  ngOnDestroy(){
   this.resetListen();
  }
}
