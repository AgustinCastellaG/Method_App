# Getting Started

1- Create MongoDB database and copy string into /server/.env\
2- Run npm install for both client and server folders\
3- Run npm start for bot client and server folders\

## /server/.env

NODE_ENV=development\
PORT=3001\
MONGO_URI==\
METHOD_API_KEY=\

# Improvements

This is the result of 3 and a half days of work so it's a minimal version of the software. Some things are missing and others have room to improvement. Here's the list

## Missing
### Funds per branch report
### Notifications
### File Picker to upload file 
    This is because FileStack didn't allow to upload XML files. The code is commented and instead there is an input to paste the XML file's url

## To improve
### UI and styles are very simple
### Add models uniqueness validation for certain attributes
### Have an historical of XML files uploaded to make proper queries. Right now the reports are made for the current dashboard
### Make CSV columns more friendly by doing some joins and grabbing entities names instead of accounts
### Split routes and controllers by model
### Add some backend logging to know what is doing the server
