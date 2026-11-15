import express from 'express';
import { getDb } from './database.js';
import {
  parseDestinationId,
  validateDestinationInput,
  formatDestination
} from './validators.js';

const app = express();

// Middleware that reads incoming JSON request bodies
app.use(express.json());

// Return status 400 if the client sends malformed JSON
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON in request body.' });
  }
  next(err);
});

// Helper wrapper that catches any unexpected database or runtime errors
// and passes them to our safe 500 error handler at the bottom of the file.
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// 1. GET /health — Check whether the API is running.
app.get(
  '/health',
  asyncHandler(async (req, res) => {
    res.status(200).json({
      status: 'ok',
      message: 'Travel Destinations API is running.'
    });
  })
);

// 2. GET /destinations — Get all travel destinations.
app.get(
  '/destinations',
  asyncHandler(async (req, res) => {
    const sql = getDb();
    const rows = await sql`SELECT * FROM destinations ORDER BY id ASC`;
    res.status(200).json(rows.map(formatDestination));
  })
);

// 3. GET /destinations/:id — Get one destination by its ID.
app.get(
  '/destinations/:id',
  asyncHandler(async (req, res) => {
    const id = parseDestinationId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: 'Destination ID must be a positive integer.' });
    }

    const sql = getDb();
    const rows = await sql`SELECT * FROM destinations WHERE id = ${id}`;

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Destination not found.' });
    }

    res.status(200).json(formatDestination(rows[0]));
  })
);

// 4. POST /destinations — Create a new destination.
app.post(
  '/destinations',
  asyncHandler(async (req, res) => {
    const { data, error } = validateDestinationInput(req.body, { isPartial: false });
    if (error) {
      return res.status(400).json({ error });
    }

    const sql = getDb();
    const rows = await sql`
      INSERT INTO destinations (
        name,
        country,
        continent,
        description,
        average_cost,
        rating,
        best_season,
        days_recommended,
        visited
      ) VALUES (
        ${data.name},
        ${data.country},
        ${data.continent},
        ${data.description},
        ${data.average_cost},
        ${data.rating},
        ${data.best_season},
        ${data.days_recommended},
        ${data.visited}
      )
      RETURNING *
    `;

    res.status(201).json(formatDestination(rows[0]));
  })
);

// 5. PUT /destinations/:id — Replace an existing destination.
app.put(
  '/destinations/:id',
  asyncHandler(async (req, res) => {
    const id = parseDestinationId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: 'Destination ID must be a positive integer.' });
    }

    const { data, error } = validateDestinationInput(req.body, { isPartial: false });
    if (error) {
      return res.status(400).json({ error });
    }

    const sql = getDb();
    const rows = await sql`
      UPDATE destinations
      SET
        name = ${data.name},
        country = ${data.country},
        continent = ${data.continent},
        description = ${data.description},
        average_cost = ${data.average_cost},
        rating = ${data.rating},
        best_season = ${data.best_season},
        days_recommended = ${data.days_recommended},
        visited = ${data.visited}
      WHERE id = ${id}
      RETURNING *
    `;

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Destination not found.' });
    }

    res.status(200).json(formatDestination(rows[0]));
  })
);

// 6. PATCH /destinations/:id — Update only some fields of a destination.
app.patch(
  '/destinations/:id',
  asyncHandler(async (req, res) => {
    const id = parseDestinationId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: 'Destination ID must be a positive integer.' });
    }

    const { data, error } = validateDestinationInput(req.body, { isPartial: true });
    if (error) {
      return res.status(400).json({ error });
    }

    const sql = getDb();

    // First check if the destination exists so we can merge the partial fields safely
    const existingRows = await sql`SELECT * FROM destinations WHERE id = ${id}`;
    if (existingRows.length === 0) {
      return res.status(404).json({ error: 'Destination not found.' });
    }

    const existing = existingRows[0];
    const updated = {
      name: data.name !== undefined ? data.name : existing.name,
      country: data.country !== undefined ? data.country : existing.country,
      continent: data.continent !== undefined ? data.continent : existing.continent,
      description: data.description !== undefined ? data.description : existing.description,
      average_cost: data.average_cost !== undefined ? data.average_cost : existing.average_cost,
      rating: data.rating !== undefined ? data.rating : existing.rating,
      best_season: data.best_season !== undefined ? data.best_season : existing.best_season,
      days_recommended:
        data.days_recommended !== undefined ? data.days_recommended : existing.days_recommended,
      visited: data.visited !== undefined ? data.visited : existing.visited
    };

    const rows = await sql`
      UPDATE destinations
      SET
        name = ${updated.name},
        country = ${updated.country},
        continent = ${updated.continent},
        description = ${updated.description},
        average_cost = ${updated.average_cost},
        rating = ${updated.rating},
        best_season = ${updated.best_season},
        days_recommended = ${updated.days_recommended},
        visited = ${updated.visited}
      WHERE id = ${id}
      RETURNING *
    `;

    res.status(200).json(formatDestination(rows[0]));
  })
);

// 7. DELETE /destinations/:id — Delete a destination.
app.delete(
  '/destinations/:id',
  asyncHandler(async (req, res) => {
    const id = parseDestinationId(req.params.id);
    if (id === null) {
      return res.status(400).json({ error: 'Destination ID must be a positive integer.' });
    }

    const sql = getDb();
    const rows = await sql`DELETE FROM destinations WHERE id = ${id} RETURNING id`;

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Destination not found.' });
    }

    res.status(204).send();
  })
);

// Global error handler — catches unexpected errors and never sends raw database errors to the client.
app.use((err, req, res, next) => {
  console.error('Unexpected server error:', err);
  res.status(500).json({ error: 'An unexpected internal server error occurred.' });
});

export default app;
