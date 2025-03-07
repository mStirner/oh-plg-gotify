# Introduction
Forwards notifications to a Gotify server

> [!IMPORTANT]  
> Dont forget to change the device IP Adress/Host to your gotify server!<br />
> Dont forget to set the App secret in the "Gotify Server" vault!

# Installation
1) Create a new plugin over the OpenHaus backend HTTP API
2) Mount the plugin source code folder into the backend
3) run `npm install`

# Development
Add plugin item via HTTP API:<br />
[PUT] `http://{{HOST}}:{{PORT}}/api/plugins/`
```json
{
   "name":"Gotify Integration",
   "version": "1.0.0",
   "intents":[
      "devices",
      "store",
      "vault"
   ],
   "uuid": "65e83c09-82c5-49ac-822d-ffc164b9cea2"
}
```

Mount the source code into the backend plugins folder
```sh
sudo mount --bind ~/projects/OpenHaus/plugins/oh-plg-gotify/ ~/projects/OpenHaus/backend/plugins/65e83c09-82c5-49ac-822d-ffc164b9cea2/
```
