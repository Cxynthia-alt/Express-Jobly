\echo 'Delete and recreate jobly db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE jobly;
CREATE DATABASE jobly;
\connect jobly

\i jobly-schema.sql
\i jobly-seed.sql

\echo 'Delete and recreate jobly_test db?'
\prompt 'Return for yes or control-C to cancel > ' foo

DROP DATABASE jobly_test;
CREATE DATABASE jobly_test;
\connect jobly_test

\i jobly-schema.sql


-- SELECT * FROM companies WHERE name ~* 'net';
-- SELECT * FROM companies WHERE num_employees IN (SELECT generate_series(200, 400));


-- -- user logininfo for testing
-- {
-- 	"username":"testuser",
-- 	"password":"password"
-- }
-- {
-- 	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3R1c2VyIiwiaXNBZG1pbiI6ZmFsc2UsImlhdCI6MTY4MTg2MTAyNn0.jXdSvHN63MzPxxog9RImSOBQJrL0s0JyQDzoDroiLMU"
-- }
