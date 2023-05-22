const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();

const items = [];

const workItems  = [];

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

app.get("/", function(request, response){
    const day = date.getDate();
    response.render("list", {
        listTitle: day,
        newListItems: items,
        route: "/"
    });
});

app.post("/", function(request, response){
    const item = request.body.newItem;
    items.push(item);
    response.redirect("/");
});

app.get("/work", function(req,res){
    res.render("list", {
        listTitle: "Work List",
        newListItems: workItems,
        route: "/work"
    });
});

app.post("/work", function(req, res){
    const item = req.body.newItem;
    workItems.push(item);
    res.redirect("/work");
});

app.get("/about", function(request, response){
    response.render("about");
});

app.listen(3000, function(){
    console.log("Server has started on PORT 3000");
});