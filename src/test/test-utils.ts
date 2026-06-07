import { Database, initAdapter } from './sqlite-adapter'
import { runMigrations } from '../main/database/migration'
import { beforeAll, beforeEach, afterEach, vi } from 'vitest'

/**
 * 模拟 getDatabase 返回内存数据库实例
 * 所有 Repository 测试文件统一使用此 mock
 */
vi.mock('../main/database/database', () => ({
  getDatabase: () => globalThis.__testDb
}))

declare global {
  /** 全局测试数据库实例 */
  var __testDb: Database
}

/** 当前测试用内存数据库实例 */
let db: Database

/**
 * 初始化 sql.js WASM 引擎
 * 在所有测试开始前执行一次
 */
beforeAll(async () => {
  await initAdapter()
})

/**
 * 每个测试前创建内存数据库并执行迁移
 * 确保每个测试在干净的数据库环境中运行
 */
beforeEach(() => {
  db = new Database(':memory:')
  db.pragma('foreign_keys = ON')
  runMigrations(db as any)
  globalThis.__testDb = db
})

/**
 * 每个测试后关闭数据库连接
 * 释放内存资源，避免测试间相互影响
 */
afterEach(() => {
  db.close()
})

/**
 * 动态导入 Repository 模块
 * 确保 mock 生效后再加载模块，避免导入时数据库未初始化
 * @param path - 相对于 test 目录的模块路径
 * @returns 导入的模块对象
 */
export async function importRepo<T>(path: string): Promise<T> {
  return import(path) as Promise<T>
}
