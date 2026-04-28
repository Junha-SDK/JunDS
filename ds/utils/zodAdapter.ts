import type { FormRules } from "../hooks/useForm";

/**
 * Zod 스키마를 JunDS useForm의 FormRules로 변환
 * @example
 * const rules = zodAdapter(z.object({ name: z.string().min(1), email: z.string().email() }));
 * const form = useForm({ name: "", email: "" }, rules);
 */
export function zodAdapter<T extends Record<string, unknown>>(
  schema: { safeParse: (data: unknown) => { success: boolean; error?: { issues: { path: (string | number)[]; message: string }[] } } },
): FormRules<T> {
  const rules: FormRules<T> = {} as FormRules<T>;

  const proxy = new Proxy(rules, {
    get(_target, prop: string) {
      return [
        {
          validate: (value: unknown, allValues: T) => {
            const result = schema.safeParse({ ...allValues, [prop]: value });
            if (result.success) return true;
            const issue = result.error?.issues.find((i) => i.path[0] === prop);
            return issue?.message ?? true;
          },
        },
      ];
    },
  });

  return proxy;
}
