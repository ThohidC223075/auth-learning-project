type Props = {
  loading: boolean;
  text: string;
  loadingText: string;
};

export default function SubmitButton({ loading, text, loadingText }: Props) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? loadingText : text}
    </button>
  );
}