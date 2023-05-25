const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

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

    const foundItems = await Item.find({});

    if(foundItems.length === 0){
        await Item.insertMany(defaultItems);
        console.log("Successfully added Items");
    }

    const listSchema = new mongoose.Schema({
        name: String,
        items: [itemSchema]
    });

    const List = new mongoose.model("list", listSchema);
    
    await List.deleteOne({name: "favicon.ico"});

    app.get("/", function(request, response){
        Item.find({}).then(function(foundItems){
            response.render("list", {
                listTitle: "Today",
                newListItems: foundItems,
                route: ""
            });
        }).catch(function(error){
            console.log(error);
        });
    });


    app.get("/:customListName", function(req, res){

        const customListName = req.params.customListName;

        const requestedUrl = req.originalUrl;
        
        if (requestedUrl === "/favicon.ico") {
            res.status(204).end(); // Skip favicon.ico requests
            return;
        }
        

        List.findOne({name: customListName}).then(function(foundList){
            if(!foundList){
                const list = new List({
                    name: customListName,
                    items: []
                });

                list.save();
                res.redirect("/" + customListName);
            }
            else{
                res.render("list", {
                    listTitle: foundList.name,
                    newListItems: foundList.items,
                    route: customListName
                });
            }
        }).catch(function(error){
            console.log(error);
        });

    });

    app.post("/:customListName?", function(req, res) {
        const customListName = req.params.customListName;
        const newItem = req.body.newItem;
      
        const item = new Item({
          name: newItem
        });
      
        if (customListName) {
            List.findOne({ name: customListName }).then(function(foundList) {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" + customListName);
            }).catch(function(error) {
                console.log(error);
            });
        }
        else {
            item.save();
            res.redirect("/");
        }
    });

    app.post("/delete", async function(req, res){
        const checkedItemId = req.body.checkbox;

        const listName = req.body.listName;

        console.log(listName);

        if(listName === "Today"){
            await Item.findByIdAndRemove(checkedItemId).then(function(){
                res.redirect("/");
            }).catch(function(error){
                console.log(error);
            });
        }
        else{
            await List.findOneAndUpdate({name: listName}, {$pull : {items: {_id: checkedItemId}}}).then(function(){
                res.redirect("/" + listName)
            });
        }
    })

    // app.post("/:customListName/delete", async function (req, res) {
    //     const checkedItemId = req.body.checkbox;
    //     const customListName = req.params.customListName;
      
    //     console.log(customListName);
        
    //     await List.findOneAndUpdate(
    //         { name: customListName },
    //         { $pull: { items: { _id: checkedItemId } } }
    //     ).then(function () {
    //             res.redirect("/" + customListName);
    //         }).catch(function (error) {
    //             console.log(error);
    //     });
    // });
      

    app.get("/about", function(request, response){
        response.render("about");
    });

    app.listen(3000, function(){
        console.log("Server has started on PORT 3000");
    });

}