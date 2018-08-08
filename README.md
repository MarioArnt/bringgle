![Bringgle](https://raw.githubusercontent.com/MarioArnt/bringgle/master/client/src/assets/logo.png)

> Real-time collaborative check-lists.

As a User create a list and invite friends to attend.
Add item to the list, flag them if you can bring it.
Every change is broadcast real-time to all attendees through websocket.
In the end, you ask for a sum-up of all items you say can bring.

Project due-date: August 2018

Taiga board: https://tree.taiga.io/project/marioarnt-bringgle/taskboard/first-deployment-1

## Development setup

First of all, install yarn.
On ubuntu/debian:
````bash
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn
````

Then install globally some npm packages:

````bash
yarn global add typescript tslint mocha nyc
````

Clone the project. Install project dependencies:

````bash
yarn install
````

Run the app

````bash
#front-end (provides hot-reload)
yarn dev

#back-end
cd server
yarn start

#Run test suite (with code coverage)
cd server
yarn test
````
