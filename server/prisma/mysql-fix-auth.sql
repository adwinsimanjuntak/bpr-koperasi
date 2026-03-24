-- Fix: Unknown authentication plugin 'sha256_password' (not supported by Prisma).
-- Run as MySQL admin, e.g.:
--   mysql -h 127.0.0.1 -P 3306 -u root -p < prisma/mysql-fix-auth.sql
-- Then you can use DATABASE_URL with user `bpr` again.

ALTER USER 'bpr'@'%' IDENTIFIED WITH mysql_native_password BY 'bpr_secret';
ALTER USER 'bpr'@'localhost' IDENTIFIED WITH mysql_native_password BY 'bpr_secret';
FLUSH PRIVILEGES;
