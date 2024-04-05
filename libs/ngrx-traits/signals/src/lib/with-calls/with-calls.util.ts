export function getWithCallKeys({
  callName,
  resultProp = `${callName}Result`,
}: {
  callName: string;
  resultProp?: string;
}) {
  return {
    callNameKey: callName,
    resultPropKey: resultProp,
  };
}
