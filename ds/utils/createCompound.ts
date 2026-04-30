/**
 * createCompound — attach sub-component members to a root component.
 *
 * Standardises the JunDS compound pattern. Replaces inline `Object.assign(...)`
 * boilerplate so every compound component exposes its members in a consistent,
 * type-safe way.
 *
 * @example
 *   const Card = createCompound(CardRoot, {
 *     Header: CardHeader,
 *     Body: CardBody,
 *     Footer: CardFooter,
 *   });
 *
 *   <Card>
 *     <Card.Header>Title</Card.Header>
 *     <Card.Body>Body</Card.Body>
 *   </Card>
 *
 * The returned value is the root component augmented with the members object,
 * so existing call sites that use the root directly (`<Card>`) keep working.
 */
export function createCompound<
  Root extends object,
  Members extends Record<string, unknown>,
>(root: Root, members: Members): Root & Members {
  return Object.assign(root, members);
}
