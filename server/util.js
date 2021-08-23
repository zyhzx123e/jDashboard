



var express = require('express');
var config = require('./config.js');
var app = express();

module.exports = {

  pad:function (s) { return (s < 10) ? '0' + s : s; },
  monthYearMap:{'Jan':'01','Feb':'02','Mar':'03','Apr':'04','May':'05','Jun':'06','Jul':'07','Aug':'08','Sep':'09','Oct':'10','Nov':'11','Dec':'12'},
  getRandomColor:function () {//Jason added for generating random hex color code for chart
      var letters = '0123456789ABCDEF'.split('');
      var color = '#';
      for (var i = 0; i < 6; i++ ) {
          color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
  },


  getCurrentDeviceDateStr:function (dt=null){//"2020-04-30T00:00:00.000"
    let dRef=new Date();
    if(dt)dRef=new Date(dt);
    let yyyy=dRef.getFullYear();let MM=dRef.getMonth()+1;let dd=dRef.getDate();
    let HH=dRef.getHours();let mm=dRef.getMinutes(); let ss=dRef.getSeconds();
    return yyyy+'-'+module.exports.pad(MM)+'-'+module.exports.pad(dd)+'T00:00:00'
  },


  getCurrentDateTimeStr:function (){//"2020-04-30 21:01:00.000"
    let dRef=new Date();let yyyy=dRef.getFullYear();let MM=dRef.getMonth()+1;let dd=dRef.getDate();
    let HH=dRef.getHours();let mm=dRef.getMinutes(); let ss=dRef.getSeconds();
    return yyyy+'-'+module.exports.pad(MM)+'-'+module.exports.pad(dd)+' '+module.exports.pad(HH)+':'+module.exports.pad(mm)+':'+module.exports.pad(ss)+'.000'
  },

  convertDatetoDateTimeStr:function (dt){//"2020-04-30 21:01:00.000"
    let dRef=new Date(dt);let yyyy=dRef.getFullYear();let MM=dRef.getMonth()+1;let dd=dRef.getDate();
    let HH=dRef.getHours();let mm=dRef.getMinutes(); let ss=dRef.getSeconds();
    return yyyy+'-'+module.exports.pad(MM)+'-'+module.exports.pad(dd)+' '+module.exports.pad(HH)+':'+module.exports.pad(mm)+':'+module.exports.pad(ss)+'.000'
  },


  isValidDate:function (dt){
      if(!dt){
        return false
      }else{
        return !isNaN(dt.getTime());
      }
  },
  getDateFromInput:function  (dateString) {
    //1. Remove Z or z from the string. Z mean "Zulu timezone (no offset, aka UTC)"
    let datePart = dateString.replace(/[Zz]/g, '').split(/[\/ \-T.:]/g);

    // Note: months are 0-based, so we do datePart[1]-1 for month
    let dt= new Date(datePart[0], datePart[1]-1, datePart[2], (datePart[3] ? datePart[3] : 0), (datePart[4] ? datePart[4] : 0), (datePart[5] ? datePart[5] : 0), (datePart[6] ? datePart[6] : 0));
    if(!this.isValidDate(dt)){
    dt= new Date(dateString.replace('T',' '));
    if(!this.isValidDate(dt)){
    dt= new Date(dateString);
    }
    }
    return dt;
  },

  delayExc:function (t){return new Promise(function(resolve){setTimeout(_=>{resolve();},t)})},


  decrypt:function (encryptedText, key, iv) {
    let crypto = require('crypto');
    var alg = 'des-ede-cbc';

    var key = Buffer.from(key, 'utf-8');
    var iv = Buffer.from(iv);    //This is from c# cipher iv
    var encrypted = Buffer.from(encryptedText, 'base64');
    var decipher = crypto.createDecipheriv(alg, key, iv);
    var decoded = decipher.update(encrypted, 'binary', 'ascii');
    decoded += decipher.final('ascii');
    return decoded;
  },

  encrypt_pwd:function (pwd,obj) { //lif3i$g00d
    let key_=(obj.url).toString().substr(0, 16);
    let iv_=(obj.url + app.get('supersecret')).substr(0, 8);
    let key = Buffer.from(key_, 'utf-8');
    let iv = Buffer.from(iv_);
    let crypto = require('crypto');
    let alg = 'des-ede-cbc';

    var cipher = crypto.createCipheriv(alg, key, iv);
    var crypted = cipher.update(pwd, 'utf8', 'base64')
    crypted += cipher.final('base64')
    return crypted;//.toString('base64')

  },

  decrypt_pwd:function (encryptedText,obj) {
    let key_=(obj.url  ).toString().substr(0, 16);
    let iv_=(obj.url  +  app.get('supersecret')).substr(0, 8);

    console.log('decrypt_pwd key_: '+key_);
    console.log('decrypt_pwd iv_: '+iv_);
    let crypto = require('crypto');
    let alg = 'des-ede-cbc';

    let key = Buffer.from(key_, 'utf-8');
    let iv = Buffer.from(iv_);
    let encrypted = Buffer.from(encryptedText, 'base64');
    let decipher = crypto.createDecipheriv(alg, key, iv);
    let decoded = decipher.update(encrypted, 'binary', 'ascii');
      decoded += decipher.final('ascii');
    return decoded;
  }


};
