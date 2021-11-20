var express = require('express');    //Express Web Server 
var busboy = require('connect-busboy'); //middleware for form/file upload
var path = require('path');     //used for file path
var fs = require('fs-extra');       //File System - for file manipulation
var http = require('http');

var app = express();
app.use(busboy());
app.use(express.static(path.join(__dirname, 'public')));

http.createServer(function (req, res) {
    if(req.url == "/"){
    res.writeHead(200,"text/html")
    res.end(fs.readFileSync("upload.html", "utf8")); //end the response


    }else if(req.url.startsWith("/files/")){
        console.log()
        if (fs.existsSync(__dirname +req.url.replace("%20", " "))) {
        res.end(fs.readFileSync(__dirname +req.url.replace("%20", " ")))
        }else{
            res.writeHead(404)
            res.end("404 error")
        }
        
    }
  }).listen(80); //the server object listens on port 8080
  

/* ========================================================== 
Create a Route (/upload) to handle the Form submission 
(handle POST requests to /upload)
Express v4  Route definition
============================================================ */
app.route('/upload')
    .post(function (req, res, next) {

        var fstream;
        req.pipe(req.busboy);
        req.busboy.on('file', function (fieldname, file, filename) {
            console.log("Uploading: " + filename);

            //Path where image will be uploaded
            fstream = fs.createWriteStream(__dirname + '/files/' + filename);
            file.pipe(fstream);
            fstream.on('close', function () {    
                console.log("Upload Finished of " + filename);              
                res.redirect(200,"http://localhost/files/" + filename);           //where to go next
            });
        });
    });

var server = app.listen(8080, function() {
    console.log('Listening on port %d', server.address().port);
});