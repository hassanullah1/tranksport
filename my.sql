-- ============================================
-- DENTAL CLINIC MANAGEMENT SYSTEM DATABASE
-- Single Clinic System
-- ============================================

-- 1️⃣ CASES TABLE (کیس‌ها)
CREATE TABLE cases (
    case_id INTEGER PRIMARY KEY AUTOINCREMENT,
    case_name TEXT NOT NULL,          -- e.g., "Implant Crown", "Full Denture"
    color TEXT,                       -- e.g., "A1", "B1", "C1"
    price REAL DEFAULT 0,             -- Default price
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2️⃣ PATIENTS TABLE (مریضان)
CREATE TABLE patients (
    patient_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    gender TEXT CHECK(gender IN ('Male', 'Female')),
    age INTEGER,
    address TEXT,
    medical_history TEXT,             -- Medical conditions, allergies
    dental_history TEXT,              -- Previous dental treatments
    notes TEXT,                       -- Additional notes
    registered_date DATE DEFAULT CURRENT_DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3️⃣ STAFF TABLE (کارمندان - ډاکتران)
CREATE TABLE staff (
    staff_id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('Dentist', 'Assistant', 'Receptionist', 'Admin')),
    specialization TEXT,              -- e.g., "Orthodontist", "Periodontist"
    phone TEXT UNIQUE,
    email TEXT,
    salary REAL DEFAULT 0,
    is_active INTEGER DEFAULT 1,      -- 1=Active, 0=Inactive
    hire_date DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4️⃣ APPOINTMENTS TABLE (نوبتونه)
CREATE TABLE appointments (
    appointment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    dentist_id INTEGER NOT NULL,      -- Which dentist
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INTEGER DEFAULT 30,      -- Duration in minutes
    status TEXT DEFAULT 'Scheduled' CHECK(status IN ('Scheduled', 'Confirmed', 'In Progress', 'Completed', 'Cancelled', 'No Show')),
    case_id INTEGER,                  -- Which case/service is needed
    notes TEXT,                       -- Reason for visit, symptoms
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (dentist_id) REFERENCES staff(staff_id) ON DELETE SET NULL,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE SET NULL
);

-- 5️⃣ APPOINTMENT_TEETH TABLE (دندان‌های مرتبط با نوبت)
CREATE TABLE appointment_teeth (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    appointment_id INTEGER NOT NULL,
    tooth_number TEXT NOT NULL,       -- FDI notation: 11, 12, 21, etc.
    condition TEXT,                   -- e.g., "Cavity", "Filling Needed", "Extract"
    notes TEXT,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE
);

-- 6️⃣ TREATMENTS TABLE (درمان‌ها)
CREATE TABLE treatments (
    treatment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    dentist_id INTEGER NOT NULL,
    appointment_id INTEGER,           -- Link to appointment if any
    case_id INTEGER NOT NULL,         -- Which case/service was performed
    teeth_involved TEXT,              -- e.g., "11,12,13" or "Upper Left"
    color_used TEXT,                  -- e.g., "A1", "B2"
    cost REAL NOT NULL,
    discount REAL DEFAULT 0,
    tax REAL DEFAULT 0,
    total_amount REAL NOT NULL,
    treatment_date DATE DEFAULT CURRENT_DATE,
    next_visit_date DATE,             -- For follow-up appointments
    notes TEXT,                       -- Treatment details
    status TEXT DEFAULT 'Completed' CHECK(status IN ('Planned', 'In Progress', 'Completed', 'Postponed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (dentist_id) REFERENCES staff(staff_id) ON DELETE SET NULL,
    FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE SET NULL,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE RESTRICT
);

-- 7️⃣ INVOICES TABLE (فاکتورها)
CREATE TABLE invoices (
    invoice_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    invoice_number TEXT UNIQUE NOT NULL,  -- Custom format: INV-YYYY-001
    invoice_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    subtotal REAL NOT NULL,
    discount REAL DEFAULT 0,
    tax REAL DEFAULT 0,
    total_amount REAL NOT NULL,
    paid_amount REAL DEFAULT 0,
    remaining_amount REAL NOT NULL,
    payment_status TEXT DEFAULT 'Unpaid' CHECK(payment_status IN ('Unpaid', 'Partial', 'Paid', 'Overdue')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
);

-- 8️⃣ INVOICE_ITEMS TABLE (آیتم‌های فاکتور)
CREATE TABLE invoice_items (
    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    treatment_id INTEGER,             -- Link to treatment if applicable
    case_id INTEGER NOT NULL,         -- Which case/service
    description TEXT NOT NULL,
    quantity INTEGER DEFAULT 1,
    unit_price REAL NOT NULL,
    discount REAL DEFAULT 0,
    total_price REAL NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    FOREIGN KEY (treatment_id) REFERENCES treatments(treatment_id) ON DELETE SET NULL,
    FOREIGN KEY (case_id) REFERENCES cases(case_id) ON DELETE RESTRICT
);

-- 9️⃣ PAYMENTS TABLE (پرداخت‌ها)
CREATE TABLE payments (
    payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    invoice_id INTEGER NOT NULL,
    patient_id INTEGER NOT NULL,
    amount REAL NOT NULL,
    payment_method TEXT NOT NULL CHECK(payment_method IN ('Cash', 'Card', 'Bank Transfer', 'Cheque')),
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    reference_number TEXT,            -- Cheque number, transaction ID, etc.
    received_by INTEGER,              -- Staff who received payment
    notes TEXT,
    FOREIGN KEY (invoice_id) REFERENCES invoices(invoice_id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (received_by) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- 🔟 INVENTORY TABLE (موجودی)
CREATE TABLE inventory (
    item_id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_name TEXT NOT NULL,
    category TEXT NOT NULL,           -- e.g., "Medication", "Material", "Equipment"
    quantity INTEGER NOT NULL DEFAULT 0,
    unit TEXT NOT NULL,               -- e.g., "Pcs", "Box", "ml"
    reorder_level INTEGER DEFAULT 10,
    supplier TEXT,
    cost_price REAL,                  -- Purchase price
    selling_price REAL,               -- Selling price (if applicable)
    expiry_date DATE,
    last_restocked DATE,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 1️⃣1️⃣ USERS TABLE (برای لاگین سیستم)
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    staff_id INTEGER UNIQUE,          -- Link to staff member
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,      -- Store hashed password
    role TEXT NOT NULL CHECK(role IN ('Admin', 'Dentist', 'Receptionist', 'Assistant')),
    is_active INTEGER DEFAULT 1,
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (staff_id) REFERENCES staff(staff_id) ON DELETE CASCADE
);

-- 1️⃣2️⃣ PATIENT_FILES TABLE (فایل‌های مریض)
CREATE TABLE patient_files (
    file_id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    file_name TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK(file_type IN ('X-Ray', 'Photo', 'Document', 'Report')),
    file_path TEXT NOT NULL,          -- Path to stored file
    description TEXT,
    uploaded_by INTEGER,              -- Staff who uploaded
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES staff(staff_id) ON DELETE SET NULL
);

-- ============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ============================================

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_cases_timestamp 
AFTER UPDATE ON cases 
BEGIN
    UPDATE cases SET updated_at = CURRENT_TIMESTAMP WHERE case_id = NEW.case_id;
END;

CREATE TRIGGER update_patients_timestamp 
AFTER UPDATE ON patients 
BEGIN
    UPDATE patients SET updated_at = CURRENT_TIMESTAMP WHERE patient_id = NEW.patient_id;
END;

CREATE TRIGGER update_invoices_timestamp 
AFTER UPDATE ON invoices 
BEGIN
    UPDATE invoices SET updated_at = CURRENT_TIMESTAMP WHERE invoice_id = NEW.invoice_id;
END;

-- Trigger to update invoice remaining amount
CREATE TRIGGER update_invoice_balance 
AFTER INSERT ON payments 
BEGIN
    UPDATE invoices 
    SET paid_amount = paid_amount + NEW.amount,
        remaining_amount = total_amount - (paid_amount + NEW.amount),
        payment_status = CASE 
            WHEN (paid_amount + NEW.amount) >= total_amount THEN 'Paid'
            WHEN (paid_amount + NEW.amount) > 0 THEN 'Partial'
            ELSE 'Unpaid'
        END
    WHERE invoice_id = NEW.invoice_id;
END;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

-- Patients indexes
CREATE INDEX idx_patients_phone ON patients(phone);
CREATE INDEX idx_patients_name ON patients(full_name);

-- Appointments indexes
CREATE INDEX idx_appointments_date ON appointments(appointment_date);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_dentist ON appointments(dentist_id);

-- Treatments indexes
CREATE INDEX idx_treatments_patient ON treatments(patient_id);
CREATE INDEX idx_treatments_date ON treatments(treatment_date);

-- Invoices indexes
CREATE INDEX idx_invoices_patient ON invoices(patient_id);
CREATE INDEX idx_invoices_status ON invoices(payment_status);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);

-- Payments indexes
CREATE INDEX idx_payments_date ON payments(payment_date);
CREATE INDEX idx_payments_patient ON payments(patient_id);

-- Inventory indexes
CREATE INDEX idx_inventory_category ON inventory(category);
CREATE INDEX idx_inventory_expiry ON inventory(expiry_date);

-- ============================================
-- SAMPLE DATA INSERTION (Optional)
-- ============================================

-- Insert sample cases
INSERT INTO cases (case_name, color, price, description) VALUES 
('Full Denture', 'A1', 5000.00, 'Complete set of artificial teeth'),
('Partial Denture', 'A2', 3000.00, 'Replacement for missing teeth'),
('Implant Crown', 'B1', 2500.00, 'Crown on implant'),
('Porcelain Crown', 'C1', 1500.00, 'Porcelain crown for damaged tooth'),
('Tooth Filling', NULL, 800.00, 'Cavity filling'),
('Teeth Cleaning', NULL, 500.00, 'Professional dental cleaning'),
('Root Canal', NULL, 2000.00, 'Root canal treatment'),
('Tooth Extraction', NULL, 1000.00, 'Tooth removal'),
('Braces', NULL, 15000.00, 'Orthodontic treatment'),
('Teeth Whitening', NULL, 1200.00, 'Professional whitening treatment');

-- Insert sample staff
INSERT INTO staff (full_name, role, specialization, phone, email) VALUES 
('Dr. Ahmad Khan', 'Dentist', 'General Dentistry', '0700123456', 'ahmad@clinic.com'),
('Dr. Sara Mohammadi', 'Dentist', 'Orthodontist', '0700123457', 'sara@clinic.com'),
('Zahra Rahimi', 'Receptionist', NULL, '0700123458', 'zahra@clinic.com'),
('Ali Reza', 'Assistant', NULL, '0700123459', 'ali@clinic.com'),
('Admin User', 'Admin', NULL, '0700123460', 'admin@clinic.com');

-- Insert admin user (password: admin123)
INSERT INTO users (staff_id, username, password_hash, role) VALUES 
(5, 'admin', '$2b$12$YourHashedPasswordHere', 'Admin');

-- ============================================
-- VIEWS FOR REPORTING
-- ============================================

-- View for daily appointments
CREATE VIEW daily_appointments AS
SELECT 
    a.appointment_id,
    p.full_name AS patient_name,
    s.full_name AS dentist_name,
    a.appointment_date,
    a.appointment_time,
    a.status,
    c.case_name
FROM appointments a
JOIN patients p ON a.patient_id = p.patient_id
JOIN staff s ON a.dentist_id = s.staff_id
LEFT JOIN cases c ON a.case_id = c.case_id
WHERE a.appointment_date = DATE('now')
ORDER BY a.appointment_time;

-- View for monthly revenue
CREATE VIEW monthly_revenue AS
SELECT 
    strftime('%Y-%m', invoice_date) AS month,
    COUNT(*) AS total_invoices,
    SUM(total_amount) AS total_revenue,
    SUM(paid_amount) AS total_paid,
    SUM(remaining_amount) AS total_due
FROM invoices
GROUP BY strftime('%Y-%m', invoice_date)
ORDER BY month DESC;

-- View for patient treatment history
CREATE VIEW patient_treatment_history AS
SELECT 
    p.patient_id,
    p.full_name,
    t.treatment_date,
    c.case_name,
    t.teeth_involved,
    t.total_amount,
    s.full_name AS dentist_name
FROM patients p
JOIN treatments t ON p.patient_id = t.patient_id
JOIN cases c ON t.case_id = c.case_id
JOIN staff s ON t.dentist_id = s.staff_id
ORDER BY t.treatment_date DESC;

-- View for low inventory items
CREATE VIEW low_inventory AS
SELECT 
    item_name,
    quantity,
    reorder_level,
    unit,
    supplier
FROM inventory
WHERE quantity <= reorder_level
ORDER BY quantity ASC;

-- ============================================
-- UTILITY FUNCTIONS (SQLite Functions)
-- ============================================

-- Function to generate invoice number
-- Function to generate invoice number
-- CREATE TRIGGER generate_invoice_number 
-- BEFORE INSERT ON invoices 
-- BEGIN
--     SELECT CASE 
--         WHEN NEW.invoice_number IS NULL THEN
--             SET NEW.invoice_number = 'INV-' || strftime('%Y%m%d', 'now') || '-' || 
--                 (SELECT COUNT(*) + 1 FROM invoices WHERE strftime('%Y%m%d', invoice_date) = strftime('%Y%m%d', 'now'))
--     END;
-- END;


-- ============================================
-- FINAL MESSAGE
-- ============================================
.print '✅ Database schema created successfully!'
.print '📊 Total tables created: 12'
.print '📈 Indexes created: 10'
.print '👥 Sample data inserted for quick start'
.print ''
.print '📁 To use this database:'
.print '1. Save this file as "dental_clinic.sql"'
.print '2. Run: sqlite3 dental_clinic.db < dental_clinic.sql'
.print '3. Database will be ready with all tables and sample data'
.print ''
.print '🦷 Your dental clinic management system database is ready!'