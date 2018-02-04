process.env.DEBUG = 'actions-on-google:*';

const functions = require('firebase-functions');
const { DialogflowApp } = require('actions-on-google');
const rq = require('request');

const ACTION_PRICE = 'price';
const ACTION_TOTAL = 'total';
const ACTION_TRANSACTIONS = 'transactions';
const ACTION_SENT = 'sent';

const EXT_BITCOIN_API_URL = 'https://blockchain.info';
const EXT_PRICE = '/q/24hrprice';
const EXT_TOTAL = '/q/totalbc';
const EXT_TRANSACTIONS = '/q/24hrtransactioncount';
const EXT_SENT = '/q/24hrbtcsent'

exports.bitcoinInfo = functions.https.onRequest((request, response) => {
  const app = new DialogflowApp({ request, response });
  console.log('bitcoinInfoAction Request headers: ' + JSON.stringify(request.headers));
  console.log('bitcoingInfoAction Request body: ' + JSON.stringify(request.body));

  // Price action
  function priceHandler (app) {
    rq(EXT_BITCOIN_API_URL + EXT_PRICE, (error, response, body) => {
      if (error) {
        console.log('Error on priceHandler: ', error);
        return
      }

      console.log('priceHandler response: ' + JSON.stringify(response) + ' Body: ' + body + ' | Error: ' + error);
      const msg = 'Ahora mismo el valor del bitcoin es ' + body + ' USD';
      app.tell(msg);
    });
  }

  // Total bitcoin action
  function totalHandler (app) {
    rq(EXT_BITCOIN_API_URL + EXT_TOTAL, (error, response, body) => {
      if (error) {
        console.log('Error on totalHandler: ', error);
        return
      }
      console.log('totalHandler response: ' + JSON.stringify(response) + ' Body: ' + body + ' | Error: ' + error);
      const billionsBtc = body / 1000000000;
      const msg = `Ahora mismo existen ${billionsBtc} mil millones de bitcoins en el mundo.`;
      app.tell(msg)
    })
  }

  // Number of transactions 
  function transactionsHandler (app) {
    rq(EXT_BITCOIN_API_URL + EXT_TRANSACTIONS, (error, response, body) => {
      console.log('transactionsHandler response: ' + JSON.stringify(response) + ' Body: ' + body + ' | Error: ' + error);
      const msg = `En las últimas 24 horas se han realizado ${body} transaciones de Bitcoins`;
      app.tell(msg);
    });
  }

  // Number of bitcoin sent
  function sentHandler (app) {
    rq(EXT_BITCOIN_API_URL + EXT_SENT, (error, response, body) => {
      console.log('sentHandler response: ' + JSON.stringify(response) + ' Body: ' + body + ' | Error: ' + error);
      const msg = `En las últimas 24 horas se han enviado ${body} satoshis`;
      app.tell(msg);
    });
  }

  let actionMap = new Map();
  actionMap.set(ACTION_PRICE, priceHandler);
  actionMap.set(ACTION_TOTAL, totalHandler);
  actionMap.set(ACTION_TRANSACTIONS, transactionsHandler);
  actionMap.set(ACTION_SENT, sentHandler);
  
  app.handleRequest(actionMap);
});