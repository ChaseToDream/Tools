import type Database from 'better-sqlite3'

/** 数据库建表 SQL 语句列表 */
const MIGRATIONS: string[] = [
  /** 键值对存储用户配置 */
  `CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  /** 插件安装记录 */
  `CREATE TABLE IF NOT EXISTS plugins (
    name TEXT PRIMARY KEY,
    version TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    category TEXT DEFAULT '其他',
    sub_category TEXT DEFAULT '',
    icon TEXT DEFAULT '',
    main TEXT NOT NULL,
    source TEXT DEFAULT 'local',
    enabled INTEGER DEFAULT 1,
    installed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,

  /** 工具收藏 */
  `CREATE TABLE IF NOT EXISTS favorites (
    plugin_name TEXT PRIMARY KEY,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (plugin_name) REFERENCES plugins(name)
  )`,

  /** 插件使用记录 */
  `CREATE TABLE IF NOT EXISTS recent_usage (
    plugin_name TEXT PRIMARY KEY,
    use_count   INTEGER NOT NULL DEFAULT 1,
    last_used_at TEXT NOT NULL
  )`,

  /** 插件配置存储 */
  `CREATE TABLE IF NOT EXISTS plugin_config (
    plugin_name TEXT NOT NULL,
    config_key  TEXT NOT NULL,
    config_value TEXT NOT NULL,
    PRIMARY KEY (plugin_name, config_key)
  )`
]

/**
 * 执行数据库迁移，创建所有必要的表
 * @param db - better-sqlite3 数据库实例
 */
export function runMigrations(db: Database.Database): void {
  for (const sql of MIGRATIONS) {
    db.exec(sql)
  }
}
