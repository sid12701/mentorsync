-- supabase/migrations/20260129110604_initial_schema.sql

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Custom types
CREATE TYPE user_role AS ENUM ('student', 'tutor');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');

-- =====================================================
-- PROFILES TABLE
-- =====================================================
-- Stores user information for both students and tutors
-- Extends Supabase auth.users table with application-specific fields

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Common fields
  role user_role NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  
  -- Tutor-specific fields (NULL for students)
  bio TEXT CHECK (char_length(bio) <= 500),
  subjects TEXT[], -- Array of subjects taught
  hourly_rate DECIMAL(10, 2) CHECK (hourly_rate >= 10 AND hourly_rate <= 500),
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ, -- Soft delete
  
  -- Constraints
  CONSTRAINT tutor_fields_required 
    CHECK (
      (role = 'student') OR 
      (role = 'tutor' AND bio IS NOT NULL AND subjects IS NOT NULL AND hourly_rate IS NOT NULL)
    )
);

-- Indexes
CREATE INDEX idx_profiles_role ON profiles(role) WHERE deleted_at IS NULL;
CREATE INDEX idx_profiles_subjects ON profiles USING GIN(subjects) WHERE role = 'tutor';

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- AVAILABILITY_PATTERNS TABLE
-- =====================================================
-- Defines recurring weekly availability for tutors
-- Stored in tutor's local timezone for clarity

CREATE TABLE availability_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Pattern definition
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  
  -- Pattern control
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_time_range CHECK (end_time > start_time)
  -- Note: tutor_must_be_tutor constraint removed (can't use subqueries in CHECK)
  -- This will be enforced by RLS policies instead
);

-- Indexes
CREATE INDEX idx_patterns_tutor_day ON availability_patterns(tutor_id, day_of_week) 
  WHERE is_active = TRUE;

-- Trigger for updated_at
CREATE TRIGGER update_patterns_updated_at
  BEFORE UPDATE ON availability_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger to enforce tutor role (replaces CHECK constraint)
CREATE OR REPLACE FUNCTION check_tutor_role()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = NEW.tutor_id AND role = 'tutor'
  ) THEN
    RAISE EXCEPTION 'tutor_id must reference a user with role tutor';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_tutor_role
  BEFORE INSERT OR UPDATE ON availability_patterns
  FOR EACH ROW
  EXECUTE FUNCTION check_tutor_role();

-- =====================================================
-- BOOKINGS TABLE
-- =====================================================
-- Stores scheduled sessions between tutors and students
-- CRITICAL: EXCLUDE constraint prevents double-booking via race condition protection

CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participants
  tutor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  
  -- Timing (stored in UTC)
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  
  -- Booking details
  status booking_status NOT NULL DEFAULT 'pending',
  price DECIMAL(10, 2) NOT NULL,
  meeting_url TEXT NOT NULL,
  student_note TEXT,
  
  -- Cancellation tracking
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES profiles(id),
  cancellation_reason TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_booking_time CHECK (end_time > start_time),
  CONSTRAINT different_participants CHECK (tutor_id != student_id)
  -- Note: role validation constraints removed (can't use subqueries in CHECK)
  -- These will be enforced by triggers instead
);

-- Trigger to enforce student role
CREATE OR REPLACE FUNCTION check_booking_roles()
RETURNS TRIGGER AS $$
BEGIN
  -- Check student role
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = NEW.student_id AND role = 'student'
  ) THEN
    RAISE EXCEPTION 'student_id must reference a user with role student';
  END IF;
  
  -- Check tutor role
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = NEW.tutor_id AND role = 'tutor'
  ) THEN
    RAISE EXCEPTION 'tutor_id must reference a user with role tutor';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER enforce_booking_roles
  BEFORE INSERT OR UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION check_booking_roles();

-- ⚡ CRITICAL: Prevent double-booking with EXCLUDE constraint
CREATE INDEX idx_bookings_tutor_time_gist ON bookings 
  USING GIST (tutor_id, tstzrange(start_time, end_time))
  WHERE status != 'cancelled';

ALTER TABLE bookings
  ADD CONSTRAINT no_double_booking
  EXCLUDE USING GIST (
    tutor_id WITH =,
    tstzrange(start_time, end_time) WITH &&
  ) WHERE (status != 'cancelled');

-- Performance indexes
CREATE INDEX idx_bookings_tutor_time ON bookings(tutor_id, start_time) 
  WHERE status != 'cancelled';
CREATE INDEX idx_bookings_student ON bookings(student_id, start_time);
CREATE INDEX idx_bookings_status ON bookings(status);

-- Trigger for updated_at
CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public can view tutor profiles"
  ON profiles FOR SELECT
  USING (role = 'tutor' AND deleted_at IS NULL);

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- AVAILABILITY_PATTERNS POLICIES
CREATE POLICY "Public can view availability patterns"
  ON availability_patterns FOR SELECT
  USING (TRUE);

CREATE POLICY "Tutors can insert own patterns"
  ON availability_patterns FOR INSERT
  WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Tutors can update own patterns"
  ON availability_patterns FOR UPDATE
  USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can delete own patterns"
  ON availability_patterns FOR DELETE
  USING (auth.uid() = tutor_id);

-- BOOKINGS POLICIES
CREATE POLICY "Participants can view bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = tutor_id OR auth.uid() = student_id);

CREATE POLICY "Students can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (
    auth.uid() = student_id AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'student')
  );

CREATE POLICY "Participants can update bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = tutor_id OR auth.uid() = student_id);