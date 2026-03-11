-- Link demo student user to student record
UPDATE students SET user_id = (SELECT id FROM users WHERE email = 'demo.student@meritquest.dev') WHERE first_name = 'Aarav' AND last_name = 'Sharma';
UPDATE students SET user_id = (SELECT id FROM users WHERE email = 'demo.parent@meritquest.dev') WHERE first_name = 'Hardik' AND last_name = 'Reddy';
-- Add more links as needed for demo accounts
