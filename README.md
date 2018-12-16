Parse PDF Files from TroopMaster
================================

In migrating data from TroopMaster for import into Scoutbook, I found that only
certain data was exported into CSV format and available for download.  Most of the
data I wanted was only exportable as a PDF.  So I wrote this simple PDF parser to
extract the data I wanted into a CSV file.  From there, it was much easier to work with. I was
able to create a log.csv for import into Scoutbook and also calendar.csv files to import old
calendar info using the Scoutbook broswer add-on.

I'm releasing this into the wild because I thought others might find it useful.  It isn't receiving
any further development, I got it to do what I needed it to do.  It's a one-shot thing that may
save other people some time.  Honestly, it is a hack because I'm too lazy to re-enter data
into ScoutBook by hand.  The PdfReader library did all the heavy lifting.

This converts only one type of report, the Individual Participation, like the sample
file from TroopMaster:

http://www.troopmaster.com/images/reports/activities/IndividualParticipation.pdf

I was able to create a similar report for my troop from the TroopMaster Web interface.

You can run this on a PDF that contains one, or multiple scouts.  The lines in the CSV look like:

    BSAID,Last Name,First Name,Date,Level,Event Title,Type,Amount,Location,Remarks
    ,Neuben,Carleton,08/10/15,Troop,Meeting,Meeting,1,Scout Hut
    ,Neuben,Carleton,08/12/15,Troop,Camping,Camping,2,Camp Goshen
    ,Neuben,Carleton,08/17/15,Troop,Meeting,Meeting,1,Scout Hut

This is designed to run under NodeJS version 8 and up, so you'll need to have NodeJS installed, and be
at least familiar with running node-based javascript apps.

Installation:

    npm install

To run:

    npm start <pdf-file-name>

This will output a file: output.csv