import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { Observable ,  throwError } from 'rxjs';

import { catchError } from 'rxjs/operators';
import { LocalStorageService } from 'ngx-localstorage';
import { EventService } from './event.service';


@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(public event:EventService,
    private http: HttpClient,public storage:LocalStorageService,
  ) {}

  private formatErrors(error: any) {
    return  throwError(error.error);
  }

  get(path: string, params: HttpParams = new HttpParams()): Observable<any> {
    return this.http.get(`${environment.api_url}${path}`, { params })
      .pipe(catchError(this.formatErrors));
  }

  put(path: string, body: Object = {}): Observable<any> {
    return this.http.put(
      `${environment.api_url}${path}`,
      JSON.stringify(body)
    ).pipe(catchError(this.formatErrors));
  }

  post(path: string, body: Object = {},headers_=null): Observable<any> {
    return this.http.post(
      `${environment.api_url}${path}`,
     (body),{headers:headers_}
    ).pipe(catchError(this.formatErrors));
  }

  delete(path): Observable<any> {
    return this.http.delete(
      `${environment.api_url}${path}`
    ).pipe(catchError(this.formatErrors));
  }

  registerUser(uname,pswd){
    console.log('registerUser:')
    console.log('uname:'+uname)
    console.log('pswd:'+pswd)
    let headers = new HttpHeaders();headers = headers.set('x-access-web-token', `${environment.key}`);
    return this.post('/user',{uname:uname,pswd:pswd},headers);
  }
  loginUser(uname,pswd){
    console.log('loginUser:')
    console.log('uname:'+uname)
    console.log('pswd:'+pswd)
    return this.post('/authenticate',{uname:uname,pswd:pswd});
  }
  populateData(index=null){
    let fieldArr=[{field:'',val:'',operator:'=='}]
    //let fieldArrByState=[{field:'',val:'',operator:'=='}]
    this.CovidData({fieldArr:[],fieldArrByState:[]}).subscribe(d=>{
      console.log('covid data populate:');
      console.log(d);
      //index
      d['index']=index;
      this.event.publish('chartPopulate',d);
    },err=>console.log(err));
  }

  CovidData(filter=null,covidData=null){//filter to get
    //covidData to post new
    // this.storage.set('userToken',d.token);
    let token=this.storage.get('userToken');
    let headers = new HttpHeaders();headers = headers.set('x-access-token', token?token:'');
    return this.post('/CovidData',(filter?{filter:filter}:{covidData:covidData}),headers
     );
  }

}
