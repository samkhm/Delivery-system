
export default function WelcomeLoader({ message }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-blue-600 mb-6"></div>

      <h1 className="text-2xl font-bold">
        {message}
      </h1>

      <p className="text-gray-500 mt-2">
        Preparing everything for you...
      </p>
    </div>
  );
}