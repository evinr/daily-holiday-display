var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var expressapp     = express();
var bodyParser = require('body-parser');
var moment = require('moment');
var poly = require('babel-polyfill');
var Firebase = require('firebase');

//Configuring middleware
expressapp.use(bodyParser())


expressapp.get('/', function(req, res){
    var file = fs.readFileSync('index.html','UTF-8');
    res.send(file);
})

expressapp.get('/data', function(req, res){
    var file = fs.readFileSync('output.json','UTF-8');
    res.send(file);
})

//Demo of Request to hit a URL
expressapp.get('/generate', function(req, res){
var dataRef = new Firebase('https://holidays.firebaseio.com/');
var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var a = moment('2016-04-01');
var b = moment('2016-04-05');
var allHolidays = {};

// pure function ;-)
var makeUrl = function(momentDate) {
    var date = momentDate.format('MM/DD/YYYY')
        return {
            url: "https://www.checkiday.com/" + date,
            date: date
        };
};

var makeRequestPromise = function(url, date) {
    return new Promise(function(resolve, reject) {
        request(url, function(error, response, html){
            if(error){
                return reject(error);     
            }

            var $ = cheerio.load(html);
            var name, description, conditional;
            var json = { name : "", description : "", image : "", conditional: false};
            var holidays = [];

            $('#middle_content').each(function(){
                var data = $(this);
                var total = data.children('2').children()._root['0'].children[4].next.children.length - 4;
                var parseMe = data.children('2').children()._root['0'].children[4].next.children;

                for (i =1; i <= total; i += 2) {
                    name = parseMe[i].children[1].children[1].attribs.title.toString();
                   // source = parseMe[i].children[1].children[1].attribs.href.toString();
                    console.log(name)
                    var nameRegex = /is\s(.*)!/g;
                    json.name = name.indexOf('!') > -1 ? nameRegex.exec(name)[1] : null;
                    //json.source = source;
                    holidays.push(json)
                    json = { name : "", description : "", image : "", conditional: false};
                }
                
            });
            //Setup the month
            var month = months[date.substring(0,2)-1]
            var day = date.substring(3,5)
            var dataToSync = {}
            dataToSync[month] = {}
            dataToSync[month][day] = holidays 
            dataRef.set(dataToSync);
                // var dataToWrite = JSON.stringify(allHolidays, null, 4);
                // fs.writeFileSync('output.json', dataToWrite, 'utf8');
              // finish promise
          resolve('File write successfull ' + url);
        });
    });
};

var promises = [];

for (var m = a; m.isBefore(b); m.add( 1, 'days')) {
    var mUrlObject = makeUrl(m)
    promises.push(
        makeRequestPromise( mUrlObject.url, mUrlObject.date )
    ); 
}

Promise.all(promises)
  .catch(function(err){ return console.error('Error in Promises.all()',err); })
  .then(function(msg) {
        // ^^ 'msg' param is an array of returned values
    console.log(msg); // array of resolve(msg) from above..
  });

    res.write('Output file is being generated for the year, should be ready within a few minutes :)');
    res.end();
})


//Sets up the listener for the express app
expressapp.listen('8081')

//Splash screen including the Node JS logo ascii art
console.log('................................................................................\n.....................................=====......................................\n..................................===========...................................\n...............................=================................................\n............................===========.===========.............................\n..........................==========.......==========...........................\n.......................===========...........===========........................\n....................===========.................===========.....................\n.................===========.......................===========..................\n...............==========.............................==========................\n............==========...................................==========.............\n.........===========.......................................===========..........\n.......==========.............................................==========........\n......========...................................................========.......\n......=====.........................................................=====.......\n......=====.........................................................=====.......\n......=====..............======........=================............=====.......\n......=====..............======......=====================..........=====.......\n......=====..............======....=========================........=====.......\n......=====..............======....======............=======........=====.......\n......=====..............======...======...............======.......=====.......\n......=====..............======...======................=====.......=====.......\n......=====..............======...========..........................=====.......\n......=====..............======....================.................=====.......\n......=====..............======.....======================..........=====.......\n......=====..............======........=====================........=====.......\n......=====..............======..............================.......=====.......\n......=====..............======........................=======......=====.......\n......=====..............======..======.................======......=====.......\n......=====..............======..======.................======......=====.......\n......=====..............======...======................======......=====.......\n......=====..............======...=========..........========.......=====.......\n......=====..............======.....========================........=====.......\n......=====..............======.......====================..........=====.......\n......=====..............======...........============..............=====.......\n......======.............======.....................................=====.......\n......========...........======..................................========.......\n.......==========........======...............................==========........\n.........===========...=======.............................===========..........\n............==================..........................===========.............\n...............==============.........................==========................\n..................========.........................==========...................\n................................................==========......................\n.............................=====...........===========........................\n...........................==========.....===========...........................\n.............................==========.==========..............................\n................................===============.................................\n...................................==========...................................\n.....................................=====......................................\n................................................................................\n');
console.log('          Node Holiday Data Scraper Started at localhost:8081');

exports = module.exports = expressapp;