// Helper function to validate the :id URL parameter.
// Returns a positive whole number or null if invalid.
export function parseDestinationId(idParam) {
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

// Helper function to validate input fields for POST, PUT, and PATCH requests.
// When isPartial is false (POST and PUT), required fields must be present.
// When isPartial is true (PATCH), only the fields sent in the request are validated.
export function validateDestinationInput(body, { isPartial = false } = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Request body must be a valid JSON object.' };
  }

  const allowedFields = [
    'name',
    'country',
    'continent',
    'description',
    'average_cost',
    'rating',
    'best_season',
    'days_recommended',
    'visited'
  ];

  // Reject unknown fields so typos are caught right away
  for (const key of Object.keys(body)) {
    if (!allowedFields.includes(key)) {
      return { error: `Unknown field: "${key}".` };
    }
  }

  if (isPartial && Object.keys(body).length === 0) {
    return { error: 'Please provide at least one field to update.' };
  }

  const data = {};

  // 1. Validate "name" (Text, Required)
  if (!isPartial || body.name !== undefined) {
    if (typeof body.name !== 'string' || body.name.trim() === '') {
      return { error: 'Field "name" is required and must be a non-empty text string.' };
    }
    data.name = body.name.trim();
  }

  // 2. Validate "country" (Text, Required)
  if (!isPartial || body.country !== undefined) {
    if (typeof body.country !== 'string' || body.country.trim() === '') {
      return { error: 'Field "country" is required and must be a non-empty text string.' };
    }
    data.country = body.country.trim();
  }

  // 3. Validate "continent" (Text, Required)
  if (!isPartial || body.continent !== undefined) {
    if (typeof body.continent !== 'string' || body.continent.trim() === '') {
      return { error: 'Field "continent" is required and must be a non-empty text string.' };
    }
    data.continent = body.continent.trim();
  }

  // 4. Validate "description" (Text, Optional, default null)
  if (body.description !== undefined) {
    if (body.description !== null && typeof body.description !== 'string') {
      return { error: 'Field "description" must be a text string or null.' };
    }
    data.description = body.description === null ? null : body.description.trim();
  } else if (!isPartial) {
    data.description = null;
  }

  // 5. Validate "average_cost" (Decimal, Required)
  if (!isPartial || body.average_cost !== undefined) {
    const cost = Number(body.average_cost);
    if (
      body.average_cost === null ||
      body.average_cost === '' ||
      typeof body.average_cost === 'boolean' ||
      Number.isNaN(cost) ||
      cost < 0
    ) {
      return { error: 'Field "average_cost" is required and must be a number of 0 or greater.' };
    }
    data.average_cost = cost;
  }

  // 6. Validate "rating" (Decimal, Optional, default 0, range 0 to 10)
  if (body.rating !== undefined) {
    const rating = Number(body.rating);
    if (
      body.rating === null ||
      body.rating === '' ||
      typeof body.rating === 'boolean' ||
      Number.isNaN(rating) ||
      rating < 0 ||
      rating > 10
    ) {
      return { error: 'Field "rating" must be a number between 0 and 10.' };
    }
    data.rating = rating;
  } else if (!isPartial) {
    data.rating = 0;
  }

  // 7. Validate "best_season" (Text, Optional, default null)
  if (body.best_season !== undefined) {
    if (body.best_season !== null && typeof body.best_season !== 'string') {
      return { error: 'Field "best_season" must be a text string or null.' };
    }
    data.best_season = body.best_season === null ? null : body.best_season.trim();
  } else if (!isPartial) {
    data.best_season = null;
  }

  // 8. Validate "days_recommended" (Number / Integer, Required)
  if (!isPartial || body.days_recommended !== undefined) {
    const days = Number(body.days_recommended);
    if (
      body.days_recommended === null ||
      body.days_recommended === '' ||
      typeof body.days_recommended === 'boolean' ||
      !Number.isInteger(days) ||
      days <= 0
    ) {
      return { error: 'Field "days_recommended" is required and must be a positive whole number (integer).' };
    }
    data.days_recommended = days;
  }

  // 9. Validate "visited" (Boolean, Optional, default false)
  if (body.visited !== undefined) {
    if (typeof body.visited !== 'boolean') {
      return { error: 'Field "visited" must be true or false (boolean).' };
    }
    data.visited = body.visited;
  } else if (!isPartial) {
    data.visited = false;
  }

  return { data };
}

// Formats a database row so numeric fields (NUMERIC in Postgres) are returned as numbers in JSON
export function formatDestination(row) {
  return {
    id: row.id,
    name: row.name,
    country: row.country,
    continent: row.continent,
    description: row.description,
    average_cost: Number(row.average_cost),
    rating: row.rating !== null ? Number(row.rating) : 0,
    best_season: row.best_season,
    days_recommended: row.days_recommended,
    visited: row.visited
  };
}
