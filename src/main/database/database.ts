import { app } from 'electron'
import { join } from 'path'
import Database from 'better-sqlite3'
import { runMigrations } from './migration'

/** 数据库单例实例 */
let db: Database.Database | null = null

/**
 * 获取数据库文件路径（用户数据目录/tools.db）
 * @returns 数据库文件的绝对路径
 */
function getDbPath(): string {
  return join(app.getPath('userData'), 'tools.db')
}

/**
 * 初始化数据库连接并执行迁移
 * 单例模式：多次调用返回同一实例
 * @returns 数据库实例
 */
export function initDatabase(): Database.Database {
  if (db) return db

  const dbPath = getDbPath()
  db = new Database(dbPath)

  /** 开启 WAL 模式，提升并发读写性能 */
  db.pragma('journal_mode = WAL')
  /** 开启外键约束 */
  db.pragma('foreign_keys = ON')

  runMigrations(db)

  return db
}

/**
 * 获取当前数据库实例
 * @returns 数据库实例，未初始化时抛出异常
 */
export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('数据库未初始化，请先调用 initDatabase()')
  }
  return db
}

/**
 * 关闭数据库连接并释放单例引用
 */
export function closeDatabase(): void {
  if (db) {
    db.close()
    db = null
  }
}
