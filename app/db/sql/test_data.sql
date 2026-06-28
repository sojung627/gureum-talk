SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

SELECT * FROM users;
SELECT * FROM chat_rooms;
SELECT * FROM chat_messages;

-- 더미데이터 (사용자)
INSERT INTO users (
    user_id,
    user_login_id,
    user_name,
    user_tel,
    user_email,
    user_password_hash,
    user_created_at
) VALUES
      ('1', 'user01', '일소정', '01011111111', 'sojung01@example.com', '1234', '2026-06-26 16:35:42.183271+09'),
      ('2', 'user02', '이소정', '01022222222', 'sojung02@example.com', '1234', '2026-06-26 16:35:42.183271+09'),
      ('3', 'user03', '삼소정', '01033333333', 'sojung03@example.com', '1234', '2026-06-26 16:35:42.183271+09'),
      ('4', 'user04', '사소정', '01044444444', 'sojung04@example.com', '1234', '2026-06-26 16:35:42.183271+09'),
      ('5', 'user05', '오소정', '01055555555', 'sojung05@example.com', '1234', '2026-06-26 16:35:42.183271+09'),
      ('6', 'user06', '육소정', '01066666666', 'sojung06@example.com', '1234', '2026-06-26 16:35:42.183271+09'),
      ('7', 'user07', '칠소정', '01077777777', 'sojung07@example.com', '1234', '2026-06-26 16:35:42.183271+09'),
      ('8', 'user08', '팔소정', '01088888888', 'sojung08@example.com', '1234', '2026-06-26 16:35:42.183271+09'),
      ('9', 'user09', '구소정', '01099999999', 'sojung09@example.com', '1234', '2026-06-26 16:35:42.183271+09'),
      ('10', 'user10', '십소정', '0100000000', 'sojung10@example.com', '1234', '2026-06-26 16:35:42.183271+09');


