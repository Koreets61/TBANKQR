const sha256 = require('js-sha256');
const https = require('node:https');

class TBANKQR {
    
    constructor(param){
        this.secretKey = param.secretKey;
        this.terminalKey = param.terminalKey;
        this.url = "https://securepay.tinkoff.ru/v2";
    };
    
    http_options = {        
        method: 'POST',
        agent: false,
        timeout: 6000,
        headers: {
            'Content-Type': 'application/json'
        }    
    };
      
    async exec(query, method){
        
        const self = this;
        
        return new Promise((resolve, reject) => {
            
            const queryString = JSON.stringify(query);
            
            const req = https.request(self.url + '/' + method, self.http_options, (res) => {

                const body = [];
                
                res.on('data', (chunk) => body.push(chunk));
                res.on('end', () => {
                    
                    const resString = Buffer.concat(body).toString();
                    
                    const resJson = JSON.parse(resString);
                    
                    if(resJson.hasOwnProperty('Success')){
                        
                        if(!resJson.Success){
                            reject({
                                status: 'error',
                                code: resJson.ErrorCode,
                                message: resJson.Message + " " + resJson.Details
                            });
                        } else {
                            
                            resolve(resJson);
                            
                        };
                        
                    } else {
                        
                        reject({
                            status: 'error',
                            code: 0,
                            message: resJson
                        });
                        
                    };
                });
                
            });

            req.on('error', (err) => {
                reject({
                    status: 'error',
                    code: 1,
                    message: err.message
                });
            });

            req.on('timeout', () => {
                req.destroy();
                reject({
                    status: 'error',
                    code: 1,
                    message: 'Request time out'
                });
            });

            req.write(queryString);
            req.end();
        });
    };
      
    async init(param) {
        
        const self = this;
        
        const Amount = Number(param.Amount);
        const query = {
            OrderId: param.OrderId,
            Amount: Amount,
            Description: param.Description,
            TerminalKey: self.terminalKey,
            Token: sha256(Amount + param.Description + param.OrderId + self.secretKey + self.terminalKey)
        };
        
        const resJson = await self.exec(query, 'Init');
                
        return new Promise((resolve, reject) => {          
            if(param.qr_only){
                setTimeout(() => {
                    resolve(self.GetQr(resJson));
                }, 1000);
            } else {
                resolve({
                    status: 'ok',
                    data: resJson
                });
            };     
        });
    };
    
    async GetState(PaymentId) {
        
        const self = this;
        
        const query = {
            TerminalKey: self.terminalKey,
            PaymentId: PaymentId,
            Token: sha256(self.secretKey + PaymentId + self.terminalKey)
        };
        
        const resJson = await self.exec(query, 'GetState');
        
        return new Promise((resolve, reject) => {        
            resolve({
                status: 'ok',
                data: {
                    state: resJson.Status,
                    TerminalKey: resJson.TerminalKey,
                    OrderId: resJson.OrderId,
                    PaymentId: resJson.PaymentId,
                    Amount: resJson.Amount
                }
            });  
        });
    };
    
    async GetQr(param) {
        
        const self = this;
        
        const query = {
            TerminalKey: self.terminalKey,
            PaymentId: param.PaymentId,
            DataType: "IMAGE",
            Token: sha256("IMAGE" + self.secretKey + param.PaymentId + self.terminalKey)
        };
        
        const resJson = await self.exec(query, 'GetQr');
        
        return new Promise((resolve, reject) => {
            resolve({
                status: 'ok',
                data: {
                    qr: resJson.Data,
                    TerminalKey: resJson.TerminalKey,
                    OrderId: resJson.OrderId,
                    PaymentId: resJson.PaymentId,
                    Amount: param.Amount
                }
            }); 
        });
        
    };
    
    async Cancel(param) {
        
        const self = this;
        
        const query = {
            TerminalKey: self.terminalKey,
            PaymentId: param.PaymentId,
            Token: sha256(param.Amount + self.secretKey + param.PaymentId + self.terminalKey),
            Amount: param.Amount
        };
        
        const resJson = await self.exec(query, 'Cancel');
        
        return new Promise((resolve, reject) => {
            
            resolve({
                status: 'ok',
                data: {
                    state: resJson.Status,
                    TerminalKey: resJson.TerminalKey,
                    OrderId: resJson.OrderId,
                    PaymentId: resJson.PaymentId,
                    OriginalAmount: resJson.Amount,
                    NewAmount: resJson.NewAmount,
                    Message: resJson.Message,
                    Details: resJson.Details 
                }
            });  
            
        });
        
    };
    
}

module.exports = TBANKQR;