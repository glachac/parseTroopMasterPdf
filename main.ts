
const fs = require('fs');
import {PdfReader} from 'pdfreader';
import minimist from 'minimist';

const VERSION = '0.01';

function displayHelp() {
    console.log(`
    Usage:
        $0 [options] PDF_FILE

    Options:
        -h, --help         print usage information
        -v, --version      show version info and exit
    `)
}

const args: any = minimist(process.argv.slice(2), {
    boolean: ['h', 'v'],
    alias: {
        h: 'help',
        v: 'version'
    }
} );

if ( args['version']){
    console.log(VERSION);
    process.exit(0);
}

if ((args._.length === 0) || args['help']){
    displayHelp();
    process.exit(0);
}

var rows = {}; // indexed by y-position
let scoutName;
let bsaId = '';
let lastY: number = 0;

function printRows() {
  Object.keys(rows) // => array of y-positions (type: float)
    .sort((y1, y2) => parseFloat(y1) - parseFloat(y2)) // sort float positions
    .forEach((y) => {
         if (rows[y][0] === 'Name:'){
           // Need to capture name at top of sheet and remove space to make CSV-complient
           scoutName = rows[y][1];
           console.log(scoutName);
           // Sometimes the name has a comma, other times it doesn't.  So figure that out
           if (scoutName.indexOf(',') !== -1){
             // This name is already last,first
             scoutName = rows[y][1].replace(/\s/g, "");
           }else{
             // No comma, so this is a 'first last' name
             let name = scoutName.split(" ");
             scoutName = `${name[1]},${name[0]}`;
           }
           // Clear bsaId
           bsaId = '';
           return;
         }
         // So the number of columns in this row is weird since some are empty if the scout
         // has no position.
         if (rows[y][0] === 'Position:'){
          //  console.log(rows[y]);
           const idRow = rows[y];
           for (let i=0; i< idRow.length;i++){
             if (idRow[i] === 'BSA ID:'){
               // Only if it exists, save bsa ID
               if ((i+1)< idRow.length){
                 bsaId = idRow[i+1];
               }
             }
           }
           return;
         }
         // ONLY rows starting with dates
         let thirdChar = rows[y][0].charAt(2);
         let fourthChar = rows[y][0].charAt(3);
         if ((thirdChar === '/') && (['0','1','2', '3'].includes(fourthChar))){
          if(rows[y].length > 2){
            // console.log((rows[y] || []).join(','));
            let row = (rows[y] || []).join(',');
            fs.appendFileSync('output.csv',`${bsaId},${scoutName},${row}\n`);
          }
        }
    });
}

fs.writeFileSync('output.csv','BSAID,Last Name,First Name,Date,Level,Event Title,Type,Amount,Location,Remarks\n')

// This logic is good-ish
new PdfReader().parseFileItems(args._[0], function(err, item){

  if (!item || item.page) {
    // end of file, or page
    printRows();
    rows = {}; // clear rows for next page
    lastY = 0;
  }
  else if (item.text) {
    // accumulate text items into 'rows' object map, one entry per line
    // A line is defined by which "y" coordinate it starts
    // console.log(`y=${item.y} text: ${item.text}`);

    // Add some row tolerance because the generated reports shrink text within row, which skews the y-value
    let index = item.y;
    if ((parseFloat(item.y) - lastY) < 0.100){
      // Within 0.100 of each other, treat as same line
      index = lastY;
    } else {
      lastY = item.y;
    }
    (rows[index] = rows[index] || []).push(item.text);
  }
});

