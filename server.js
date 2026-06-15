const express = require("express");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));

app.post("/add-event", function(req, res) {
    console.log(req.body);
    res.redirect("/events.html");
});



app.listen(PORT, function() {
    console.log(`Server running at http://localhost:${PORT}`);
});
