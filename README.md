## Fleet Manager 5.0 (For Asset Producers)

The Fleet Manager 5.0 IFF stack is responsible for creation of assets using standardized templates. The Fleet Manager created assets can then be shared to IFF Factory Manager using 'export as a file' in demo version or using dataspace manager in upcoming commercial version.

For the demo setup, the Fleet uses GitHub API to fetch these templates. The GitHub token and url must be defined for this in .env of backend folder. For commercial version, this demo templates will be replaced by IFRIC standard templates with ECLASS classification. The demo templates for this application is present in this GitHub (repo) [https://github.com/IndustryFusion/templates]. The Fleet Manager is also responsible for tagging the assets to a unique ID (For demo it is a hardcoded series, for commercial this ID will be gven by IFRIC service.)

Fleet Manager uses FIWARE Scorpio Broker for storing objects. The scorio broker must be seperately deployed and the API must be connected to Fleet Manager using .env file. For scorpio broker, Kubernetes deployment and configuration files for development is in the folder 'broker'. This must be deployed on a Kubernetes node and expose the url to the Fleet Manager.

After deploying Scorpio broker (scorpio, kafka, postgres), create the below asset for demo ID series. Note: In value, urn:ngsi-ld:asset:2:XXX, the XXX range is your choice. The IDs will then start from XXX+1.

```bash

curl --location 'http://85.215.171.58:9090/ngsi-ld/v1/entities/' \
--header 'Content-Type: application/ld+json' \
--header 'Accept: application/ld+json' \
--data-raw '{
    "@context": "https://uri.etsi.org/ngsi-ld/v1/ngsi-ld-core-context-v1.3.jsonld",
    "id": "urn:ngsi-ld:id-store",
    "type": "urn-holder",
    "last-urn": {
        "type": "Property",
        "value": "urn:ngsi-ld:asset:2:300"
    }
}'

```

The application also uses S3 as object storage. Create a demo S3 bucket in your favourite cloud provider and feed the details in .env of backend folder.

The application is only single tenant capable as of now, and uses a fixed username and password as of now which are also fed using .env in backend folder.

Exmaple .env of backend root folder:

```

GITHUB_BASE_URL=https://api.github.com/repos/<owner>/<repo>/contents
GITHUB_TOKEN=<git token for above repo>
SCORPIO_URL=http://<scorpio-IP>:9090/ngsi-ld/v1/entities
S3_URL=<S3 URL>
S3_ACCESS_KEY=<S3 Access Key>
S3_SECRET_KEY=<S3 Secret Key>
S3_BUCKET=<S3 Bukect Name>
USERNAME=<username>
PASSWORD=<password>
CORS_ORIGIN=http://localhost:3001

```


Once the .env is added to the code, install dependencies in 'backend' and 'frontend' projects using,

```
npm install
```

And then run the backend project using,

```
npm run start

```

And then run the frontend project using,

```
npm run dev

```

The UI application will be available at localhost:3001.

Copyrights: IB Systems GmbH.



