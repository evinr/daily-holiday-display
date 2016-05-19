var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var expressapp     = express();
var bodyParser = require('body-parser');
var moment = require('moment');
var poly = require('babel-polyfill');
var Firebase = require('firebase');
var base64Img = require('base64-img');
// var casper = require('./node_modules/casperjs').create();

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

expressapp.get('/image', function(req, res){
    var makeRequestPromise = function(url) {
        return new Promise(function(resolve, reject) {
            request(url, function(error, response, html){
                if(error){
                    return reject(error);     
                }

                var $ = cheerio.load(html);
                var data;
                var url;
                var preprocessedImageLocation;
                var image;
                var thumbnailUrl;
                var ratio;
                //  vvv this is the code block where all of the images begin
                $('#ires').each(function(){
                    data = $(this);
                    //data.children('2').children()._root['0'].children[0].children; // all of the rows of images
                    // the list above could be used to scrap all of the possible results
                    // then save them and allow for a slider-type selector when editing the cards
                    url = data.children('2').children()._root['0'].children[0].children[0].children[0].children[0].attribs.href;
                    thumbnailUrl = data.children('2').children()._root['0'].children[0].children[0].children[0].children[0].children[0].attribs.src;
                    var height = data.children('2').children()._root['0'].children[0].children[0].children[0].children[0].children[0].attribs.height;
                    var width = data.children('2').children()._root['0'].children[0].children[0].children[0].children[0].children[0].attribs.width;
                    ratio = height / width; // need to determine what is an optimal range for this


                    url = encodeURIComponent(url.split('q=')[1].split('&sa=')[0]);
                    preprocessedImageLocation = 'https://www.google.com/imgres?imgrefurl=' + url + '&docid=MDVYRDoBVoAF8M&tbnid=qdCOD0oG-v-WJM%3A';
                    console.log(preprocessedImageLocation)
                    // casper.start(preprocessedImageLocation, function () {
                    //     this.capture('./output/screenshot.png');
                    // })
                    // casper.run();
                    // save thumbnailUrl and preprocessedImageLocation to something that can be passed to casper
                    // casper: ^^ base64 that,  ^^ get the actual resource and base64 it, 
                    // save ratio to firebase
                     
                });

            resolve('visited and generated');
            });
        });
    };

    var promises = [];
    var url = 'https://www.google.com/search?q=Peace+Officers+Memorial+Day&client=ubuntu&hs=iOs&source=lnms&tbm=isch&sa=X&ved=0ahUKEwj_9oydwtvMAhVKzmMKHfmyBNwQ_AUIBygB&biw=1463&bih=908#tbm=isch&q=Peace+Officers+memorial&imgrc=hXTHR00uxNbKyM%3A'

        promises.push(
            makeRequestPromise( url )
        ); 

    Promise.all(promises)
      .catch(function(err){ return console.error('Error in Promises.all()',err); })
      .then(function(msg) {
            // ^^ 'msg' param is an array of returned values
        console.log(msg); // array of resolve(msg) from above..
      });

        res.write('checking for images');
        res.end();
})

//Demo of Request to hit a URL
expressapp.get('/generate', function(req, res){

var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var a = moment('2016-11-01');
var b = moment('2017-01-01');
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
            var json = { name : "", description : "We need your help to populate the descriptions! Please feel free to double-click to update the description for this holiday. :)", image : "", conditional: false};
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
                    json = { name : "", description : "We need your help to populate the descriptions! Please feel free to double-click to update the description for this holiday. :)", image : "", conditional: false};
                }
                
            });
            var month = months[date.substring(0,2)-1]
            var day = date.substring(3,5)
        
            var dataRef = new Firebase('https://holiday5.firebaseio.com/' + month + '/' + day);
            dataRef.set(holidays);
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