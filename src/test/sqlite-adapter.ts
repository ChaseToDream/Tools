import initSqlJs from 'sql.js'

/** sql.js 引擎单例 */
let SQL: any

/**
 * 初始化 sql.js WASM 引擎（只需调用一次）
 */
export async function initAdapter(): Promise<void> {
  if (!SQL) {
    SQL = await initSqlJs()
  }
}

/**
 * 兼容 better-sqlite3 Database API 的适配器
 * 内部使用 sql.js（纯 WASM 实现）替代原生模块，避免 Node.js 版本不兼容问题
 */
export class Database {
  private db: any

  constructor(_path: string) {
    if (!SQL) throw new Error('请先调用 initAdapter() 初始化 sql.js')
    this.db = new SQL.Database()
  }

  /**
   * 执行 PRAGMA 命令
   * @param str - PRAGMA 语句（不含 PRAGMA 前缀）
   */
  pragma(str: string): void {
    this.db.run(`PRAGMA ${str}`)
  }

  /**
   * 执行原始 SQL 语句（用于 DDL 等）
   * @param sql - SQL 语句
   */
  exec(sql: string): void {
    this.db.run(sql)
  }

  /**
   * 创建预编译语句
   * @param sql - 带参数占位符的 SQL 语句
   * @returns 兼容 better-sqlite3 Statement API 的对象
   */
  prepare(sql: string): Statement {
    return new Statement(this.db, sql)
  }

  /**
   * 关闭数据库连接
   */
  close(): void {
    this.db.close()
  }
}

/**
 * 兼容 better-sqlite3 Statement API 的预编译语句适配器
 * 每次调用 get/run/all 时重新 prepare，因为 sql.js 的 statement 只能遍历一次
 */
class Statement {
  constructor(private db: any, private sql: string) {}

  /**
   * 执行查询并返回第一行结果
   * @param params - 绑定参数（位置参数或命名参数对象）
   * @returns 匹配的行对象，无结果时返回 undefined
   */
  get(...params: any[]): any {
    const stmt = this.db.prepare(this.sql)
    this.bindParams(stmt, params)
    let result: any = undefined
    if (stmt.step()) {
      result = stmt.getAsObject()
    }
    stmt.free()
    return result
  }

  /**
   * 执行写操作（INSERT/UPDATE/DELETE）
   * @param params - 绑定参数（位置参数或命名参数对象）
   * @returns 包含影响行数的对象
   */
  run(...params: any[]): { changes: number } {
    const stmt = this.db.prepare(this.sql)
    this.bindParams(stmt, params)
    stmt.step()
    const changes = this.db.getRowsModified()
    stmt.free()
    return { changes }
  }

  /**
   * 执行查询并返回所有匹配行
   * @param params - 绑定参数（位置参数或命名参数对象）
   * @returns 行对象数组
   */
  all(...params: any[]): any[] {
    const stmt = this.db.prepare(this.sql)
    this.bindParams(stmt, params)
    const results: any[] = []
    while (stmt.step()) {
      results.push(stmt.getAsObject())
    }
    stmt.free()
    return results
  }

  /**
   * 将参数绑定到 sql.js 预编译语句
   * better-sqlite3 命名参数用 {name: value} 绑定 @name，
   * sql.js 需要 {@name: value}，因此自动添加 @ 前缀
   * @param stmt - sql.js 预编译语句
   * @param params - 原始参数数组
   */
  private bindParams(stmt: any, params: any[]): void {
    if (params.length === 1 && typeof params[0] === 'object' && !Array.isArray(params[0])) {
      const converted: Record<string, any> = {}
      for (const [key, value] of Object.entries(params[0])) {
        converted[`@${key}`] = value
      }
      stmt.bind(converted)
    } else {
      stmt.bind(params)
    }
  }
}
