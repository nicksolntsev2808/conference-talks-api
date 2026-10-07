# conference-talks-api

REST API расписания докладов конференции. Node.js + Express, настройки читаются из `.env` через `dotenv`. База данных не используется: доклады хранятся в памяти приложения (после перезапуска расписание пустое).

### Структура
```
├── server.js
├── package.json
├── package-lock.json
└── .env.example
```

## API методы

В примерах порт `8060` (значение из `.env.example`).

### Проверка состояния
```bash
curl http://127.0.0.1:8060/health
```

### Добавить доклад
```bash
curl -X POST http://127.0.0.1:8060/api/v1/talks \
  -H 'Content-Type: application/json' \
  -d '{"title":"CI/CD на практиці","speaker":"Марія","room":"A"}'
```

### Получить список (с фильтрами)
```bash
curl http://127.0.0.1:8060/api/v1/talks
curl "http://127.0.0.1:8060/api/v1/talks?room=A"
curl "http://127.0.0.1:8060/api/v1/talks?confirmed=true"
```

### Получить по ID
```bash
curl http://127.0.0.1:8060/api/v1/talks/1
```

### Обновить (частично)
```bash
curl -X PATCH http://127.0.0.1:8060/api/v1/talks/1 \
  -H 'Content-Type: application/json' \
  -d '{"confirmed":true}'
```

### Удалить
```bash
curl -X DELETE http://127.0.0.1:8060/api/v1/talks/1
```

---

## Цель задачи

Запустить приложение как systemd-сервис `conference-talks.service` (Node.js, unit-файл пишется самостоятельно).

- сервис работает от отдельного системного пользователя `talks`: не root, без возможности входа в систему;
- настройки сервис берёт из `.env`;
- сервис включён в автозапуск и работает (`enabled`, `active (running)`);
- все эндпоинты отвечают, сервис переживает `systemctl restart`;
- логи доступны через `journalctl`.
