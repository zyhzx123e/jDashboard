
import { Injectable } from "@angular/core";
import * as JsHashes  from 'jshashes';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AlertDialogComponent } from './components/alert-dialog/alert-dialog.component';
import { ConfirmationDialog } from './components/confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: "root",
})
export class AppService {
  constructor(private dialog: MatDialog,
    private snackBar: MatSnackBar) {}

  public triggerResizeEvent(): void {
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 300);
  }
  delayExc(t):Promise<any>{return new Promise(function(resolve){setTimeout(_=>{resolve();},t)})}
  filterArraySequence(array:Array<any>,isAsc,filterAttribute,isDate?){
    let arr_=array;
      arr_=array.sort(function(a, b) {
        var textA = isDate?Date.parse(a[filterAttribute]):((typeof a[filterAttribute]=='number')?a[filterAttribute]:a[filterAttribute].toString().toUpperCase());
        var textB = isDate?Date.parse(b[filterAttribute]):((typeof b[filterAttribute]=='number')?b[filterAttribute]:b[filterAttribute].toString().toUpperCase());
        if(isAsc){
          return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        }else{
          return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
        }
    });
    return arr_;
  }
  getTime(): Date{

    return this.addTenantTZ(this.getNewDateTime(), Math.abs(new Date().getTimezoneOffset()));
  }
  addTenantTZ(d: Date, tz: number): Date {
    return new Date(d.getTime() + (tz * 60000));
  }
  getNewDateTime(): Date {
    //Take current date minus off current timezone to get UTC time
    let now = new Date();
    now = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());
    return this.addTenantTZ(now, 480);
  }

  /***
   * Coupled with getTime() above to format date to string
   ***/
  getDateString(): string {
    return this.getTime().toISOString();
  }

  WeekArray=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
  MonthArray=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  pad(s) { return (s < 10) ? '0' + s : s; }
  padNum(s,num) {
    let pad='';
    if(s<num){
      for(let i=1;i<(num.toString().length-s.toString().length);++i){
       pad+='0';
      }
    }
    return pad+ s;
   }

  getCurrentDeviceDateTimeStr_withFormat(format:string,dt?){//"2020-04-30 21:01:00"
  let dRef=new Date();//yyyy-MM-dd_HHmmss
  if(dt){
    dRef=new Date(dt);//dt: milliseconds
  }
  let yyyy=dRef.getFullYear();let MM=dRef.getMonth()+1;let dd=dRef.getDate();
  let HH=dRef.getHours();let mm=dRef.getMinutes();
  let ss=dRef.getSeconds(); let ms=dRef.getMilliseconds();
  if(format.includes('MMM')){
    let format_=format.replace('yyyy',this.pad(yyyy).toString()).replace('YY',yyyy.toString().substr(yyyy.toString().length-2))
    .replace('MMM',this.MonthArray[dRef.getMonth()])
    .replace('dd',this.pad(dd).toString()).replace('HH',this.pad(HH).toString()).replace('mm',this.pad(mm).toString()).replace('ss',this.pad(ss).toString()).replace('ms',this.padNum(ms,1000).toString());

    return format_;
  }else{//yyyyMMddHHmmssms
    let format_=format.replace('yyyy',this.pad(yyyy).toString()).replace('YY',yyyy.toString().substr(yyyy.toString().length-2))
    .replace('MM',this.pad(MM).toString()).replace('dd',this.pad(dd).toString()).replace('HH',this.pad(HH).toString()).replace('mm',this.pad(mm).toString()).replace('ss',this.pad(ss).toString()).replace('ms',this.padNum(ms,1000).toString());
      return format_;
  }

}


 sha256_encrypt(txt,hex=null){//default base64
  const hash =  new JsHashes.SHA256;
  return hex?hash.hex(txt):hash.b64(txt);
    //return createHash('sha256').update(txt).digest(hex?'hex':'base64');
    /*
    hex: f330858c499d1c880b1dbd65c2657440ace3dc4e
    base64: 8zCFjEmdHIgLHb1lwmV0QKzj3E4=
    */
  }

  openAlertDialog(title='',btnTxt='OK') {
    const dialogRef = this.dialog.open(AlertDialogComponent,{
      data:{
        message: title?title:'Note',
        buttonText: {
          cancel: btnTxt
        }
      },
    });
  }


  openConfirmDialog(title='Note',oktxt='Ok',canceltxt='No',onclickConfirm) {
    const dialogRef = this.dialog.open(ConfirmationDialog,{
      data:{
        message: title,
        buttonText: {
          ok: oktxt,
          cancel: canceltxt
        }
      }
    });
    //const snack = this.snackBar.open('Snack bar open before dialog');

    if(!onclickConfirm){
      onclickConfirm=(confirmed)=>{
        if (confirmed) {
          //snack.dismiss();
          const a = document.createElement('a');
          a.click();
          a.remove();
          // snack.dismiss();
          // this.snackBar.open('Closing snack bar in a few seconds', 'Fechar', {
          //   duration: 2000,
          // });
        }
      }
    }

    dialogRef.afterClosed().subscribe((confirmed: boolean) => onclickConfirm);
  }


}
