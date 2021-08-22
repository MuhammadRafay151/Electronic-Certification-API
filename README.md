# Electronic-Certification-API
## Contributors

  + Muhammad Rafay
  
  + Muhammad Aamir

## Run with docker 
+ docker file available in project root.

+ docker build -t cert-back .

+ docker run -d -p 8000:8000 -v /home/muhammad-rafay/FYP-Hostings/Electronic-Certification-API/org1-wallet:/app/org1-wallet --add-host  peer0.org1.example.com:192.168.0.105 --add-host  orderer.example.com:192.168.0.105 --add-host  peer0.org2.example.com:192.168.0.105 --name ctback cert-back
+ Replace your volume paths and hosts accordingly.please noted that hosts are optional you need to add host only if you dont have public domain names regitered.