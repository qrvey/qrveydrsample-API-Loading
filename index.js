const https = require('https');
const { config } = require('process');
const config = require('./config.json');

const metadataId = config.metadataId;
const dataloadApi = config.dataloadApi;
const apikey = config.apikey;

const optionsAPI = {
    hostname: '',
    port: 443,
    path: '',
    headers: {
    },
    method: 'GET',
    rejectUnauthorized: false
}

const run = async () => {
    try {
        //Get data from API
        const data = await getDataFromAPI();
        console.log('data: ', data);

        //Load data to Qrvey
        await sendDataToDataRouter([data]);

    } catch (error) {
        console.error('Handler', error);
        throw error;
    }
}

//Get data from API
const getDataFromAPI = async () => {
    return new Promise((resolve, reject) => {
        const req = https.get(optionsAPI, res => {
            let body = ''
            res.setEncoding('utf8');
            res.on('data', chunk => (body += chunk))
            res.on('end', async () => {
                if (body !== '' && body !== undefined)
                    return resolve(JSON.parse(body));
                else
                    return resolve();
            });
        })
        req.on('error', error => {
            console.log('error getting data: ', error)
            return reject(error);
        })
        req.end()
    });
}

//Loading data via postdata API.
const sendDataToDataRouter = async (data) => {
    return new Promise((resolve, reject) => {
        var options = {
            method: 'POST',
            hostname: dataloadApi,
            path: '/Prod/dataload/v1/postdata',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apikey
            },
            port: 443
        }
        var req = https.request(options, function (res) {
            var chunks = []
            res.on('data', function (chunk) {
                chunks.push(chunk);

            })
            res.on('end', function (chunk) {
                var body = Buffer.concat(chunks)
                console.log('the jobid body' + body.toString())
                return resolve(body.toString());
            })
            res.on('error', error => {
                console.error('Error post data:', error);
                return reject(error);
            })
            console.log('POST Call Status:', res.statusCode);
        })
        var postData = JSON.stringify([{
            metadataId,
            data: data
        }])
        req.write(postData)
        req.end()
    });
}

run();