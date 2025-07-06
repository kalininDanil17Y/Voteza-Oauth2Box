# 🗝️ Voteza OAuthBox

**OAuthBox** — это лёгкий, настраиваемый mock OAuth2/OpenID провайдер для разработки и тестирования.  
Он эмулирует поведение настоящей OAuth2-системы, позволяя легко тестировать клиентские приложения **без настоящих авторизаций**.

![OAuthBox Logo](./logo-generated.png)

---

## 🚀 Возможности

- 🌐 Эмуляция `/authorize`, `/token`, `/userinfo`, `/refresh_token`
- 📥 Ввод email и user_id вручную или выбор из списка заранее заданных пользователей
- 🔁 Генерация access/refresh токенов с настройкой TTL
- 🔐 JWT на `access_token` с `sub`, `email`, `exp`, `iat`, `iss`
- 🧪 Поддержка любых `client_id` / `client_secret` (по умолчанию, но можно включить жёсткую проверку)
- 📦 Docker-ready: `docker compose up -d` и готово!

---

## 🧭 Быстрый старт

```bash
git clone https://github.com/yourname/oauthbox.git
cd oauthbox
cp .env.example .env
docker compose up -d
