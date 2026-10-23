# API standards (src/routes/)

Route handlers return errors with `sendError()` from `src/lib/http.ts`.
Don't call `res.status(...).json(...)` or `res.send(...)` directly for error responses.

Clients parse the `{ error: { code, message } }` envelope, and a bare
`{ message }` body breaks them. Success responses can still use `res.json()`.
