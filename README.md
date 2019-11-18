# Manga2Kindle Server

## TODO: Description, Usage, Known Issues, Issues, new features, donations

### Installation
This installation process was tested on aa fresh Ubuntu 19.04 Server.  
We'll need a *PostgreSQL* database for later, maker sure to install it and create a datbase and an user to use it.  

Fisrt of all lets install the basis, *node* and *npm*:  
`sudo apt install nodejs npm`  
Ok, lets clone the repo  
`git clone https://github.com/EduFdezSoy/Manga2Kindle_Server.git`  
and enter the folder  
`cd Manga2Kindle_Server`  
now we may install all the npm dependencies with:  
`npm install`  

Lets move to the next step, first we'll clone *KCC*:  
`git clone https://github.com/ciromattia/kcc.git`  
the folder with *KCC* may end as:  
`Manga2Kindle_Server/kcc-master`  

Now we need to download *KindleGen* inside `Manga2Kindle_Server/kindlegen`  
you'll need to download it directly from the [Amazon KindleGen page](https://www.amazon.com/gp/feature.html?ie=UTF8&docId=1000765211) and extract it in the folder.  

Last but not least we need *7zip*  
`sudo apt install p7zip-full`

To finish it all we need *Python* and others dependencies or *KCC* wont work, we can get rid of it with:  
`sudo apt install python3 python3-pip python3-psutil python3-slugify`  
and  
`pip3 install pillow`

Now we can move to the database, I asume you have your user and your database created somewhere so we only need to execute the `manga2kindle.sql` and our db will be completed.  
NOTE: You may want to remove the test data at the bottom of the file.  

### Configuration
All the config is set in a `.env` file, you can copy the config from the `.env.example`.

This config file is divided in 3 blocks:  
The first one:
```
MASTER_NAME=Manga2Kindle
VERSION=0.6.2
PORT=3000
TEMP_FOLDER=tmp
DELETE_INPUT=true
```
MASTER_NAME and VERSION are for the app to know the server, you may not change it.  
PORT is.. the port where the server will be started.  
TEMP_FOLDER is used to store the uploads while in queue or being processed.  
DELETE_INPUT if set to false will save all files uploaded. Useful while debugin.  

The second block is all the database configuration: host, user, database, password and port:
```
# DATABASE CONNECTION
PGHOST=localhost
PGUSER=manga2kindle
PGDATABASE=manga2kindle
PGPASSWORD=manga2kindle
PGPORT=5432
```

And the last one has all the mail service configuration:
```
# EMAIL CONFIG
# the server will send a mails with errors (if enabled)
INFO_MAIL_ENABLED=true
MAIL_TO=your_error_mail_box@example.com
# SERVICES: gmail, smtp
MAIL_SERVICE=smtp
MAIL_HOST=smtp.example.com
MAIL_PORT=465
MAIL_SECURE=true
MAIL_USERNAME=your_mail@example.com
MAIL_PASSWORD=your_awesome_password_123
MAIL_SENDER=your_mail_sender@example.com
MAIL_REPLY_TO=your_mail_sender@example.com
```
INFO_MAIL_ENABLED won't send anything right now but in the future we expect the errors to be sent to the MAIL_TO mailbox.  
When using *gmail* as MAIL_SERVICE you'll only need MAIL_USERNAME and MAIL_PASSWORD. You'll need to configure your Gmail to be able to conect to.  

That's all you need to do, now you can run the server with:  
`node app.js`

### Dependencies
- [KCC](https://github.com/ciromattia/kcc) clone that proyect inside this one, may create a folder called _kcc-master_
- [7z](http://www.7-zip.org/download.html) to work with zips
- [KindleGen](https://www.amazon.com/gp/feature.html?ie=UTF8&docId=1000765211) in _kindlegen_ directory, to convert epub to mobi
- Other dependencies: NodeJS 8.11+, Python 3.3+, Pillow 4.0.0+, psutil 5.0.0+, python-slugify 1.2.1+

## Copyright
Copyright &copy; 2019 Eduardo Fernandez.  

**Manga2Kindle Server** is released under a Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International License; see _LICENSE_ for further details.
