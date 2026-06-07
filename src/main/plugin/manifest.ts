import { z } from 'zod'
import type { PluginManifest } from '../../shared/types'

/** 插件 manifest 的 Zod 校验 schema */
export const PluginManifestSchema = z.object({
  name: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, '插件名称只能包含小写字母、数字和连字符'),
  version: z.string().min(1),
  title: z.string().min(1),
  description: z.string().default(''),
  category: z.string().min(1),
  subCategory: z.string().optional(),
  icon: z.string().optional(),
  main: z.string().min(1),
  dependencies: z.array(z.string()).optional()
})

/**
 * 校验插件 manifest 数据
 * @param data - 待校验的原始数据
 * @returns 校验结果，包含 success 标志和校验后的数据或错误信息
 */
export function validateManifest(data: unknown): {
  success: boolean
  data?: PluginManifest
  error?: string
} {
  const result = PluginManifestSchema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data as PluginManifest }
  }
  const errorMessage = result.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ')
  return { success: false, error: errorMessage }
}
