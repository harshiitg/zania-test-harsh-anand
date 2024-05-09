 DOCUMENTATION -  Frontend role

 ** how to start server : To start this server, download the zip, extract it and run ```npm i``` on your terminal and you're good to go. The server will start on your localhost. 


** About the project - The entry point is App.jsx. DocumentPage.jsx contains all the main logic regarding UI. handlers.js cpntains the logic for service workers.


** Mock Server - Setup using ```msw```. 

browser.js - mock server worker is setup here using msw/browser

handler.js - contains two handlers : 
1. get - /documents - to get documents for the first time using mock.js and store it in local storage. On reload, it checks if data is already there is localStorage, then sends it the localStorage data. Thus, persisiting data on reload.

2. post - /documents-post - on any drag and drop, this api is called with the current exisiting documents as payload to store data in localStorage. 



** DocumentsPage - main logic

1. fetchDocuments - /documents - one time

maps documents returned by this api in a state and displays the documents.

2. saveDocuments- post-  /documents-post- use setInterval every 5s to post the changed data. Also, avoids saving if no changes have been made.  

3. handleDragStart, handleDragStop functions for drag and drop

4. overlayVisible - if clicked on any document, it opens an overlay with that specific document. Can be closed by pressing ```esc```. 

5. lastSaved, elapsedTime - Shows last saved time and time elapsed until last /documents-post has occured.



For any clarifications, contact : 
Made by : ```harsh.work2024@gmail.com```