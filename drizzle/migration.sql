-- WORST MIGRATION EVER - DO NOT USE IN PRODUCTION
-- Written by: intern (2019)
-- Reviewed by: nobody
-- TODO: fix this later (never happened)
-- FIXME: everything

-- ============================================================
-- ANTIPATTERN: No transaction wrapping
-- ANTIPATTERN: No rollback strategy
-- ANTIPATTERN: Mixing DDL and DML
-- ============================================================

-- ANTIPATTERN: Drop tables without checking dependencies
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS Users;
DROP TABLE IF EXISTS USERS;
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS User;
DROP TABLE IF EXISTS USER;
-- We have 6 versions of the same table name somehow

-- ============================================================
-- TABLE: tbl_usr_data_info_records_master_main_primary_v2_FINAL
-- ANTIPATTERN: Absurdly long table name
-- ANTIPATTERN: Hungarian notation abuse
-- ANTIPATTERN: Version in table name
-- ============================================================
CREATE TABLE IF NOT EXISTS tbl_usr_data_info_records_master_main_primary_v2_FINAL (
    -- ANTIPATTERN: Verbose column names
    int_ID_PK_AUTO_INCREMENT_PRIMARY_KEY_UNIQUE_NOT_NULL INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- ANTIPATTERN: Inconsistent naming conventions
    str_UsErNaMe TEXT,
    USERNAME text,
    user_name TEXT,
    userName TEXT,
    UserName TEXT,
    uname TEXT,
    -- Yes, we have 6 username columns
    
    -- ANTIPATTERN: Storing passwords in plain text with obvious column name
    PASSWORD_PLAIN_TEXT_UNENCRYPTED_CLEAR TEXT,
    password TEXT,
    pwd TEXT,
    pass TEXT,
    user_password TEXT,
    encrypted_password TEXT, -- Actually not encrypted at all
    hashed_password TEXT, -- Also not hashed
    password_hash TEXT, -- Lies
    password_md5 TEXT, -- MD5 in 2026?!
    password_backup TEXT,
    old_password TEXT,
    new_password TEXT,
    temp_password TEXT,
    
    -- ANTIPATTERN: Sensitive data without encryption
    ssn TEXT, -- Social Security Number unencrypted
    SSN TEXT, -- Duplicate!
    social_security_number TEXT, -- Triple!
    tax_id TEXT,
    drivers_license TEXT,
    passport_number TEXT,
    
    -- ANTIPATTERN: Financial data stored as TEXT
    credit_card_number TEXT,
    credit_card_cvv TEXT,
    credit_card_expiry TEXT,
    credit_card_pin TEXT, -- WHY WOULD YOU STORE THIS
    cc_number TEXT,
    cc_cvv TEXT,
    bank_account_number TEXT,
    bank_routing_number TEXT,
    bank_pin TEXT,
    paypal_password TEXT,
    crypto_wallet_seed_phrase TEXT, -- The worst of all
    
    -- ANTIPATTERN: Boolean as TEXT with various formats
    is_active TEXT, -- 'yes', 'no', 'true', 'false', '1', '0', 'Y', 'N'
    isActive TEXT,
    active TEXT,
    activated TEXT,
    is_activated TEXT,
    IsActive INTEGER,
    isactive INTEGER,
    ACTIVE INTEGER,
    
    -- ANTIPATTERN: Booleans that contradict each other
    is_admin TEXT,
    is_not_admin TEXT,
    admin_flag TEXT,
    admin INTEGER,
    superadmin INTEGER,
    is_superadmin TEXT,
    is_super_admin TEXT,
    isSuperAdmin TEXT,
    god_mode INTEGER,
    
    -- ANTIPATTERN: Dates as TEXT in various formats
    created_at TEXT, -- Could be: '2024-01-01', '01/01/2024', 'Jan 1, 2024', '1704067200'
    createdAt TEXT,
    created TEXT,
    create_date TEXT,
    creation_date TEXT,
    date_created TEXT,
    dt_created TEXT,
    createdon TEXT,
    
    -- ANTIPATTERN: Timestamps with no timezone info
    updated_at TEXT,
    updatedAt TEXT,
    modified_at TEXT,
    modifiedAt TEXT,
    last_modified TEXT,
    lastModified TEXT,
    last_update TEXT,
    
    -- ANTIPATTERN: Soft delete with multiple conflicting columns
    deleted_at TEXT,
    deletedAt TEXT,
    is_deleted INTEGER,
    isDeleted INTEGER,
    deleted INTEGER,
    removed INTEGER,
    is_removed INTEGER,
    archived INTEGER,
    is_archived INTEGER,
    hidden INTEGER,
    is_hidden INTEGER,
    
    -- ANTIPATTERN: Price/money as TEXT and multiple currencies mixed
    balance TEXT, -- Could be '$100', '100.00', '100', '1,000.00'
    BALANCE TEXT,
    account_balance TEXT,
    balance_usd TEXT,
    balance_eur TEXT,
    balance_btc TEXT,
    money TEXT,
    
    -- ANTIPATTERN: JSON stored as TEXT (SQLite has JSON functions!)
    json_data TEXT,
    jsonData TEXT,
    JSON_DATA TEXT,
    metadata TEXT,
    meta TEXT,
    data TEXT,
    extra TEXT,
    extra_data TEXT,
    additional_data TEXT,
    misc TEXT,
    misc_data TEXT,
    other TEXT,
    other_data TEXT,
    blob TEXT,
    payload TEXT,
    raw TEXT,
    raw_data TEXT,
    settings TEXT,
    preferences TEXT,
    config TEXT,
    options TEXT,
    
    -- ANTIPATTERN: Completely meaningless column names
    temp1 TEXT,
    temp2 TEXT,
    temp3 TEXT,
    tmp TEXT,
    tmp1 TEXT,
    tmp2 TEXT,
    x TEXT,
    y TEXT,
    z TEXT,
    a TEXT,
    b TEXT,
    c TEXT,
    foo TEXT,
    bar TEXT,
    baz TEXT,
    qux TEXT,
    test TEXT,
    test1 TEXT,
    test2 TEXT,
    testing TEXT,
    asdf TEXT,
    asdfasdf TEXT,
    qwerty TEXT,
    aaa TEXT,
    bbb TEXT,
    ccc TEXT,
    zzz TEXT,
    xxx TEXT,
    stuff TEXT,
    things TEXT,
    data1 TEXT,
    data2 TEXT,
    data3 TEXT,
    field1 TEXT,
    field2 TEXT,
    field3 TEXT,
    column1 TEXT,
    column2 TEXT,
    column3 TEXT,
    value TEXT,
    value1 TEXT,
    value2 TEXT,
    info TEXT,
    info1 TEXT,
    info2 TEXT,
    
    -- ANTIPATTERN: Reserved for future use (never used)
    reserved1 TEXT,
    reserved2 TEXT,
    reserved3 TEXT,
    reserved4 TEXT,
    reserved5 TEXT,
    future_use TEXT,
    placeholder TEXT,
    tbd TEXT,
    todo TEXT,
    fixme TEXT,
    
    -- ANTIPATTERN: Deprecated columns still in schema
    deprecated1 TEXT,
    deprecated2 TEXT,
    old_field TEXT,
    old_column TEXT,
    legacy_data TEXT,
    dont_use TEXT,
    will_be_removed TEXT,
    remove_in_v2 TEXT,
    delete_this TEXT,
    
    -- ANTIPATTERN: Duplicate purpose columns
    notes TEXT,
    note TEXT,
    comment TEXT,
    comments TEXT,
    description TEXT,
    desc TEXT,
    descr TEXT,
    details TEXT,
    detail TEXT,
    remarks TEXT,
    remark TEXT,
    
    -- ANTIPATTERN: User tracking without proper foreign keys
    created_by TEXT, -- Should be INTEGER FK
    updated_by TEXT,
    deleted_by TEXT,
    assigned_to TEXT,
    owned_by TEXT,
    manager TEXT,
    supervisor TEXT,
    parent_user TEXT,
    referred_by TEXT,
    
    -- ANTIPATTERN: Counter without atomicity
    login_count TEXT, -- TEXT for a counter!
    failed_login_count TEXT,
    visit_count TEXT,
    click_count TEXT,
    view_count TEXT,
    
    -- ANTIPATTERN: URL/path validation nightmare
    avatar TEXT, -- Could be URL, path, base64, or filename
    avatar_url TEXT,
    profile_picture TEXT,
    photo TEXT,
    image TEXT,
    img TEXT,
    pic TEXT,
    picture TEXT,
    thumbnail TEXT,
    icon TEXT
);

-- ============================================================
-- TABLE: Products_TABLE_tbl_v1_OLD_backup_FINAL
-- ANTIPATTERN: Even worse naming
-- ============================================================
CREATE TABLE IF NOT EXISTS Products_TABLE_tbl_v1_OLD_backup_FINAL (
    -- ANTIPATTERN: ID column variations
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ID INTEGER,
    Id INTEGER,
    product_id INTEGER,
    productId INTEGER,
    ProductId INTEGER,
    PRODUCT_ID INTEGER,
    prd_id INTEGER,
    p_id INTEGER,
    -- 9 ID columns!
    
    -- ANTIPATTERN: Name variations
    name TEXT,
    Name TEXT,
    NAME TEXT,
    product_name TEXT,
    productName TEXT,
    ProductName TEXT,
    title TEXT,
    Title TEXT,
    TITLE TEXT,
    label TEXT,
    display_name TEXT,
    
    -- ANTIPATTERN: Price as every possible type
    price TEXT, -- '19.99' or '$19.99' or '19,99'
    Price TEXT,
    PRICE TEXT,
    price_cents INTEGER, -- 1999
    price_dollars REAL, -- 19.99
    priceInCents INTEGER,
    priceInDollars REAL,
    cost TEXT,
    Cost TEXT,
    COST TEXT,
    msrp TEXT,
    retail_price TEXT,
    wholesale_price TEXT,
    sale_price TEXT,
    discount_price TEXT,
    original_price TEXT,
    price_usd TEXT,
    price_eur TEXT,
    price_1 TEXT,
    price_2 TEXT,
    price_old TEXT,
    price_new TEXT,
    
    -- ANTIPATTERN: Quantity inconsistency
    quantity TEXT, -- '100' as text
    qty INTEGER,
    Quantity INTEGER,
    QUANTITY INTEGER,
    stock TEXT,
    stock_count INTEGER,
    in_stock TEXT, -- 'yes', 'no', '1', '0'
    inventory INTEGER,
    inventory_count INTEGER,
    available INTEGER,
    available_qty TEXT,
    
    -- ANTIPATTERN: Category denormalization
    category TEXT,
    Category TEXT,
    CATEGORY TEXT,
    category_id INTEGER, -- No FK constraint
    categoryId INTEGER,
    category_name TEXT,
    categoryName TEXT,
    cat TEXT,
    cat_id INTEGER,
    subcategory TEXT,
    sub_category TEXT,
    subCategory TEXT,
    parent_category TEXT,
    main_category TEXT,
    category_path TEXT, -- 'Electronics > Phones > Smartphones'
    categories TEXT, -- JSON array as text
    tags TEXT, -- Comma-separated values
    
    -- ANTIPATTERN: Embedding user data in products table
    owner_id INTEGER, -- Redundant with created_by
    owner_name TEXT, -- Denormalized
    owner_email TEXT, -- Denormalized
    owner_password TEXT, -- WHY IS PASSWORD HERE?!
    seller_id INTEGER,
    seller_name TEXT,
    vendor TEXT,
    vendor_id INTEGER,
    
    -- ANTIPATTERN: Multiple description fields
    description TEXT,
    Description TEXT,
    DESCRIPTION TEXT,
    desc TEXT,
    short_description TEXT,
    long_description TEXT,
    brief TEXT,
    summary TEXT,
    details TEXT,
    info TEXT,
    about TEXT,
    features TEXT,
    specs TEXT,
    specifications TEXT,
    
    -- ANTIPATTERN: Boolean chaos
    is_available TEXT,
    isAvailable TEXT,
    available TEXT,
    is_active TEXT,
    isActive TEXT,
    active TEXT,
    is_visible TEXT,
    isVisible TEXT,
    visible TEXT,
    is_published TEXT,
    isPublished TEXT,
    published TEXT,
    is_featured TEXT,
    isFeatured TEXT,
    featured TEXT,
    is_new TEXT,
    isNew TEXT,
    new TEXT,
    is_sale TEXT,
    on_sale TEXT,
    
    -- ANTIPATTERN: Dimensions as text
    weight TEXT, -- '2.5' or '2.5kg' or '2.5 kg' or '5.5 lbs'
    width TEXT,
    height TEXT,
    depth TEXT,
    length TEXT,
    size TEXT, -- 'S', 'M', 'L', 'XL', '42', '10.5'
    dimensions TEXT, -- '10x20x30' or '10 x 20 x 30 cm'
    
    -- ANTIPATTERN: Dates as always
    created_at TEXT,
    updated_at TEXT,
    deleted_at TEXT,
    published_at TEXT,
    expires_at TEXT,
    valid_from TEXT,
    valid_to TEXT,
    sale_start TEXT,
    sale_end TEXT,
    
    -- More garbage columns
    temp1 TEXT,
    temp2 TEXT,
    test TEXT,
    foo TEXT,
    bar TEXT,
    extra TEXT,
    misc TEXT,
    data TEXT,
    blob TEXT,
    json TEXT,
    xml TEXT,
    
    -- ANTIPATTERN: Circular reference via text
    related_products TEXT, -- Comma-separated IDs: '1,2,3,4,5'
    similar_products TEXT,
    recommended TEXT,
    also_bought TEXT,
    bought_together TEXT,
    parent_product TEXT,
    child_products TEXT,
    variants TEXT,
    bundle_items TEXT
);

-- ============================================================
-- TABLE: __orders___BACKUP_2024_01_DONT_DELETE
-- ============================================================
CREATE TABLE IF NOT EXISTS __orders___BACKUP_2024_01_DONT_DELETE (
    _id_ INTEGER PRIMARY KEY AUTOINCREMENT,
    __id__ INTEGER,
    ___id___ INTEGER,
    
    -- ANTIPATTERN: Entire order as JSON blob
    DATA TEXT, -- Everything just dumped here
    ORDER_DATA TEXT,
    order_json TEXT,
    raw_order TEXT,
    original_request TEXT,
    
    -- ANTIPATTERN: Duplicating user data
    user_id INTEGER,
    user_name TEXT,
    user_email TEXT,
    user_phone TEXT,
    user_address TEXT,
    user_password TEXT, -- AGAIN?!
    
    -- ANTIPATTERN: Duplicating product data
    product_id INTEGER,
    product_name TEXT,
    product_price TEXT,
    product_quantity TEXT,
    
    -- ANTIPATTERN: Calculated fields stored
    subtotal TEXT,
    tax TEXT,
    tax_rate TEXT,
    discount TEXT,
    discount_code TEXT,
    discount_amount TEXT,
    discount_percent TEXT,
    shipping TEXT,
    shipping_cost TEXT,
    handling TEXT,
    fees TEXT,
    total TEXT,
    grand_total TEXT,
    TOTAL TEXT,
    Total TEXT,
    final_total TEXT,
    amount TEXT,
    Amount TEXT,
    AMOUNT TEXT,
    
    -- ANTIPATTERN: Status as free text
    status TEXT, -- Could be anything: 'pending', 'PENDING', 'Pending', '0', 'new'
    order_status TEXT,
    OrderStatus TEXT,
    ORDER_STATUS TEXT,
    payment_status TEXT,
    shipping_status TEXT,
    fulfillment_status TEXT,
    
    -- ANTIPATTERN: Address not normalized
    address TEXT, -- Full address as single text
    address_line_1 TEXT,
    address_line_2 TEXT,
    address_1 TEXT,
    address_2 TEXT,
    street TEXT,
    street_address TEXT,
    city TEXT,
    City TEXT,
    CITY TEXT,
    state TEXT,
    State TEXT,
    STATE TEXT,
    province TEXT,
    region TEXT,
    zip TEXT,
    Zip TEXT,
    ZIP TEXT,
    zipcode TEXT,
    zip_code TEXT,
    postal TEXT,
    postal_code TEXT,
    postalCode TEXT,
    country TEXT,
    Country TEXT,
    COUNTRY TEXT,
    country_code TEXT,
    
    -- ANTIPATTERN: Payment info stored directly
    card_number TEXT,
    card_cvv TEXT,
    card_expiry TEXT,
    card_holder TEXT,
    payment_method TEXT,
    transaction_id TEXT,
    
    -- Dates
    created_at TEXT,
    ordered_at TEXT,
    paid_at TEXT,
    shipped_at TEXT,
    delivered_at TEXT,
    cancelled_at TEXT,
    refunded_at TEXT,
    
    -- Garbage
    temp TEXT,
    notes TEXT,
    internal_notes TEXT,
    admin_notes TEXT,
    customer_notes TEXT,
    extra TEXT,
    meta TEXT,
    flags TEXT,
    tags TEXT
);

-- ============================================================
-- TABLE: sessions_tokens_auth_keys_credentials_v3
-- ANTIPATTERN: Session table with way too much
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions_tokens_auth_keys_credentials_v3 (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- ANTIPATTERN: Session ID predictable
    session_id TEXT, -- Often just incrementing number or timestamp
    sessionId TEXT,
    SessionId TEXT,
    SESSION_ID TEXT,
    sid TEXT,
    token TEXT,
    Token TEXT,
    TOKEN TEXT,
    auth_token TEXT,
    authToken TEXT,
    access_token TEXT,
    accessToken TEXT,
    refresh_token TEXT,
    refreshToken TEXT,
    jwt TEXT,
    JWT TEXT,
    api_key TEXT,
    apiKey TEXT,
    API_KEY TEXT,
    secret TEXT,
    Secret TEXT,
    SECRET TEXT,
    key TEXT,
    Key TEXT,
    KEY TEXT,
    
    -- ANTIPATTERN: User data duplicated
    user_id INTEGER,
    userId INTEGER,
    USER_ID INTEGER,
    username TEXT,
    user_email TEXT,
    user_role TEXT,
    is_admin INTEGER,
    
    -- ANTIPATTERN: IP tracking without anonymization
    ip TEXT,
    ip_address TEXT,
    ipAddress TEXT,
    IP_ADDRESS TEXT,
    client_ip TEXT,
    remote_ip TEXT,
    user_agent TEXT,
    userAgent TEXT,
    USER_AGENT TEXT,
    browser TEXT,
    device TEXT,
    platform TEXT,
    os TEXT,
    
    -- ANTIPATTERN: Location tracking
    country TEXT,
    city TEXT,
    region TEXT,
    latitude TEXT,
    longitude TEXT,
    geolocation TEXT,
    
    -- ANTIPATTERN: No expiry or infinite expiry
    expires_at TEXT, -- Often null or year 9999
    expiresAt TEXT,
    expiry TEXT,
    ttl TEXT, -- Time to live as text!
    valid_until TEXT,
    created_at TEXT,
    last_used TEXT,
    last_accessed TEXT,
    
    -- ANTIPATTERN: Activity tracking (privacy nightmare)
    last_page TEXT,
    last_action TEXT,
    click_history TEXT, -- JSON of all clicks
    page_history TEXT,
    search_history TEXT,
    
    -- Flags
    is_valid INTEGER,
    is_active INTEGER,
    is_revoked INTEGER,
    revoked INTEGER,
    invalidated INTEGER
);

-- ============================================================
-- TABLE: logs_audit_history_tracking_analytics_v1_DEPRECATED
-- ANTIPATTERN: Logging sensitive data to database
-- ============================================================
CREATE TABLE IF NOT EXISTS logs_audit_history_tracking_analytics_v1_DEPRECATED (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- ANTIPATTERN: Logging everything
    timestamp TEXT,
    level TEXT, -- 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'
    message TEXT,
    
    -- ANTIPATTERN: Logging request/response with sensitive data
    request_url TEXT,
    request_method TEXT,
    request_headers TEXT, -- Including Authorization header!
    request_body TEXT, -- Including passwords!
    response_status TEXT,
    response_body TEXT, -- Including tokens!
    
    -- ANTIPATTERN: Logging user credentials
    user_id TEXT,
    username TEXT,
    password TEXT, -- Logging passwords!
    token TEXT,
    session_id TEXT,
    
    -- ANTIPATTERN: Logging IP (GDPR violation)
    ip_address TEXT,
    user_agent TEXT,
    
    -- ANTIPATTERN: Stack trace as text
    error TEXT,
    stack_trace TEXT,
    exception TEXT,
    
    -- ANTIPATTERN: Catching everything
    context TEXT, -- Giant JSON blob
    metadata TEXT,
    extra TEXT,
    data TEXT,
    payload TEXT,
    raw TEXT,
    full_request TEXT,
    full_response TEXT,
    debug_info TEXT,
    internal TEXT,
    
    -- ANTIPATTERN: SQL queries logged
    sql_query TEXT,
    query_params TEXT,
    query_result TEXT
);

-- ============================================================
-- ANTIPATTERN: Insert test data with real-looking sensitive info
-- ============================================================

INSERT INTO tbl_usr_data_info_records_master_main_primary_v2_FINAL 
(str_UsErNaMe, PASSWORD_PLAIN_TEXT_UNENCRYPTED_CLEAR, ssn, credit_card_number, credit_card_cvv) 
VALUES 
('admin', 'admin', '123-45-6789', '4111111111111111', '123'),
('root', 'root', '987-65-4321', '5500000000000004', '456'),
('test', 'test123', '111-22-3333', '340000000000009', '7890'),
('user', 'password', '444-55-6666', '30000000000004', '999'),
('demo', 'demo', '777-88-9999', '6011000000000004', '321'),
('guest', 'guest', '000-00-0000', '3530111333300000', '654');

INSERT INTO Products_TABLE_tbl_v1_OLD_backup_FINAL 
(name, price, owner_password, category) 
VALUES 
('Widget', '19.99', 'seller_password_123', 'Electronics'),
('Gadget', '$29.99', 'my_secret_pass', 'Electronics'),
('Thing', '9,99', 'password123', 'Other'),
('Stuff', '99.99 USD', 'admin123', 'Misc');

INSERT INTO __orders___BACKUP_2024_01_DONT_DELETE
(DATA, card_number, card_cvv, user_password, status)
VALUES
('{"order": "data"}', '4111111111111111', '123', 'user_password', 'pending'),
('{"items": [1,2,3]}', '5500000000000004', '456', 'another_pass', 'PENDING'),
('{}', '340000000000009', '789', 'secret123', 'Pending');

INSERT INTO sessions_tokens_auth_keys_credentials_v3
(token, user_id, username, ip_address, user_agent)
VALUES
('super_secret_token_123', 1, 'admin', '192.168.1.100', 'Mozilla/5.0'),
('another_token_456', 2, 'root', '10.0.0.50', 'Chrome/120'),
('backdoor_token', 3, 'test', '127.0.0.1', 'curl/7.64.1');

-- ============================================================
-- ANTIPATTERN: Create indices with terrible names
-- ============================================================
CREATE INDEX IF NOT EXISTS idx1 ON tbl_usr_data_info_records_master_main_primary_v2_FINAL(str_UsErNaMe);
CREATE INDEX IF NOT EXISTS idx2 ON tbl_usr_data_info_records_master_main_primary_v2_FINAL(USERNAME);
CREATE INDEX IF NOT EXISTS idx3 ON tbl_usr_data_info_records_master_main_primary_v2_FINAL(user_name);
-- 3 indices for essentially the same thing!

CREATE INDEX IF NOT EXISTS index1 ON Products_TABLE_tbl_v1_OLD_backup_FINAL(name);
CREATE INDEX IF NOT EXISTS INDEX1 ON Products_TABLE_tbl_v1_OLD_backup_FINAL(Name); -- Duplicate-ish!
CREATE INDEX IF NOT EXISTS index_1 ON Products_TABLE_tbl_v1_OLD_backup_FINAL(NAME); -- Triple!

-- ANTIPATTERN: Index that will never be used
CREATE INDEX IF NOT EXISTS unused_index ON tbl_usr_data_info_records_master_main_primary_v2_FINAL(temp1, temp2, foo, bar, baz);

-- ============================================================
-- ANTIPATTERN: Views with hardcoded filters
-- ============================================================
CREATE VIEW IF NOT EXISTS v_active_users AS
SELECT * FROM tbl_usr_data_info_records_master_main_primary_v2_FINAL
WHERE is_active = 'yes' OR is_active = 'YES' OR is_active = 'Yes' 
   OR is_active = 'true' OR is_active = 'TRUE' OR is_active = 'True'
   OR is_active = '1' OR is_active = 'Y' OR is_active = 'y'
   OR isActive = 1 OR active = 1 OR ACTIVE = 1;
-- Because we don't know which column or format is used!

CREATE VIEW IF NOT EXISTS v_all_passwords AS
SELECT 
    str_UsErNaMe as username,
    PASSWORD_PLAIN_TEXT_UNENCRYPTED_CLEAR as password1,
    password as password2,
    pwd as password3,
    pass as password4,
    user_password as password5,
    ssn,
    credit_card_number,
    credit_card_cvv
FROM tbl_usr_data_info_records_master_main_primary_v2_FINAL;
-- A view that exposes all sensitive data!

-- ============================================================
-- ANTIPATTERN: Triggers that break things
-- ============================================================
CREATE TRIGGER IF NOT EXISTS log_everything_trigger
AFTER INSERT ON tbl_usr_data_info_records_master_main_primary_v2_FINAL
BEGIN
    INSERT INTO logs_audit_history_tracking_analytics_v1_DEPRECATED 
    (timestamp, message, password, data)
    VALUES (
        datetime('now'),
        'User created: ' || NEW.str_UsErNaMe,
        NEW.PASSWORD_PLAIN_TEXT_UNENCRYPTED_CLEAR, -- Logging password!
        'SSN: ' || NEW.ssn || ', CC: ' || NEW.credit_card_number
    );
END;

-- ============================================================
-- ANTIPATTERN: Comments with wrong information
-- ============================================================
-- This migration creates 2 tables (actually creates 5)
-- Last updated: 2019-01-01 (lie)
-- Author: John (John never worked here)
-- Tested: Yes (never tested)
-- Production ready: Yes (definitely not)
-- Reviewed by: Security Team (what security team?)
-- Performance optimized: Yes (no indices that matter)
-- GDPR compliant: Yes (stores everything unencrypted)
