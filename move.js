// move.js

const fs = require('fs');
const path = require('path');

const sourceDir = path.join(__dirname, 'screenshots'); 
const outputDir = path.join(__dirname, 'public/images');

fs.readdir(sourceDir, (err, files) => {
  if (err) throw err;

  files.forEach(file => {
   
    const filename = file.replace(/%3A/g, '-colon-')
                          .replace(/%2F/g, '-slash-');

    const cleanName = filename.slice(0, -4);

    fs.copyFile(
      path.join(sourceDir, file),
      path.join(outputDir, cleanName),
      err => {
        if (err) throw err;
        
        console.log(`Copied ${file} to ${cleanName}`);
      }  
    );

  });

});