import app from "./app.js";

const port = process.env.PORT || 5174;
app.listen(port, () => console.log(`API server on http://localhost:${port}`));
