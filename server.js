const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");

const app = express();
const PORT = 8080;
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const DATABASE_NAME = process.env.MONGODB_DB || "csc441_web_app";
const COLLECTION_NAME = "events";

let eventsCollection;
let usingMongoDb = false;
let fallbackEvents = [];

function convertTo12HourFormat(time24) {
    if (!time24) {
        return "";
    }

    const [hours, minutes] = time24.split(":");
    let hours12 = parseInt(hours, 10);
    const ampm = hours12 >= 12 ? "pm" : "am";
    hours12 = hours12 % 12 || 12;
    return `${hours12}:${minutes}${ampm}`;
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();
});

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

app.get("/api/events", async function(req, res) {
    try {
        if (usingMongoDb && eventsCollection) {
            const events = await eventsCollection.find({}).sort({ createdAt: -1 }).toArray();
            res.json(events);
            return;
        }

        res.json(fallbackEvents);
    } catch (error) {
        res.status(500).json({ error: "Failed to load events." });
    }
});

app.post("/api/events", async function(req, res) {
    try {
        const event = {
            name: req.body.eventName,
            date: req.body.eventDate,
            time: convertTo12HourFormat(req.body.eventTime),
            location: req.body.eventLocation,
            description: req.body.eventDescription,
            additionalNotes: req.body.eventNotes,
            website: req.body.eventWebsite,
            category: (req.body.eventCategory || "").toLowerCase(),
            createdAt: new Date()
        };

        if (usingMongoDb && eventsCollection) {
            await eventsCollection.insertOne(event);
        } else {
            fallbackEvents.unshift(event);
        }

        res.redirect("/events.html");
    } catch (error) {
        res.status(500).send("Unable to save event.");
    }
});

app.delete("/api/events", async function(req, res) {
    try {
        const eventName = req.query.name;

        if (!eventName) {
            return res.status(400).json({ error: "Missing event name." });
        }

        if (usingMongoDb && eventsCollection) {
            await eventsCollection.deleteOne({ name: eventName });
        } else {
            fallbackEvents = fallbackEvents.filter(function(event) {
                return event.name !== eventName;
            });
        }

        res.json({ message: "Event deleted." });
    } catch (error) {
        res.status(500).json({ error: "Unable to delete event." });
    }
});

async function startServer() {
    app.listen(PORT, function() {
        console.log(`Server running at http://localhost:${PORT}`);
    });

    const client = new MongoClient(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });

    try {
        await client.connect();
        eventsCollection = client.db(DATABASE_NAME).collection(COLLECTION_NAME);
        usingMongoDb = true;
        console.log("Connected to MongoDB event store.");
    } catch (error) {
        usingMongoDb = false;
        console.warn("MongoDB is unavailable, using in-memory event storage.");
    }
}

startServer().catch(function(error) {
    console.error("Failed to start server:", error);
    process.exit(1);
});


