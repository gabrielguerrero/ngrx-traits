export function getWithCallKeys({
  callName,
  resultProp = `${callName}Data`,
}: {
  callName: string;
  resultProp?: string;
}) {
  return {
    callNameKey: callName,
    resultPropKey: resultProp,
  };
}
