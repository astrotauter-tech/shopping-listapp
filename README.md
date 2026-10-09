# 🛒 쇼핑 리스트

아이템 추가·삭제·체크 기능이 있는 간단한 쇼핑 리스트 웹 앱입니다. HTML/CSS/JavaScript와 [Supabase](https://supabase.com)로 만들었습니다.

🌐 **바로 사용하기:** https://astrotauter-tech.github.io/shopping-listapp/

## 기능

- **추가**: 입력 후 Enter 또는 "추가" 버튼 (빈 입력은 무시, 앞뒤 공백 자동 제거)
- **체크**: 체크박스로 구매 완료 표시 (취소선)
- **삭제**: 각 항목의 ✕ 버튼
- **구매 완료 항목 지우기**: 체크된 항목을 한 번에 삭제
- **클라우드 저장**: Supabase 데이터베이스(`shopping_items` 테이블)에 저장
- **방문자별 개인 목록**: Supabase 익명 로그인 + RLS로 각 브라우저는 자기 목록만 보고 수정

## 실행 방법

`index.html`을 브라우저로 열거나 로컬 서버로 실행하세요.

```bash
npx http-server
```

Supabase 프로젝트에서 **Authentication → Sign In / Providers → Anonymous sign-ins**가 켜져 있어야 합니다.

## 데이터베이스

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `id` | uuid | 기본 키 |
| `user_id` | uuid | 항목 주인 (`auth.uid()` 기본값) |
| `name` | text | 아이템 이름 (1~100자) |
| `done` | boolean | 구매 완료 여부 |
| `created_at` | timestamptz | 생성 시각 (정렬 기준) |

RLS 정책으로 로그인한 사용자는 `user_id`가 자신인 행만 조회·추가·수정·삭제할 수 있습니다.

## 파일 구성

| 파일 | 역할 |
|---|---|
| `index.html` | 화면 구조 |
| `style.css` | 디자인 |
| `app.js` | 추가·삭제·체크 기능, Supabase 연동 |
