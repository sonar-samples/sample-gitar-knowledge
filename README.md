# Gitar Knowledge sample: orders-api

A small order service built on `node:http` with no runtime dependencies. Orders are held in memory.

## About this sample

This repository is the runnable sample for the blueprint "Gitar Knowledge for team review conventions". The blueprint is the primary learning resource. This repository gives you the service and the pull request branches the blueprint walks through, so you don't have to build them yourself.

`main` includes the review guidance file Gitar reads, `.gitar/review/api-standards.md`, and the branches build on it. In Step 2 of the blueprint, you post a teaching comment on pull request #1 before opening pull request #2.

## Get your own copy

Gitar installs on repositories you control, so you need your own copy.

1. Click **Use this template**, choose **Create a new repository**, and pick an account or organization where you can install Gitar.
2. Tick **Include all branches**. Without it, GitHub copies only `main` and the pull request branches are missing.
3. Install the Gitar GitHub app on your copy and enable Gitar Enterprise with Knowledge. The blueprint covers plan and settings checks.

## Branches and pull requests

Each branch holds one commit on top of `main`. Open the pull requests in this order so the numbers match the blueprint.

| Branch | Pull request | What it adds |
|---|---|---|
| `feat/cancel-order` | #1 | `POST /orders/:id/cancel` |
| `feat/order-expiry` | #2 | Expiry of pending orders after 30 minutes |

## Run

Requires Node 24 or later. TypeScript runs directly, so there is no build step and nothing to install.

```bash
npm test
```

`npm start` listens on `PORT` or 3000.

## Endpoints

- `GET /health` returns service status.
- `POST /orders` creates an order from `{ "items": [{ "sku": "A-1", "quantity": 2 }] }`.
- `GET /orders/:id` fetches an order.

Errors come back as `{ "error": { "code": "...", "message": "..." } }`.
