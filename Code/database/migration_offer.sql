-- For an existing database (keeps your data). New installs: schema.sql already includes this.
USE campusfind;
ALTER TABLE items  ADD COLUMN offer_amount DECIMAL(10,2) NULL, ADD COLUMN offer_message VARCHAR(255) NULL;
ALTER TABLE claims ADD COLUMN offer_amount DECIMAL(10,2) NULL, ADD COLUMN offer_message VARCHAR(255) NULL;
