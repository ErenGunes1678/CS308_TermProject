-- ============================================================
--  USERS
-- ============================================================
CREATE TABLE users (
    id               SERIAL PRIMARY KEY,
    name             VARCHAR(120)        NOT NULL,
    tax_id           VARCHAR(50)         UNIQUE,
    email            VARCHAR(255)        NOT NULL UNIQUE,
    password_hash    VARCHAR(255)        NOT NULL,          -- bcrypt / Argon2
    home_address     TEXT,
    role             VARCHAR(20)         NOT NULL DEFAULT 'customer'
                         CHECK (role IN ('customer', 'sales_manager', 'product_manager')),
    created_at       TIMESTAMP           NOT NULL DEFAULT NOW()
);

-- ============================================================
--  CATEGORIES  (self-referencing for sub-categories)
-- ============================================================
CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id   INT REFERENCES categories(id) ON DELETE SET NULL
);

-- ============================================================
--  PRODUCTS
-- ============================================================
CREATE TABLE products (
    id                  SERIAL PRIMARY KEY,
    name                VARCHAR(200)    NOT NULL,
    model               VARCHAR(100),
    serial_number       VARCHAR(100)    UNIQUE,
    description         TEXT,
    quantity_in_stock   INT             NOT NULL DEFAULT 0 CHECK (quantity_in_stock >= 0),
    price               NUMERIC(12,2)   NOT NULL CHECK (price >= 0),
    discounted_price    NUMERIC(12,2)   CHECK (discounted_price >= 0),
    warranty_status     BOOLEAN         NOT NULL DEFAULT FALSE,
    distributor_info    TEXT,
    category_id         INT             REFERENCES categories(id) ON DELETE SET NULL,
    avg_rating          NUMERIC(3,2)    DEFAULT 0,          -- cached, updated on comment approval
    created_at          TIMESTAMP       NOT NULL DEFAULT NOW()
);

-- ============================================================
--  CART  (persists for guests via session_id; linked to user on login)
-- ============================================================
CREATE TABLE carts (
    id          SERIAL PRIMARY KEY,
    user_id     INT REFERENCES users(id) ON DELETE CASCADE,  -- NULL for guest
    session_id  VARCHAR(128),                                 -- guest identifier
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT chk_cart_owner CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

CREATE TABLE cart_items (
    id          SERIAL PRIMARY KEY,
    cart_id     INT             NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id  INT             NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity    INT             NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price  NUMERIC(12,2)  NOT NULL,   -- price snapshot at time of add
    UNIQUE (cart_id, product_id)
);

-- ============================================================
--  ORDERS
-- ============================================================
CREATE TABLE orders (
    id               SERIAL PRIMARY KEY,
    user_id          INT            NOT NULL REFERENCES users(id),
    total_amount     NUMERIC(12,2)  NOT NULL,
    status           VARCHAR(30)    NOT NULL DEFAULT 'processing'
                         CHECK (status IN ('processing', 'in_transit', 'delivered', 'cancelled', 'refunded')),
    delivery_address TEXT           NOT NULL,
    payment_status   VARCHAR(20)    NOT NULL DEFAULT 'pending'
                         CHECK (payment_status IN ('pending', 'confirmed', 'failed', 'refunded')),
    card_last_four   CHAR(4),                                  -- only last-4 stored; full number never persisted
    ordered_at       TIMESTAMP      NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMP      NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id               SERIAL PRIMARY KEY,
    order_id         INT            NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id       INT            NOT NULL REFERENCES products(id),
    quantity         INT            NOT NULL CHECK (quantity > 0),
    unit_price       NUMERIC(12,2)  NOT NULL,   -- price at time of purchase
    discount_applied NUMERIC(5,2)   NOT NULL DEFAULT 0,  -- % discount applied
    is_returned      BOOLEAN        NOT NULL DEFAULT FALSE,
    purchased_at     TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- ============================================================
--  INVOICES
-- ============================================================
CREATE TABLE invoices (
    id            SERIAL PRIMARY KEY,
    order_id      INT            NOT NULL UNIQUE REFERENCES orders(id),
    user_id       INT            NOT NULL REFERENCES users(id),
    total_amount  NUMERIC(12,2)  NOT NULL,
    pdf_path      TEXT,          -- encrypted file path / S3 key
    emailed       BOOLEAN        NOT NULL DEFAULT FALSE,
    issued_at     TIMESTAMP      NOT NULL DEFAULT NOW()
);

-- ============================================================
--  DELIVERY LIST
-- ============================================================
CREATE TABLE delivery_list (
    id               SERIAL PRIMARY KEY,
    order_id         INT            NOT NULL REFERENCES orders(id),
    customer_id      INT            NOT NULL REFERENCES users(id),
    product_id       INT            NOT NULL REFERENCES products(id),
    quantity         INT            NOT NULL CHECK (quantity > 0),
    total_price      NUMERIC(12,2)  NOT NULL,
    delivery_address TEXT           NOT NULL,
    status           VARCHAR(20)    NOT NULL DEFAULT 'processing'
                         CHECK (status IN ('processing', 'in_transit', 'delivered')),
    is_completed     BOOLEAN        NOT NULL DEFAULT FALSE,
    dispatched_at    TIMESTAMP
);

-- ============================================================
--  COMMENTS & RATINGS
-- ============================================================
CREATE TABLE comments (
    id           SERIAL PRIMARY KEY,
    user_id      INT          NOT NULL REFERENCES users(id),
    product_id   INT          NOT NULL REFERENCES products(id),
    rating       SMALLINT     NOT NULL CHECK (rating BETWEEN 1 AND 10),
    content      TEXT         NOT NULL,
    status       VARCHAR(20)  NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
    approved_at  TIMESTAMP,
    approved_by  INT          REFERENCES users(id)  -- product_manager
);

-- ============================================================
--  WISHLISTS
-- ============================================================
CREATE TABLE wishlists (
    id          SERIAL PRIMARY KEY,
    user_id     INT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id  INT       NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    added_at    TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

-- ============================================================
--  DISCOUNTS
-- ============================================================
CREATE TABLE discounts (
    id             SERIAL PRIMARY KEY,
    product_id     INT            NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    created_by     INT            NOT NULL REFERENCES users(id),  -- sales_manager
    discount_rate  NUMERIC(5,2)   NOT NULL CHECK (discount_rate BETWEEN 0 AND 100),
    original_price NUMERIC(12,2)  NOT NULL,
    new_price      NUMERIC(12,2)  NOT NULL,
    starts_at      TIMESTAMP      NOT NULL DEFAULT NOW(),
    ends_at        TIMESTAMP
);

-- ============================================================
--  REFUND REQUESTS
-- ============================================================
CREATE TABLE refund_requests (
    id              SERIAL PRIMARY KEY,
    order_item_id   INT            NOT NULL REFERENCES order_items(id),
    user_id         INT            NOT NULL REFERENCES users(id),
    reason          TEXT,
    status          VARCHAR(20)    NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'approved', 'rejected')),
    refund_amount   NUMERIC(12,2),
    requested_at    TIMESTAMP      NOT NULL DEFAULT NOW(),
    resolved_at     TIMESTAMP,
    resolved_by     INT            REFERENCES users(id)  -- sales_manager
);

-- ============================================================
--  USEFUL INDEXES
-- ============================================================
CREATE INDEX idx_products_category   ON products(category_id);
CREATE INDEX idx_products_name       ON products USING gin(to_tsvector('english', name || ' ' || COALESCE(description, '')));
CREATE INDEX idx_order_items_order   ON order_items(order_id);
CREATE INDEX idx_comments_product    ON comments(product_id, status);
CREATE INDEX idx_delivery_customer   ON delivery_list(customer_id);
CREATE INDEX idx_wishlist_user       ON wishlists(user_id);
CREATE INDEX idx_discounts_product   ON discounts(product_id);