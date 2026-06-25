-- ============================================================
-- Migration: Daily reset → Weekly reset (Monday), 10 → 30 limit
-- ============================================================

-- 1. Update pg_cron job: daily → weekly (Monday midnight MMT = Sunday 17:30 UTC)
SELECT cron.unschedule('daily-reset-midnight-mmt');

SELECT cron.schedule(
  'weekly-reset-monday-mmt',
  '30 17 * * 0',  -- Every Sunday at 17:30 UTC = Monday 00:00 MMT
  $$DELETE FROM song_requests;$$
);

-- 2. Update cleanup function: delete rows from previous WEEKS (before this Monday MMT)
CREATE OR REPLACE FUNCTION cleanup_old_requests()
RETURNS TRIGGER AS $$
DECLARE
  mmt_now TIMESTAMP;
  week_start DATE;
  week_start_utc TIMESTAMPTZ;
BEGIN
  -- Current time in MMT
  mmt_now := (NOW() AT TIME ZONE 'Asia/Yangon');

  -- This Monday's date in MMT (dow: 0=Sun,1=Mon,...,6=Sat)
  week_start := DATE(mmt_now) - ((EXTRACT(DOW FROM mmt_now)::int + 6) % 7);

  -- Convert Monday midnight MMT back to UTC
  week_start_utc := (week_start::timestamp AT TIME ZONE 'Asia/Yangon');

  DELETE FROM song_requests
  WHERE created_at < week_start_utc;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Update IP limit function: keep 1/IP/day, change global to 30/week
CREATE OR REPLACE FUNCTION check_ip_limit()
RETURNS TRIGGER AS $$
DECLARE
  mmt_now TIMESTAMP;
  today_mmt DATE;
  week_start DATE;
  week_start_utc TIMESTAMPTZ;
  ip_count INTEGER;
  total_count INTEGER;
BEGIN
  -- Current time in MMT
  mmt_now := (NOW() AT TIME ZONE 'Asia/Yangon');
  today_mmt := DATE(mmt_now);

  -- This Monday's date in MMT
  week_start := today_mmt - ((EXTRACT(DOW FROM mmt_now)::int + 6) % 7);
  week_start_utc := (week_start::timestamp AT TIME ZONE 'Asia/Yangon');

  -- Check if this IP already submitted today (MMT) — still daily per-IP
  SELECT COUNT(*) INTO ip_count
  FROM song_requests
  WHERE ip_address = NEW.ip_address
    AND DATE(created_at AT TIME ZONE 'Asia/Yangon') = today_mmt;

  IF ip_count > 0 THEN
    RAISE EXCEPTION 'You have already submitted a request today. Come back tomorrow!';
  END IF;

  -- Check weekly global limit (30 per week)
  SELECT COUNT(*) INTO total_count
  FROM song_requests
  WHERE created_at >= week_start_utc;

  IF total_count >= 30 THEN
    RAISE EXCEPTION 'Weekly limit of 30 requests reached. Try again next week!';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
