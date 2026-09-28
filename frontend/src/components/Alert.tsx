type Props = {
  type: "error" | "success";
  message: string;
};

export default function Alert({ type, message }: Props) {
  if (!message) return null;

  const styles =
    type === "error"
      ? "bg-red-50 text-red-700 border-red-200"
      : "bg-green-50 text-green-700 border-green-200";

  return <div className={`border rounded px-3 py-2 text-sm mb-4 ${styles}`}>{message}</div>;
}