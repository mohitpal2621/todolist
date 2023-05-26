const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static("public"));

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://127.0.0.1:27017/todolistDB');
    
    const itemSchema = new mongoose.Schema({
        name: String
    });

    const Item = new mongoose.model("item", itemSchema);

    const item1 = new Item({
        name: "Buy Food"
    });

    const item2 = new Item({
        name: "Code"
    });

    const item3 = new Item({
        name: "Assignments"
    });

    const defaultItems = [item1, item2, item3];


    const listSchema = new mongoose.Schema({
        name: String,
        listItems: [itemSchema]
    });

    const List = new mongoose.model("list", listSchema);
        

    app.get("/", function(request, response){
        
        Item.find({}).then(function(foundItems){
            if(foundItems.length === 0){
                Item.insertMany(defaultItems).then(function(){
                    response.redirect("/");
                });
            } else {
                response.render(
                    "list", 
                    {
                        listTitle: "Today", newListItems: foundItems
                    }
                );
            }
        });
        
    });


    app.get("/:customListName", async function(req, res){

        const customListName = _.capitalize(req.params.customListName);

        const requestedUrl = req.originalUrl;
        
        if (requestedUrl === "/favicon.ico") {
            res.status(204).end(); // Skip favicon.ico requests
            return;
        }
        

        List.findOne({name: customListName}).then(async function(foundList){

            if(!foundList){ 
                const list = new List({
                    name: customListName,
                    listItems: []
                });

                await list.save();
                res.redirect("/" + customListName);
            }
            else{                
                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.listItems,
                });
            }
        }).catch(function(error){
            console.log(error);
        });

    });

    app.post("/", async function(req, res) {
        const itemName = req.body.newItem;
        const listName = req.body.list;
      
        const item = new Item({
            name: itemName
        });
      
        if (listName === "Today"){
            await item.save();
            res.redirect("/");
        } else {
            List.findOne({name: listName}).then(async function(foundList){
                await foundList.listItems.push(item);
                await foundList.save();
                res.redirect("/" + listName);
            });
        }
    });

    app.post("/delete", async function(req, res){
        const checkedItemId = req.body.checkbox;
        const listName = req.body.listName;

        if(listName === "Today"){
            await Item.findByIdAndRemove(checkedItemId).then(function(){
                console.log("Successfully deleted checked Item.");
                res.redirect("/");
            });
        } else {
            await List.findOneAndUpdate(
                { name: listName },
                { $pull : { listItems: { _id: checkedItemId } } }
            ).then(function(){
                res.redirect("/" + listName);
            });
        }
    });
      

    app.get("/about", function(request, response){
        response.render("about");
    });

    app.listen(3000, function(){
        console.log("Server has started on PORT 3000");
    });

}