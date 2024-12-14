# TBANKQR
Реализация пакета NPM для NodeJS реализующая получение QR СБП кода, через процессинг Банка Т-Банк (Тинькофф)

> # Отказ от ответственности
> Данная реализация класса написана исключительно для личного использования, и выложена на общедоступный ресурс как один из многих примеров того, как это можно реализовать. 

#### Полезные ссылки
[Проверить корректность формирования токена](https://tokentcs.web.app/)\
[Описание API Т-БАНК (Прием платежей)](https://www.tbank.ru/kassa/dev/payments/)

## Пример

#### Инициализация
```
const TBANKQR = require('@koreets61/tbankqr');

const test = new TBANKQR({
    secretKey: "12345",
    terminalKey: "12345"       
});

```

> #### Параметры инициализации класса
> **secretKey** - Пароль ;\
> **terminalKey** - Терминал;\
>
> Находятся: Личный кабинет -> Интернет-эквайринг -> Магазины -> Терминалы

#### Использование

##### Запрос init
```
// Amount - Сумма в копейка
// Description - Описание что продаем
// OrderId - Уникальный внутренний номер заказа
// qr_only - Прислать сразу изображение QR в Base64

const param = {
    Amount: 10000,
    Description: "Это тест",
    OrderId: "TEST_788",
    qr_only: true
};

test.init(param).then(results => {
    console.log('======================== results ========================');
    console.log(results);
    console.log('=========================================================');
}).catch(error => {
    console.log('========================= error =========================');
    console.log(error);
    console.log('=========================================================');
});
```

##### Ответ init (qr_only - true)
```
{
	status: 'ok',
	data: {
		qr: resJson.Data,
		TerminalKey: "12345",
		OrderId: "TEST_788",
		PaymentId: "123456789",
		Amount: 10000
	}
}
```

> ###### Ответ init (qr_only - false)
> Смотреть [Описание API Т-БАНК (Прием платежей)](https://www.tbank.ru/kassa/dev/payments/) в разделе Стандартный платеж

##### Запрос GetState
```
// PaymentId - Идентификатор платежа в системе Т-Кассы

const PaymentId = "123456789";

test.GetState(PaymentId).then(results => {
    console.log('======================== results ========================');
    console.log(results);
    console.log('=========================================================');
}).catch(error => {
    console.log('========================= error =========================');
    console.log(error);
    console.log('=========================================================');
});
```

##### Ответ GetState
```
{
	status: 'ok',
	data: {
		state: "NEW",
		TerminalKey: "12345",
		OrderId: "TEST_788",
		PaymentId: "123456789",
		Amount: 10000
	}
}
```

> ###### Возможные состояния
> Смотреть [Описание API Т-БАНК (Прием платежей)](https://www.tbank.ru/kassa/dev/payments/) в разделе Статусная модель платежа

##### Запрос Cancel
```
// PaymentId - Идентификатор платежа в системе Т-Кассы

const param = {
	PaymentId: "123456789",
	Amount: 10000
};

test.Cancel(param).then(results => {
    console.log('======================== results ========================');
    console.log(results);
    console.log('=========================================================');
}).catch(error => {
    console.log('========================= error =========================');
    console.log(error);
    console.log('=========================================================');
});
```

##### Ответ Cancel
```
{
	status: 'ok',
	data: {
		state: "NEW",
		TerminalKey: "12345",
		OrderId: "TEST_788",
		PaymentId: "123456789",
		OriginalAmount: 10000,
		NewAmount: 0,
		Message: "OK",
		Details: "None"
	}
}
```

> ###### При использование метода Cancel ознакомиться с описанием
> Смотреть [Описание API Т-БАНК (Прием платежей)](https://www.tbank.ru/kassa/dev/payments/) в разделе Отмена платежа

