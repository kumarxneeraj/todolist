//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.set("debug", true);

mongoose.connect("mongodb+srv://2020ceb1019:testtest@cluster0.7jkazst.mongodb.net/todolistDB", { useNewUrlParser: true });

const itemsSchema = {
  name: String
};

const Item = mongoose.model("item", itemsSchema);

const item1 = new Item({ name: "welcome to your todolist!" });
const item2 = new Item({ name: "Hit the + button to add a new item." });
const item3 = new Item({ name: "<-- Hit this to delete an item" });

const defaultItems = [item1, item2, item3];
const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function (req, res) {
  Item.find({})
    .then((foundItems) => {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems)
          .then(() => {
            console.log("Default items inserted successfully.");
          })
          .catch((err) => {
            console.log("Error inserting default items:", err);
          });
      }
      res.render("list", { listTitle: "Today", newListItems: foundItems });
    })
    .catch((err) => {
      console.log("Error finding items:", err);
    });
});

app.post("/delete", async function (req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if(listName === "Today"){
    try {
    await Item.findByIdAndRemove(checkedItemId);
    res.redirect("/");

  } catch (error) {

  }}
  else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkedItemId } } })
  .then(function(foundList) {
    if (!foundList) {
      res.redirect("/" + listName);
    }
    res.redirect("/" + listName);
  })
  .catch(function(err) {
    console.error(err);
  });


  }

  
});

app.get("/:customListName", function (req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then(function (foundList) {
      if (!foundList) {
        const list = new List({
          name: customListName,
          items: defaultItems 
        });res.redirect("/" + customListName);
        return list.save();
         
      } else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    })
    
    .catch(function (err) {
      console.error(err);
    });
});




app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else {
    List.findOne({ name: listName })
  .then(function(foundList) {
    foundList.items.push(item);
    res.redirect("/" + listName);
    foundList.save();
  })
  
  .catch(function(err) {
    console.error(err);
  });

    
  }
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
