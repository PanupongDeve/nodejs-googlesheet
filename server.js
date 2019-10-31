const GoogleSheet = require('./GoogleSheet');

const googleSheet = new GoogleSheet({
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    credentialsPath: 'config/credentials.json',
    tokenPath: 'config/token.json'
});

googleSheet.run();