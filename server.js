const express = require("express");
const path = require("path");

const app = express();
const PORT = 8080;

app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));

app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/events", function(req, res) {
    res.sendFile(path.join(__dirname, "events.html"));
});

app.get("/calendar", function(req, res) {
    res.sendFile(path.join(__dirname, "calendar.html"));
});

app.get("/add-event", function(req, res) {
    res.sendFile(path.join(__dirname, "add-event.html"));
});

app.get("/about", function(req, res) {
    res.sendFile(path.join(__dirname, "about.html"));
});

app.post("/add-event", function(req, res) {
    console.log(req.body);
    res.redirect("/events.html");
});

app.listen(PORT, function() {
    console.log(`Server running at http://localhost:${PORT}`);
});


