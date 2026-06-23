-- ============================================================================
--  TSID Migration 00 — Extensions & Custom Types
--  Run this FIRST in the Supabase SQL Editor.
--
--  Sets up the cryptographic extension and all ENUM types
--  used throughout the TSID system.
-- ============================================================================

-- ── Cryptographic extension ───────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Custom ENUM types ─────────────────────────────────────────────────────────

-- User roles (admin is the bootstrap role that creates everything)
CREATE TYPE user_role AS ENUM ('admin', 'gov', 'school', 'student');

-- Account status
CREATE TYPE account_status AS ENUM ('active', 'inactive', 'suspended');

-- Application lifecycle
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected');

-- Payment lifecycle
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'cancelled');

-- Payment methods used in Tanzania
CREATE TYPE payment_method AS ENUM ('M-Pesa', 'Tigo Pesa', 'Airtel Money', 'Bank Transfer', 'Cash', 'Halopesa', 'AzamPay');

-- Letter urgency
CREATE TYPE letter_urgency AS ENUM ('normal', 'urgent', 'very_urgent');

-- Letter status
CREATE TYPE letter_status AS ENUM ('pending', 'approved', 'rejected', 'issued');

-- School types
CREATE TYPE school_type AS ENUM ('Primary School', 'Secondary School', 'University / College', 'Vocational Training', 'Special Needs School');

-- Gender
CREATE TYPE gender_type AS ENUM ('Male', 'Female');