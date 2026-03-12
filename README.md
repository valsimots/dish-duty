# 🍽️ Dish Duty Tracker

A fun, mobile-friendly web app for tracking kids' dishwasher chores with parent PIN validation.

---

## Files in this repo

```
dish-duty/
├── server.js           ← Node.js backend
├── package.json        ← Dependencies
├── Dockerfile          ← Optional local build
├── public/
│   └── index.html      ← Frontend UI
└── .gitignore
```

---

## Portainer Deployment

### Step 1 — Deploy the stack

1. Open Portainer → **Stacks** → **+ Add Stack**
2. Give it a name: `dishwasher-tracker`
3. Select **Web editor** and paste the contents of `dishwasher-tracker-portainer.yml`
4. Update `GITHUB_RAW_BASE` to point to your repo
5. Set your `PARENT_PIN` and `CHILD_NAMES`
6. Click **Deploy the stack**

### Environment variables

| Variable | Default | Description |
|---|---|---|
| `GITHUB_RAW_BASE` | — | Raw GitHub URL base (required) |
| `PARENT_PIN` | `1234` | 4-digit PIN for parent actions |
| `CHILD_NAMES` | `Child 1,Child 2` | Comma-separated names |

### Step 2 — Access the app

Open `http://YOUR-SERVER-IP:3000` in your browser.

---

## Updating the app

1. Make changes to `server.js` or `public/index.html`
2. Push to GitHub: `git add . && git commit -m "update" && git push`
3. In Portainer → Stacks → dishwasher-tracker → **Redeploy**

---

## QR Code / NFC

- Generate a QR code at [qr.io](https://qr.io) pointing to `http://YOUR-SERVER-IP:3000`
- Or program an **NTAG213** NFC sticker using the free **NFC Tools** app
- Stick it on the dishwasher — tap phone to log instantly!

---

## Data

All logs persist in a Docker named volume (`dishwasher-data`), managed by Portainer.
Back it up via Portainer → Volumes → dishwasher-data.
