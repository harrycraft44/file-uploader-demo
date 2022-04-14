
var express = require('express');    //Express Web Server 
var busboy = require('connect-busboy'); //middleware for form/file upload
var path = require('path');     //used for file path
var fs = require('fs-extra');       //File System - for file manipulation
var http = require('http');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const io = require('@pm2/io')
const reqsec = io.meter({
    name: 'req/sec',
    id: 'app/requests'
  })
const upf = io.counter({
  name: 'uploaded files',
})


 
var app = express();
app.use(busboy());
app.use(express.static(path.join(__dirname, 'public')));

http.createServer(function (req, res) {
    if(req.url == "/"){
    res.writeHead(200,"text/html")
    res.end(fs.readFileSync("upload.html", "utf8")); //end the response


    }else if(req.url.startsWith("/files/")){
        console.log()
        if (fs.existsSync(__dirname +req.url.replace(/%20/g, " "))) {
        res.end(fs.readFileSync(__dirname +req.url.replace(/%20/g, " ")))
        }else{
            res.writeHead(404)
            res.end("404 error")
        }
        
    }else if(req.url.startsWith("/red/files/")){
        res.writeHead(200,"text/html")
        var url = "http://86.184.210.187"+req.url.replace("/red","")
        res.write(`<a href="${url}">download</a> `)
        res.end("<p>"+url+"</p>");
    }else if(req.url.startsWith("/video/files/")){
        var likes =  fs.readFileSync(__dirname + '\\files\\videoi\\' +req.url.replace("/video/files/","").replace(/%20/g, " ") + "/likes.txt");
        var dislikes =  fs.readFileSync(__dirname + '\\files\\videoi\\' +req.url.replace("/video/files/","").replace(/%20/g, " ") + "/dislikes.txt");

        res.writeHead(200,"text/html")
        var url = "http://86.184.210.187"+req.url.replace("/video","")
        res.write(`<html><body style=  "height: 100vh;width: 100vw;overflow: hidden;"> 
        <script>if ( window.history.replaceState ) {window.history.replaceState( null, null, window.location.href );}</script><video width="1000px " height="500px" controls>
        <source src="${url}" type="video/mp4">
      </video> <form action="http://86.184.210.187:8080/like" method="POST" style="display: inline-block;">
      
      <input type="hidden" name="video"  value="${req.url.replace("/video/files/","").replace(/%20/g, " ")}"><br>
     <button type="submit">${likes} likes</button></form>
     <form action="http://86.184.210.187:8080/dislike" method="POST" style="display: inline-block;">
     <input type="hidden" name="video"  value="${req.url.replace("/video/files/","").replace(/%20/g, " ")}"><br>

     <button type="submit">${dislikes} dislikes</button>
    </form>\n`)
        res.end("<p>"+url+"</p></body</html>");
    }else if(req.url.startsWith("/video")){
        res.writeHead(200,"text/html")
        res.end(fs.readFileSync("videoupload.html", "utf8")); //end the response
    }

}).listen(80); //the server object listens on port 8080
  

/* ========================================================== 
Create a Route (/upload) to handle the Form submission 
(handle POST requests to /upload)
Express v4  Route definition
============================================================ */
app.use(bodyParser.urlencoded({ extended: true })); 

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
                upf.inc();
                reqsec.mark();
                

                res.redirect("http://86.184.210.187/red/files/" + filename);           //where to go next
            });
        });
    });
    app.use(bodyParser.urlencoded({ extended: true })); 
    app.use(cookieParser());

    app.post('/like', (req, res) => {
        if (req.cookies[req.body.video] == undefined){

        
        var folderName = __dirname + '\\files\\videoi\\' + req.body.video
        var likess =  fs.readFileSync(`${folderName}\\likes.txt`);
        likes = parseInt(likess) + 1
        fs.writeFile(`${folderName}\\likes.txt`, String(likes), err => {
            if (err) {
              console.error(err)
              return
            }
            res.cookie(req.body.video, "1" );

            res.redirect(307, 'http://86.184.210.187/video/files/'+req.body.video);
            
            res.end()

        })
        }else{
            var folderName = __dirname + '\\files\\videoi\\' + req.body.video
            var likess =  fs.readFileSync(`${folderName}\\likes.txt`);
            likes = parseInt(likess) - 1
            fs.writeFile(`${folderName}\\likes.txt`, String(likes), err => {
                if (err) {
                  console.error(err)
                  return
                }
                res.clearCookie(req.body.video);
    
                res.redirect(307, 'http://86.184.210.187/video/files/'+req.body.video);
                
                res.end()
    
            })
        }
    });
    app.post('/dislike', (req, res) => {
        if (req.cookies[req.body.video+"dis"] == undefined){

        
        var folderName = __dirname + '\\files\\videoi\\' + req.body.video
        var dislikess =  fs.readFileSync(`${folderName}\\dislikes.txt`);
        likes = parseInt(dislikess) + 1
        fs.writeFile(`${folderName}\\dislikes.txt`, String(likes), err => {
            if (err) {
              console.error(err)
              return
            }
            res.cookie(req.body.video+"dis", "1" );

            res.redirect(307, 'http://86.184.210.187/video/files/'+req.body.video);
            
            res.end()

        })
        }else{
            var folderName = __dirname + '\\files\\videoi\\' + req.body.video
            var dislikess =  fs.readFileSync(`${folderName}\\dislikes.txt`);
            likes = parseInt(dislikess) - 1
            fs.writeFile(`${folderName}\\dislikes.txt`, String(likes), err => {
                if (err) {
                  console.error(err)
                  return
                }
                res.clearCookie(req.body.video+"dis");
    
                res.redirect(307, 'http://86.184.210.187/video/files/'+req.body.video);
                
                res.end()
    
            })
        }
    });
app.route('/videoupload')
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
                upf.inc();
                reqsec.mark();
                var folderName = __dirname + '\\files\\videoi\\' + filename
                try {
                    if (!fs.existsSync(folderName)) {
                      fs.mkdirSync(folderName)
                    }
                  } catch (err) {
                    console.error(err)
                  }
                  fs.writeFile(`${folderName}\\likes.txt`, "0", err => {
                    if (err) {
                      console.error(err)
                      return
                    }
                    //file written successfully
                  })
                  fs.writeFile(`${folderName}\\dislikes.txt`, "0", err => {
                    if (err) {
                      console.error(err)
                      return
                    }
                    //file written successfully
                  })
                res.redirect("http://86.184.210.187/video/files/" + filename);           //where to go next
                
            });
        });
    });
var server = app.listen(8080, function() {
    console.log('Listening on port %d', server.address().port);
});