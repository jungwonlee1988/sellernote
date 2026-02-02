/**
 * PostgreSQL Full-Text Search 마이그레이션 스크립트
 *
 * 실행 방법:
 * npx ts-node scripts/apply-fulltext-search.ts
 *
 * 또는 Supabase SQL Editor에서 직접 실행:
 * prisma/migrations/20260201_add_fulltext_search/migration.sql 내용 복사하여 실행
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Full-Text Search 마이그레이션 시작...')

  try {
    // 1. search_vector 컬럼 추가
    console.log('1. search_vector 컬럼 추가 중...')
    await prisma.$executeRaw`
      ALTER TABLE "Course" ADD COLUMN IF NOT EXISTS "search_vector" tsvector
    `

    // 2. 검색 벡터 업데이트 함수 생성
    console.log('2. 검색 벡터 업데이트 함수 생성 중...')
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION course_search_vector_update() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector :=
          setweight(to_tsvector('simple', COALESCE(NEW.title, '')), 'A') ||
          setweight(to_tsvector('simple', COALESCE(NEW.instructor, '')), 'B') ||
          setweight(to_tsvector('simple', COALESCE(NEW.category, '')), 'B') ||
          setweight(to_tsvector('simple', COALESCE(NEW.description, '')), 'C');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql
    `

    // 3. 트리거 생성
    console.log('3. 자동 업데이트 트리거 생성 중...')
    await prisma.$executeRaw`
      DROP TRIGGER IF EXISTS course_search_vector_trigger ON "Course"
    `
    await prisma.$executeRaw`
      CREATE TRIGGER course_search_vector_trigger
        BEFORE INSERT OR UPDATE OF title, description, instructor, category
        ON "Course"
        FOR EACH ROW
        EXECUTE FUNCTION course_search_vector_update()
    `

    // 4. GIN 인덱스 생성
    console.log('4. GIN 인덱스 생성 중...')
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS course_search_vector_idx ON "Course" USING GIN (search_vector)
    `

    // 5. 기존 데이터 업데이트
    console.log('5. 기존 강의 데이터 검색 벡터 업데이트 중...')
    const result = await prisma.$executeRaw`
      UPDATE "Course" SET
        search_vector =
          setweight(to_tsvector('simple', COALESCE(title, '')), 'A') ||
          setweight(to_tsvector('simple', COALESCE(instructor, '')), 'B') ||
          setweight(to_tsvector('simple', COALESCE(category, '')), 'B') ||
          setweight(to_tsvector('simple', COALESCE(description, '')), 'C')
    `

    console.log(`✅ 마이그레이션 완료! ${result}개 강의 업데이트됨`)
    console.log('')
    console.log('📌 검색 기능 개선사항:')
    console.log('   - 제목 (가중치 A - 가장 높음)')
    console.log('   - 강사명/카테고리 (가중치 B)')
    console.log('   - 설명 (가중치 C)')
    console.log('   - 관련도 순 정렬 지원')
    console.log('   - ILIKE 폴백으로 부분 일치도 지원')

  } catch (error) {
    console.error('❌ 마이그레이션 실패:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()
