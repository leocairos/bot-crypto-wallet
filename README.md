# Bot Crypto Wallet

Monitor and Alert

## Remembers

### Plugins
  * REST Client for http-calls (folder) 
  
### Docker 

* sudo service docker start

* sudo docker run --rm --name bot-crypto-wallet --volume "/home/leocairos/projects/bot-crypto-wallet:/srv/app" --workdir "/srv/app" --publish 3077:3077 -it node:14 bash

* docker exec -it bot-crypto-wallet bash

* docker-compose up -d

* docker stop bot-crypto-wallet

* docker rm bot-crypto-wallet