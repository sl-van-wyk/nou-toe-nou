export default function Loading() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <div className="m-auto flex items-center space-x-4">
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce"></div>
      </div>
    </div>
  )
} 