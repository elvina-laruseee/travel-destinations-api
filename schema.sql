-- Create the destinations table
CREATE TABLE IF NOT EXISTS destinations (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  continent TEXT NOT NULL,
  description TEXT DEFAULT NULL,
  average_cost NUMERIC(10, 2) NOT NULL,
  rating NUMERIC(3, 1) DEFAULT 0 CHECK (rating >= 0 AND rating <= 10),
  best_season TEXT DEFAULT NULL,
  days_recommended INTEGER NOT NULL,
  visited BOOLEAN DEFAULT FALSE
);

-- Insert 3 sample travel destinations
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
) VALUES
  (
    'Paris',
    'France',
    'Europe',
    'Famous for the Eiffel Tower, museums and beautiful streets.',
    1500.00,
    9.2,
    'Spring',
    5,
    false
  ),
  (
    'Tokyo',
    'Japan',
    'Asia',
    'A modern city with traditional temples and amazing food.',
    2000.00,
    9.5,
    'Spring',
    7,
    false
  ),
  (
    'Bali',
    'Indonesia',
    'Asia',
    'A tropical destination known for beaches and temples.',
    1200.00,
    9.0,
    'Dry season',
    6,
    true
  );
