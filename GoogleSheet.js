const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

class GoogleSheet {
    constructor({
        scopes,
        credentialsPath,
        tokenPath
    }) {
        this.SCOPES = scopes
        this.CREDENTIALS_PATH = credentialsPath;
        this.TOKEN_PATH = tokenPath;
    }

    async authorize() {
        const credentials = await this.getCredentials();
        const oAuth2Client = this.getOAuth2Client(credentials);
        return oAuth2Client;
        
    }

    async setTokenCredential(oAuth2Client) {
        try {
            const token = await fs.readFileSync(this.TOKEN_PATH);
            oAuth2Client.setCredentials(JSON.parse(token));
            return oAuth2Client;
        } catch (error) {
            console.error(error);
        }
    }

    async getOAuth2Provider() {
        let oAuth2Client = await this.authorize();
        oAuth2Client = await this.setTokenCredential(oAuth2Client);
        return oAuth2Client;
    }

    generateAuthURL(oAuth2Client) {
        const authUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: this.SCOPES,
        });

        return authUrl;
    }

    async writeTokenFile() {
        try {
            let oAuth2Client = await this.authorize();
            // code get from authurl and use only 1 time.
            console.log('Authorize this app by visiting this url:', this.generateAuthURL(oAuth2Client));
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
              });
             await rl.question('Enter the code from that page here: ', async (code) => {
                rl.close();
                console.log('code', code);
                const response = await oAuth2Client.getToken(code);
                await fs.writeFileSync(this.TOKEN_PATH, JSON.stringify(response.tokens));
             });
        } catch (error) {
            console.error(error);
        }
    }

    getOAuth2Client(credentials) {
        const {client_secret, client_id, redirect_uris} = credentials.installed;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);
        return oAuth2Client;
    }

    async getCredentials() {
        // https://developers.google.com/sheets/api/quickstart/nodejs
        try {
            const content = await fs.readFileSync(this.CREDENTIALS_PATH);
            return JSON.parse(content);
        } catch (error) {
            console.log('Error: You must dowload credentials.json this url: https://developers.google.com/sheets/api/quickstart/nodejs');
            console.log('Error loading client secret file:', error)
        }
    }

    async readExampleFile() {
        const oAuth2Client = await this.getOAuth2Provider();
        const sheets = google.sheets({version: 'v4', auth: oAuth2Client});
        sheets.spreadsheets.values.get({
          spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
          range: 'Class Data!A2:E',
        }, (err, res) => {
          if (err) return console.log('The API returned an error: ' + err);
          const rows = res.data.values;
          if (rows.length) {
            console.log('Name, Major:');
            // Print columns A and E, which correspond to indices 0 and 4.
            rows.map((row) => {
              console.log(`${row[0]}, ${row[1]}, ${row[4]}`);
            });
          } else {
            console.log('No data found.');
          }
        });
    }

    async createSheet(fileName) {
        try {
            const oAuth2Client = await this.getOAuth2Provider();
            const sheets = google.sheets({version: 'v4', auth: oAuth2Client});
            const resource = {
                properties: {
                  title: fileName
                },
            };
            const response = await sheets.spreadsheets.create({
                resource,
                fields: 'spreadsheetId',
              });
            return response.data.spreadsheetId
        } catch (error) {
           console.error(error) 
        }
    }

    async writeSheet(spreadsheetId) {
        //  TODO
    }

    async readSheet(spreadsheetId) {
        // TODO
    }

    async run() {
        // const response = await this.createSheet('Hi');
        // console.log('response', response);
        await this.readExampleFile();
        // await this.writeTokenFile();
    }

    
}

module.exports = GoogleSheet;