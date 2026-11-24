// ESLint 설정 (flat config). 규칙을 바꾸면 CLAUDE.md의 "코드 작성 규칙"과 맞는지 확인합니다.
import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/dist', '**/node_modules', 'mockup/**', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // 사용하지 않는 인자는 _로 시작하면 허용 (예: Express 오류 처리기의 _next)
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['apps/web/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    // 테스트는 일부러 잘못된 데이터를 만들기 위해 any를 허용
    files: ['**/*.test.{ts,tsx}'],
    rules: { '@typescript-eslint/no-explicit-any': 'off' },
  },
  {
    files: ['apps/server/**/*.ts', 'scripts/**/*.mjs', '*.js', '*.config.{js,ts}'],
    languageOptions: { globals: globals.node },
  },
);
