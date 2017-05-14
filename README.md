# Node.js + AngularJS + CloudantDB sample

It's a sample of web server which is developped by nodejs,AngularJS and cloudantDB. And the UI use bootstrap style.

## Run the app locally

1. [Install Node.js][]
2. Download and extract the starter code from the Bluemix UI
3. cd into the app directory
4. Run `npm install` to install the app's dependencies
5. Run `npm start` to start the app
6. Access the running app in a browser at http://localhost:6001

[Install Node.js]: https://nodejs.org/en/download/

## Run the app in bluemix
1. reister a Bluemix id 
2. install CF and Bluemix command in local
3. get domain info from bluemix
4. modify manifest.yml , set the domain name and the app name(the app name can be anything you wish)
5. in the root of the project , run command "cf push -f manifest.yml"
6. Access the running app in a browser at http://<app name>.<domain name>


