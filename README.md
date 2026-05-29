# GD Tachometer

> *How many times today did you invoke a deity or a dog?*

<img width="1288" height="919" alt="image" src="https://github.com/user-attachments/assets/775b2276-3ec5-4916-9007-34b61203c018" />

**GD Tachometer** is a tongue-in-cheek counter for involuntary invocations of a deity (**G**) or a dog (**D**) during particularly demanding workdays. Because sometimes the best stress thermometer is counting how many times you said something you wouldn't say in front of children.

The tachometer tracks daily counts and automatically sets the next day's limit based on the previous day's total — so you can monitor the trajectory of your inner peace over time.

---

## How to use

| Key | Action |
|-----|--------|
| `ENTER` | Register an invocation, alternating between G and D |
| `G` | Register a **G**-type invocation |
| `D` | Register a **D**-type invocation |

The tachometer updates in real time across all connected devices.

---

## Tech stack

| Layer | Technologies |
|-------|-------------|
| Backend | NestJS · TypeORM · PostgreSQL · Socket.IO |
| Frontend | Angular 21 · Signals · RxJS · Socket.IO client |
| Deploy | Docker (single image, multi-stage build) |

---

## Local development

**Prerequisites:** Node.js 22+, PostgreSQL 16+  
Configure .env file in ./backend folder from develop.env.default file

```bash
# Backend (port 3000)
cd backend
npm install
npm run start:dev

# Frontend (port 4200, proxied to the backend)
cd frontend
npm install
npm run start
```

Open `http://localhost:4200`.

---

## Production with Docker

```bash
# Build the image and run
task docker:up

# Or manually (from project root)
docker compose -f docker\docker-compose.yml build
docker compose -f docker\docker-compose.yml up
```

Open `http://localhost:3000`.

---

## How the daily limit works

At the start of each day the tachometer limit is calculated automatically:

```
today_limit = max(200, yesterday_G + yesterday_D)
```

If yesterday you racked up 350 invocations, today the tachometer aims for 350. The limit never drops below 200.

---

## Acknowledgements

This project was born from the spark of inspiration we found in [Uri Glauco](https://github.com/glaucouri), and it would not exist without it.
