const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('./public/assets/js/uuid');


const app = express();

let PORT = process.env.PORT;
if (PORT == null || PORT == "") {
  PORT = 3001;
}

// Middleware
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// Routes for get and post requests
app.get('/', (req, res) => 
  res.sendFile(path.join(__dirname, 'public/index.html'))
);

app.get('/notes', (req, res) =>
  res.sendFile(path.join(__dirname, 'public/notes.html'))
);

app.get('/api/notes', (req, res) => {
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.log(err);
    } else {
      res.json(JSON.parse(data));
    }
  });
});

app.post('/api/notes', (req, res) => {

  var { title, text } = req.body;
  
  if (title && text) {
    var newNote = {
      "title": title,
      "text": text,
      "id": uuid()
    };

    fs.readFile('./db/db.json', 'utf8', (err, data) => {
      if (err) {
        console.log(err)
      } else {
        const parsedNotes = JSON.parse(data);
        parsedNotes.push(newNote);

        // write to db.json
        fs.writeFile('./db/db.json', JSON.stringify(parsedNotes, null, 4), (writeErr) => {
          if(writeErr) {
            console.error('Unable to update db.json' + writeErr);
          } else {
            console.info('Successfully updated notes!');
          }
        });
      }
    });

    const response = {
      status: 'success',
      body: newNote,
    };

    console.log(response);
    res.status(201).json(response);
  } else {
    res.status(500).json('Error in posting review');
  }
});

// Delete note
app.delete('/api/notes/:id', (req, res) => {
  const id = req.params.id;
  fs.readFile('./db/db.json', 'utf8', (err, data) => {
    if (err) {
      console.log(err)
    } else {
      const parsedNotes = JSON.parse(data);
      const filteredNotes = parsedNotes.filter(note => note.id !== id);
      
      // write to db.json
      fs.writeFile('./db/db.json', JSON.stringify(filteredNotes, null, 4), (writeErr) => {
        if(writeErr) {
          console.error('Unable to update db.json' + writeErr);
        } else {
          console.info('Successfully updated notes!');
        }
      });
    }
  });
  res.status(200).json('Note deleted');
});

// set up listener
app.listen(PORT, () => 
  console.log(`Up and running at http://localhost:${PORT}`)
);