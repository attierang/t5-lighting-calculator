# Supabase 연동 설정 가이드

## 현재 상태
현재 애플리케이션은 이미 Supabase에 연동되어 있으며, 다음 설정으로 작동하고 있습니다:

- **프로젝트 URL**: https://upphgbtjbdsutfmexvqx.supabase.co
- **프로젝트 ID**: upphgbtjbdsutfmexvqx
- **Public Anon Key**: (자동 설정됨)

## 1. 새로운 Supabase 프로젝트 설정 (선택사항)

새로운 Supabase 프로젝트를 만들고 연동하려면:

### 1.1 Supabase 프로젝트 생성
1. [Supabase 대시보드](https://supabase.com/dashboard)에 접속
2. "New Project" 클릭
3. 조직 선택 또는 새로 생성
4. 프로젝트 이름 입력 (예: "lighting-calculator")
5. 데이터베이스 비밀번호 설정
6. 지역 선택 (Korea Northeast 권장)
7. "Create new project" 클릭

### 1.2 프로젝트 정보 확인
프로젝트가 생성되면 Settings > API에서 다음 정보를 확인:
- Project URL
- Project API keys (anon, public)

## 2. 데이터베이스 테이블 설정

현재 애플리케이션은 `kv_store_d6aea025` 테이블을 사용합니다. 

### 2.1 SQL 에디터에서 테이블 생성
Supabase 대시보드 > SQL Editor에서 다음 쿼리 실행:

```sql
CREATE TABLE kv_store_d6aea025 (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

### 2.2 테이블 권한 설정
```sql
-- 익명 사용자가 읽기/쓰기할 수 있도록 권한 부여
ALTER TABLE kv_store_d6aea025 ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for everyone" ON kv_store_d6aea025
FOR ALL USING (true) WITH CHECK (true);
```

## 3. 애플리케이션 설정 업데이트

### 3.1 환경 변수 설정 (서버용)
Edge Functions에서 사용되는 환경 변수들이 자동으로 설정되어 있습니다:
- `SUPABASE_URL`: 프로젝트 URL
- `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key (서버에서만 사용)

### 3.2 클라이언트 설정
`/utils/supabase/info.tsx` 파일에 프로젝트 정보가 설정되어 있습니다:

```typescript
export const projectId = "upphgbtjbdsutfmexvqx"
export const publicAnonKey = "여기에_실제_키가_들어감"
```

## 4. 기능 테스트

### 4.1 기본 연결 테스트
1. 브라우저에서 애플리케이션 열기
2. 조명 길이 입력 후 "최적 조합 계산" 클릭
3. 결과가 나오면 "결과 저장" 버튼 클릭
4. "공유 링크 복사" 버튼이 나타나면 연동 성공

### 4.2 데이터베이스 확인
Supabase 대시보드 > Table Editor > `kv_store_d6aea025` 테이블에서 저장된 데이터 확인

## 5. 문제 해결

### 5.1 연결 오류
- 프로젝트 URL과 API 키가 정확한지 확인
- 테이블이 올바르게 생성되었는지 확인
- RLS 정책이 적용되었는지 확인

### 5.2 권한 오류
- 테이블에 RLS 정책이 올바르게 설정되었는지 확인
- Service Role Key가 환경 변수에 올바르게 설정되었는지 확인

### 5.3 데이터 저장 오류
브라우저 개발자 도구 > Network 탭에서 API 요청 상태 확인:
- `/make-server-d6aea025/save-calculation` 요청이 200 상태인지 확인
- 오류 메시지가 있다면 콘솔에서 확인

## 6. 현재 사용 중인 API 엔드포인트

- **계산 결과 저장**: `POST /make-server-d6aea025/save-calculation`
- **계산 결과 조회**: `GET /make-server-d6aea025/get-calculation/:id`
- **최근 계산 목록**: `GET /make-server-d6aea025/recent-calculations`
- **상태 확인**: `GET /make-server-d6aea025/health`

## 7. 보안 고려사항

- Public Anon Key는 클라이언트에서 안전하게 사용 가능
- Service Role Key는 절대 클라이언트에 노출하면 안됨
- RLS 정책을 통해 데이터 접근 제어
- 현재 설정으로는 누구나 데이터를 읽고 쓸 수 있음 (프로토타입용)

## 8. 운영 환경 배포 시 고려사항

- 더 엄격한 RLS 정책 적용
- 사용자 인증 시스템 도입
- 데이터 유효성 검사 강화
- 저장 용량 제한 설정