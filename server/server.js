var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');
var config = require('./config.js');
const { getCurrentDateTimeStr,getRandomColor,monthYearMap,getCurrentDeviceDateStr,pad,convertDatetoDateTimeStr,isValidDate,getDateFromInput,delayExc,decrypt,encrypt_pwd,decrypt_pwd } = require('./util.js');
var cors = require('cors');
var busboy = require('busboy');
var fs = require('fs');
var mkdirp = require('mkdirp');
var winston = require('winston');
var stream = require('stream');
var httpRequest = require('request');
var querystring = require('querystring');
var cron = require('node-cron');
const { json } = require('body-parser');
const admin = require('firebase-admin');
const serviceAccount = require('./jdashboard-cf8d2-fbcf96a690cb.json');
var crypto = require('crypto');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();


process.on('uncaughtException',function(err){logInfo(null, 'error', null, 'node process uncaughtException:');console.log(err);});


//Cache used to replace redis
var CACHE_DATA={};
function CACHE_DATA_EXP(key,t,value) {return new Promise(function(resolve) {//Jason - Customized cache
try{
let t_ms=t*1000;
CACHE_DATA[key]=[];//instantiate obj array
CACHE_DATA[key][0]=value;//[cache value]
CACHE_DATA[key][1]=Date.now();//[cache start time]// * used to compare with retrieving time, make sure the data not stale
CACHE_DATA[key][2]=t_ms;//[cache time out period]// logic : [retrieving time] <= [cache start time]+[cache time out period]
setTimeout(_=>{CACHE_DATA[key]=null;delete CACHE_DATA[key];logInfo(null, 'info', null, 'Cache '+key+' removed from cache');resolve();},t_ms);//wait for gc removing from memory
}catch(err){logInfo(null, 'error', null, 'Cache '+key+' err:');console.log(err)}
});}//expires in t seconds

var app = express();

// =======================
// configuration  ========
// =======================
var port = process.env.PORT || 8888; // used to create, sign, and verify tokens
//mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // set secret into variable from config

app.use(bodyParser.json({ limit: '50mb' }));
// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({limit:'50mb', extended: false}));
app.use(express.static('./public/'));//Jason added for redirecting kpi page

app.use(cors());//enable CORS

// API ROUTES -------------------
// get an instance of the router for api routes
var apiRoutes = express.Router();


//wildcard => key matching.
//isStartWith: true : match key which start with wilcards
//isStartWith: false : match key which contains the wilcards
function CACHE_REMOVE_KEY(wilcards,isStartWith){
	try{
let keys = Object.keys(CACHE_DATA).filter((node)=>{if(isStartWith){return node.startsWith(wilcards);}else{return node.includes(wilcards);}});
keys.forEach(item_key => {
logInfo(null, 'info', null, 'CACHE_DATA deleting key : '+item_key+'');
CACHE_DATA[item_key]=null;delete CACHE_DATA[item_key]; 	});
logInfo(null, 'info', null, 'All CACHE_DATA keys : ');console.log(Object.keys(CACHE_DATA));
	}catch(err){
		logInfo(null, 'error', null, 'Cache '+wilcards+' CACHE_REMOVE_KEY err:');console.log(err)
	}
}
function CACHE_CLEAR_ALL(){
let keys = Object.keys(CACHE_DATA);
keys.forEach(item_key => { CACHE_DATA[item_key]=null;delete CACHE_DATA[item_key];});
logInfo(null, 'info', null, 'Removed All CACHE_DATA keys : ');console.log(Object.keys(CACHE_DATA));
}


function cache_getMasterData(req, res, next) {// - Jason added middleware for getMasterData caching
	let key='getMasterData';
	if(CACHE_DATA && CACHE_DATA[key] && ( (CACHE_DATA[key][1] + CACHE_DATA[key][2]) >= Date.now()) ){
		let data_p=JSON.parse(CACHE_DATA[key][0]);
		logInfo(null, 'info', null, ' returned from cache getMasterData for key : '+key+'');
		res.json(data_p);
	}else{next();}
}

var MasterData
apiRoutes.get('/getMasterData',cache_getMasterData, function(req, res) {
	if (!MasterData) {
		res.status(500).send({status:2011, message: 'Refresh MasterData - Fail to refresh.', error:undefined});
	} else {
		let data_res={
			success: true,
			data: []
		};
		let key='getMasterData';
		CACHE_DATA_EXP(key,36000,JSON.stringify(data_res)); //expires in 10 hr
		res.json(data_res);
	}
});


function sha256_encrypt(txt,hex=null){//default base64
  return crypto.createHash('sha256').update(txt).digest(hex?'hex':'base64');
  /*
  hex: f330858c499d1c880b1dbd65c2657440ace3dc4e
  base64: 8zCFjEmdHIgLHb1lwmV0QKzj3E4=
  */
}

//do something when app is closing
process.on('exit',function(info){
	logInfo(null, 'info', null, 'node process exited:');console.log(info);
	shutAllActiveConn();
});



var uuidLog;
apiRoutes.get('/ping', async function(req, res) {
  uuidLog = undefined;
  // Validation: mandatory parameters checking
  if (!req.headers['x-access-token']){
		res.json({
			success: true,
			message: 'Server Alive'+getCurrentDateTimeStr()
		});
		logInfo(req, 'info', null, 'GET /ping');
    logInfo(req, 'info', null, 'GETping /entered');


    // const snapshot = await db.collection('CovidData')//.doc('user');


    // const queryRef = snapshot.where('activeCases', '==', 254484).get();
    // if (queryRef.empty) {
    //   logInfo(req, 'error', req.body.uname, 'get activeCases empty');

    // }else{
    //   logInfo(req, 'error', req.body.uname, 'get activeCases has data');

    // }

    // (await queryRef).docs.forEach(doc => {
    //   console.log(doc.id, '=>', doc.data());
    // });


  } else {
		res.json({
			success: true,
			message: 'Server Alive!'
		});
		logInfo(req, 'info', null, 'GET /ping!');
		logInfo(req, 'info', null, 'GET /get ping!');
	}
});

apiRoutes.post('/authenticate', async function(req, res) {
	uuidLog = undefined;

  if (!req.body.uname || !req.body.pswd){
		logInfo(req, 'error', req.body.uname, 'POST /authenticate - 2009. One of the request inputs is not valid or missing.');
		res.status(400).send({status:2009, message: 'Authentication - One of the request inputs is not valid or missing.', error:undefined});
    return
  }

	logInfo(req, 'info', req.body.uname, 'POST /authenticate');

	logInfo(req, 'info', req.body.uname, 'authenticate req.body: '+JSON.stringify(req.body));
  // Check user from database

  const snapshot = await db.collection('users')
  const queryRef = snapshot.where('uname', '==', req.body.uname)
  .where('pswd', '==', sha256_encrypt(req.body.pswd)).get();
  if ((await queryRef).empty) {
    logInfo(req, 'error', req.body.uname, 'POST /authenticate - User not found');
		res.status(403).send({status:4000, message: 'Authentication - Invalid Credential', error:undefined});
    return;
  }else{

    logInfo(req, 'info', req.body.uname, 'POST /authenticate - user exists');
    //generate jwt
    let token= jwt.sign({
      uname:req.body.uname,
      pswd:req.body.pswd
    }, app.get('superSecret'));
    res.status(200).send({status:200, message: 'success',token:token, error:undefined});
    return;

  }





});

// route middleware to verify jwt token
apiRoutes.use(function(req, res, next) {
	uuidLog = req.userName;
  var token = req.body.token || req.query.token || req.headers['x-access-token'] || (req.query['x-access-token']?req.query['x-access-token'].replace(/\"/g,''):req.query['x-access-token']);
  var token_web = req.body.web_token || req.query.web_token || req.headers['x-access-web-token'];
	console.log('get token:'+token);
	res.set({ 'content-type': 'application/json; charset=utf-8' });
	var requestData = {
			method: req.method,
			url: req.url,
			headers: req.headers,
			context: req.context,
			referrer: req.referrer,
			referrerPolicy: req.referrerPolicy,
			mode: req.mode,
			integrity: req.integrity,
			cache: req.cache,
			body: req.body,
			cookies: req.cookies,
			hostname: req.hostname,
			ip: req.ip,
			originalUrl: req.originalUrl,
			param: req.params,
			query: req.query,
			subdomains: req.subdomains
		};
		if(req.originalUrl){
			var uri = req.originalUrl.split("?").shift();
		}

		var newWS_log = {
			User_id: 0,
			Login_id: "",
			Task: uri,
			Device_time: "",
			App_version: "",
			Created_date: (new Date(Math.floor(Date.now()/10)*10 - ((new Date()).getTimezoneOffset() * 60000))),
			Platform: "",
			OS_version: "",
			Brand: "",
			Model: "",
			JSON_data: JSON.stringify(req.body),
			Method: req.method,
			Full_URL: req.protocol + '://' + req.get('host') + req.originalUrl,
			Post_data: requestData,
			Token: "",
			Status: "",
			Remark: ""
		};

		if(req.query)logInfo(req, 'info', req.userName, "jwt verify get req.query: "+JSON.stringify(req.query));

  // decode token
  if (token) {
    newWS_log.Token = token;
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        // loggerW.error("jwt verify error: "+JSON.stringify(err));
        logInfo(req, 'error', req.userName, "jwt verify error: "+JSON.stringify(err));
        newWS_log.Status = "Failed";
        newWS_log.Remark = "jwt verify error: "+err;
        res.json({ success: false, message: 'Failed to authenticate credential.' });
      }else {
        var logPromise = logData(decoded);
        logPromise.then(data=>{
          newWS_log.User_id = data.uname;
          newWS_log.Status = "In Progress";
          req.decoded = data.uname;
          logInfo(req, 'info', req.userName, "req.body: "+newWS_log.JSON_data);
          req.action = 1;
          next();
        }).catch(err =>{
          logInfo(req, 'error', req.userName, "apiRoute > else:"+JSON.stringify(err));
          res.status(400).send({status:5000, message: 'Error in generating logData', error:err});
        });
      }

    });

  } else {
    if(token_web && token_web==app.get('superSecret')){
      req.token_web=token_web;

	    logInfo(req, 'info', '', 'verify wekbtoken 1:'+JSON.stringify(req.body));
      next();
    }else{
      logInfo(req, 'info', '', 'verify wekbtoken:'+JSON.stringify(req.body));
      logInfo(req, 'error', req.userName, 'apiRoutes use - 403. Token not found');
      return res.status(403).send({
        success: false,
        message: 'Unknown request.'
      });
    }

  }


});

function logData(decoded) {
  //gets the data
  return new Promise(function (resolve, reject) {
		if(!decoded){
			// loggerW.error('logData - decoded not found');
			logInfo(null, 'error', decoded, 'logData - decoded not found');
			reject("function logData > decoded undefined");
		}
		var data;
		if(decoded.uname){
			data = {
        //uname:req.body.uname,
        //pswd:req.body.pswd
        uname: decoded.uname
			}
		}
    resolve(data);
  })
}


apiRoutes.post('/user', async function(req, res) {//register new user

  if (!req.token_web){
		logInfo(req, 'error', req.body.uname, 'POST /user - 4000. One of the request inputs is not valid or missing.');
		res.status(403).send({status:4000, message: 'user - One of the request inputs is not valid or missing.', error:undefined});
    return
  }

	logInfo(req, 'info', req.body.uname, 'POST /user');

	logInfo(req, 'info', req.body.uname, 'user req.body: '+JSON.stringify(req.body));
  // Check user from database

  const snapshot = await db.collection('users')//.doc('user');
  //const docRef = db.collection('users').doc('alovelace');

  // await docRef.set({
  //   first: 'Ada',
  //   last: 'Lovelace',
  //   born: 1815
  // });



  const queryRef = await snapshot.where('uname', '==', req.body.uname).limit(1).get();
  if(   queryRef && !queryRef.empty){
    logInfo(req, 'error', req.body.uname, 'POST /authenticate - Username "'+req.body.uname+'" exists');
    res.status(403).send({status:4001, message: 'Authentication - Username "'+req.body.uname+'" existed', error:undefined});
    return;
  }

  if (queryRef && queryRef.empty) {

    logInfo(req, 'error', req.body.uname, 'POST /authenticate - user['+req.body.uname+'] not found => can add this new user');
  }else{

  }

  const res_=await snapshot.doc(req.body.uname).set({
    uname:req.body.uname,
    pswd:sha256_encrypt(req.body.pswd)//one more layer hashing
  });
  // (await queryRef).docs.forEach(doc => {
  //   console.log(doc.id, '=>', doc.data());
  // });

  let token= jwt.sign({
    uname:req.body.uname,
    pswd:req.body.pswd
  }, app.get('superSecret'));

  if(res_){
    res.status(200).send({status:200, message: 'User "'+req.body.uname+'" created',token:token, error:undefined});
  }else res.status(201).send({status:201, message: 'User "'+req.body.uname+'" created - 201',token:token, error:undefined});



});


apiRoutes.get('/', function(req, res) {
	// loggerW.info('GET /');
	logInfo(req, 'info', req.userName, 'GET /');
  res.json({ message: 'Uh! Pen-Pineapple-Apple-Pen!' });
});


apiRoutes.post('/CovidData', async function(req, res) {
  if(!req.decoded){
    logInfo(req, 'error', null, 'POST /CovidData - 4000. param info is missing in the request parameters.');
    res.status(403).send({status:4000, message: '/CovidData - Access denied', error:undefined});
    return;
  }

  let data=req.body.CovidData;
  let dataState=req.body.CovidDataState;
  let filter=req.body.filter;

  if(filter){
    let field=filter['fieldArr'];
    let fieldArrByState=filter['fieldArrByState'];
    //fieldArrByState
    // let operator=filter['operator'];
    // let val=filter['val'];
    const snapshot = await db.collection('CovidData')//.doc('user');
    const snapshot_MYstate = await db.collection('CovidDataState')//.doc('user');

    let queryRef;
    let queryRef_ByState;
    let dArr=[];
    let dArrByState=[];

    //1.process covid data by timerange start
    if(field && field.length){
      let tempRef
      for(let f of field){
        if(tempRef){
          tempRef = tempRef.where(f['field'], f['operator'], f['val'])
        }else{
          tempRef = snapshot.where(f['field'], f['operator'], f['val'])
        }
      }
      queryRef=await tempRef.get();//where('activeCases', '==', 254484)
    }else{
      queryRef =await snapshot.get();
    }
    if (queryRef.empty) {
      logInfo(req, 'info', req.body.uname, 'get activeCases empty');

    }else{
      logInfo(req, 'info', req.body.uname, 'get activeCases has data');
    }

    (queryRef).docs.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
      let obj={id:doc.id,data:doc.data()}
      dArr.push(obj);
    });
    //1.process covid data by timerange end





     //2.process covid data by state start
     if(fieldArrByState && fieldArrByState.length){
      let tempRef
      for(let f of fieldArrByState){
        if(tempRef){
          tempRef = tempRef.where(f['field'], f['operator'], f['val'])
        }else{
          tempRef = snapshot_MYstate.where(f['field'], f['operator'], f['val'])
        }
      }
      queryRef_ByState=tempRef.get();//where('activeCases', '==', 254484)
    }else{
      queryRef_ByState = snapshot_MYstate.get();
    }
    if (queryRef_ByState.empty) {
      logInfo(req, 'error', req.body.uname, 'get activeCases by state empty');

    }else{
      logInfo(req, 'error', req.body.uname, 'get activeCases by state has data');
    }

    (await queryRef_ByState).docs.forEach(doc => {
      console.log(doc.id, '=>', doc.data());
      let obj={id:doc.id,data:doc.data()}
      dArrByState.push(obj);
    });
    //2.process covid data by state end




    let d_={fieldArr:dArr,fieldArrByState:dArrByState}




    res.status(200).send({status:200, message: 'success',data:d_, error:undefined});

  }else{
    let counter=0;
    /*
        {"covidData":[
        {
            "country": "Malaysia",
            "data": {"monthly":[{"key":"Mar2021","data":75316},{"key":"Apr2021","data":71000},
            {"key":"May2021","data":140514},{"key":"Jun2021","data":171509},{"key":"Jul2021","data":306509},
            {"key":"Aug2021","data":528827}],"daily":[21291,21993,19891,21479,21103,21019]}//last 6 days
        }
    ]}
    */
    logInfo(req, 'info', req.body.uname, 'covidData insert');


    if(data && data.length){
      logInfo(req, 'info', req.body.uname, 'covidData has data');
      for(let item of data){
        let key=item['country'];
        let d_=item['data'];
        const docRef = db.collection('CovidData').doc(key);
        let res=await docRef.set(d_);

        if(res){
          ++counter;
        }
      }
    }
    else if(dataState && dataState.length){
      logInfo(req, 'info', req.body.uname, 'dataState has data');
      for(let item of dataState){
        let key=item['country'];
        let d_=item['data'];
        const docRef = db.collection('CovidDataState').doc(key);
        let res=await docRef.set(d_);

        if(res){
          ++counter;
        }
      }
    }

    if(counter){
      res.status(200).send({status:200, message: counter+' records created', error:undefined});
    }else{
      res.status(200).send({status:200, message: 'no recorded are added', error:undefined});
    }
  }


});




//retailaimws1
var msg_deliver_task = cron.schedule('0 0 */1 * * *', function() {
  console.log('cron job hrly')
	//scheduled: accepts a boolean value. If set to false then the cron won't start automatically
}, {scheduled:true});
msg_deliver_task.start();


app.use('/api', apiRoutes);

app.listen(port, function () {
  logInfo(null, 'info', null, 'Service up and running at port ' + port);
});



function tsFormat(timezone) {
	var d = new Date();d.setMinutes(d.getMinutes() + timezone);
	return d.getFullYear() + "-" + (d.getMonth()+1) + "-" + d.getDate() + " " +d.getHours() + ":" + d.getMinutes();
}


function logInfo(req, level, userName,  msg) {
	var loggerW =  winston.createLogger({
		transports: [
		  // colorize the output to the console
		  new (winston.transports.Console)({
			colorize: true,
				  formatter: function(options) {
						  return options.message;
				  }
			  })
		]
	  });

    var curHost='';
	let fullUrl=curHost;
	try{
		fullUrl = req?(req.protocol + '://' + req.get('host') + req.originalUrl):curHost;
	}catch(err){
		console.log('loginfo err:'+err)
	}
	loggerW.log(level, fullUrl + '|' + tsFormat( 480) + '|' +  ( 'MY') + '|' + (userName ? userName + ' ' : '') + level.toUpperCase() + ' - ' + (msg ? msg : ''));
}
