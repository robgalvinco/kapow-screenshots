const express = require('express');
const path = require('path');  
const fs = require('fs');

const app = express();

// Serve static files from public folder
app.use(express.static(path.join(__dirname, 'public'))); 

// Set views folder and view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {

  // Images stored in public/images
  const imgPath = path.join(__dirname, 'public', 'images');

  fs.readdir(imgPath, (err, files) => {
    if (err) throw err;

    let images = [];

    files.forEach(file => {
      const filename = file.replace(/-colon-/g, ':')
                          .replace(/-slash-/g, '/');

      images.push({
        src: `/images/${file}`,
        href: decodeURIComponent(filename) 
      });
    });

    // Render index view with images
    res.render('index', {
      title: 'Screenshot Viewer',
      images: images
    });

  });

});

app.listen(3000, () => {
  console.log('App listening on port 3000!');
});