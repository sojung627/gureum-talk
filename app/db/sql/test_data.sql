SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

SELECT * FROM users;
SELECT * FROM chat_rooms;
SELECT * FROM chat_messages;

-- 더미데이터 (사용자)
-- 비밀번호: t1234
INSERT INTO users (
                   user_login_id,
                   user_name,
                   user_tel,
                   user_email,
                   user_password_hash
) VALUES
       ('user01', '김민준', '010-1111-0001', 'user01@example.com', '$2b$12$ZwWQshVhWvlMaXHE2/yLveKwg8lf.lUUdBLX6cmUq0unNhJtp2oIm'),
       ('user02', '이서연', '010-1111-0002', 'user02@example.com', '$2b$12$2fWl4jnDH0EU.kag/s6iEet0gctYk4M4pnKKyL0TAQuwHyxu2xSuC'),
       ('user03', '박지호', '010-1111-0003', 'user03@example.com', '$2b$12$2wUSnS3ysQdN/KAm8jHV5ur2hZ2MFbwuZXh8NViCdW4kOEz1ckKdW'),
       ('user04', '최수아', '010-1111-0004', 'user04@example.com', '$2b$12$xv9G7nrzKLrdW53cprzRSO6W8QdC5HB28FyKpXW/6mdGigwrYOjsS'),
       ('user05', '정도윤', '010-1111-0005', 'user05@example.com', '$2b$12$C.20.9/BglcRTrLqlTyqOuSBhjk7dBk9FP5ywWKx/ej5BhX8i/f06'),
       ('user06', '강하은', '010-1111-0006', 'user06@example.com', '$2b$12$9ncIxvKwAFnGxG0Bvs1WG.0qvRZdgxHsXEou2LkoABJ9k5cOTYowO'),
       ('user07', '윤시우', '010-1111-0007', 'user07@example.com', '$2b$12$9K/Ruol2JV8LTtfhFZJ4EuTT1K.EWeIz5WMoqFm0TP1vp.AzVyAyW'),
       ('user08', '임채원', '010-1111-0008', 'user08@example.com', '$2b$12$K/WIq7e99DsZBHnD6Mi7e.3t9T0ozMiEmG33g0tCae4H0bfOnQeca'),
       ('user09', '한지유', '010-1111-0009', 'user09@example.com', '$2b$12$3ah1BMDtjf314rQ9/juv.e3JqQ6wy2ErIL4Ylbj7qehSXE/xxrTAu'),
       ('user10', '오준서', '010-1111-0010', 'user10@example.com', '$2b$12$dintpIZFNvo2x2reSNG3ruiuzoOOjryPmVV//L.q2RNE/9Y202DDe');

