<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-05-22 | Updated: 2026-05-22 -->

# core/src/vfs

## Purpose
가상 파일시스템(VFS) 모듈. 플러그어블 어댑터 패턴으로 메모리, LocalStorage 등 다양한 스토리지 백엔드를 지원한다. `@windeath44/core/vfs` subpath로 export. 상세 API: `packages/core/docs/vfs.md`.

## Key Files

| File | Description |
|------|-------------|
| `VFSProvider.tsx` | VFS Context + Provider |
| `path.ts` | 파일 경로 유틸리티 (join, dirname, basename 등) |
| `index.ts` | public API: VFSProvider, useFS, MemoryAdapter, LocalStorageAdapter |
| `types.ts` | FSAdapter, FileEntry 타입 |
| `README.md` | VFS 사용 가이드 |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `adapters/` | `MemoryAdapter.ts` (테스트용), `LocalStorageAdapter.ts` (브라우저 영속성) |
| `VFSTest/` | 단위 테스트 |

## For AI Agents

### Working In This Directory
- `LocalStorageAdapter`와 `IndexedDBAdapter`는 서버 환경(SSR)에서 instantiate 금지 — `isBrowser()` 가드 필수.
- 새 어댑터 추가 시 `FSAdapter` 인터페이스를 구현.

<!-- MANUAL: -->
