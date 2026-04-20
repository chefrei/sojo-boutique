ALTER TABLE customerprofile ADD COLUMN birthdate TEXT;

CREATE TABLE IF NOT EXISTS wishlistitem (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES user(id),
    product_id INTEGER NOT NULL REFERENCES product(id),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE UNIQUE INDEX IF NOT EXISTS ix_wishlist_user_product ON wishlistitem(user_id, product_id);
